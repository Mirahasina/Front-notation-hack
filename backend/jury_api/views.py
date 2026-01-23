from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.db.models import Sum, Q
from django.utils import timezone
from django.core.cache import cache
from .models import User, Criterion, Team, TeamScore, Event
from .serializers import (
    UserSerializer, LoginSerializer, CriterionSerializer,
    TeamSerializer, TeamScoreSerializer, TeamResultSerializer,
    EventSerializer
)
from .utils import log_action


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class IsJury(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'jury'


class IsTeam(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'team'


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def logout_view(request):
    if request.user.is_authenticated:
        try:
            request.user.auth_token.delete()
        except:
            pass
    return Response({'message': 'Logged out successfully'})


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [IsAdmin]
        return [permission() for permission in permission_classes]


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    def get_permissions(self):
        if self.action == 'list':
            return [permissions.AllowAny()]
        if self.action == 'retrieve':
            return [permissions.IsAuthenticated()]
        return [IsAdmin()]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        role = self.request.query_params.get('role')
        event_id = self.request.query_params.get('event_id')
        if role:
            queryset = queryset.filter(role=role)
        if event_id:
            queryset = queryset.filter(event_id=event_id)
        return queryset


class CriterionViewSet(viewsets.ModelViewSet):
    queryset = Criterion.objects.all()
    serializer_class = CriterionSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [IsAdmin]
        return [permission() for permission in permission_classes]
        
    def get_queryset(self):
        queryset = super().get_queryset()
        event_id = self.request.query_params.get('event_id')
        if event_id:
            queryset = queryset.filter(event_id=event_id)
        return queryset

    def clear_results_cache(self, event_id):
        if event_id:
            cache.delete(f'results_{event_id}')

    def perform_create(self, serializer):
        instance = serializer.save()
        self.clear_results_cache(instance.event_id)
        log_action(self.request.user, "CREATE", "Criterion", instance.id, serializer.data)

    def perform_update(self, serializer):
        instance = serializer.save()
        self.clear_results_cache(instance.event_id)
        log_action(self.request.user, "UPDATE", "Criterion", instance.id, serializer.data)

    def perform_destroy(self, instance):
        id = instance.id
        event_id = instance.event_id
        name = instance.name
        instance.delete()
        self.clear_results_cache(event_id)
        log_action(self.request.user, "DELETE", "Criterion", id, {"name": name})


class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'partial_update']:
            return [permissions.AllowAny()]
        else:
            permission_classes = [IsAdmin]
            return [permission() for permission in permission_classes]
        
    @action(detail=False, methods=['post'], permission_classes=[IsAdmin])
    def bulk_create(self, request):
        teams_data = request.data.get('teams', [])
        event_id = request.data.get('event_id')
        
        if not event_id:
            return Response({'error': 'event_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        created_teams = []
        for team_data in teams_data:
            team_data['event'] = event_id
            serializer = self.get_serializer(data=team_data)
            if serializer.is_valid():
                serializer.save()
                created_teams.append(serializer.data)
            else:
                pass
                
        return Response({'created_count': len(created_teams), 'teams': created_teams}, status=status.HTTP_201_CREATED)

    def get_queryset(self):
        queryset = super().get_queryset()
        event_id = self.request.query_params.get('event_id')
        generated_email = self.request.query_params.get('generated_email')
        
        if event_id:
            queryset = queryset.filter(event_id=event_id)
        if generated_email:
            queryset = queryset.filter(generated_email__iexact=generated_email)
            
        return queryset


class TeamScoreViewSet(viewsets.ModelViewSet):
    queryset = TeamScore.objects.all()
    serializer_class = TeamScoreSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        jury_id = self.request.query_params.get('jury_id')
        team_id = self.request.query_params.get('team_id')
        event_id = self.request.query_params.get('event_id')
        
        if jury_id:
            queryset = queryset.filter(jury_id=jury_id)
        if team_id:
            queryset = queryset.filter(team_id=team_id)
        if event_id:
            queryset = queryset.filter(event_id=event_id)
        
        if self.request.user.is_authenticated and self.request.user.role == 'jury':
            queryset = queryset.filter(jury=self.request.user)
        
        return queryset
    
    def clear_results_cache(self, event_id):
        if event_id:
            cache.delete(f'results_{event_id}')

    def perform_create(self, serializer):
        instance = serializer.save()
        self.clear_results_cache(instance.event_id)
        if self.request.user.role == 'jury':
            serializer.save(jury=self.request.user)
        else:
            serializer.save()
    
    def perform_update(self, serializer):
        instance = serializer.save()
        self.clear_results_cache(instance.event_id)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.locked:
            return Response(
                {'error': 'Cannot modify locked scores'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    def lock(self, request, pk=None):
        """Lock the score permanently"""
        team_score = self.get_object()
        if team_score.locked:
            return Response({'error': 'Already locked'}, status=status.HTTP_400_BAD_REQUEST)
        
        team_score.locked = True
        team_score.submitted_at = timezone.now()
        team_score.save()
        
        self.clear_results_cache(team_score.event_id)
        
        log_action(request.user, "LOCK", "TeamScore", team_score.id, {"team": team_score.team.name})
        
        serializer = self.get_serializer(team_score)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def reset(self, request, pk=None):
        """Reset (unlock and clear) the score - Admin only"""
        team_score = self.get_object()
        old_data = {
            "scores": team_score.scores,
            "locked": team_score.locked
        }
        team_score.locked = False
        team_score.scores = {}
        team_score.criterion_comments = {}
        team_score.global_comments = ""
        team_score.submitted_at = None
        team_score.save()
        
        self.clear_results_cache(team_score.event_id)
        
        log_action(request.user, "RESET", "TeamScore", team_score.id, old_data)
        
        serializer = self.get_serializer(team_score)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def results_view(request):
    """Calculate and return final results for an event"""
    event_id = request.query_params.get('event_id')
    if not event_id:
        return Response({'error': 'event_id parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
    cache_key = f'results_{event_id}'
    cached_data = cache.get(cache_key)
    if cached_data:
        return Response(cached_data)

    teams = Team.objects.filter(event_id=event_id)
    juries = User.objects.filter(role='jury', event_id=event_id)
    criteria = Criterion.objects.filter(event_id=event_id)
    
    results = []
    for team in teams:
        team_result = {
            'team_id': team.id,
            'team_name': team.name,
            'total_score': 0,
            'jury_scores': []
        }
        
        for jury in juries:
            try:
                team_score = TeamScore.objects.get(jury=jury, team=team, event_id=event_id)
                scores_dict = team_score.scores
                jury_total = sum(scores_dict.values())
                
                team_result['jury_scores'].append({
                    'jury_id': jury.id,
                    'jury_name': jury.username,
                    'scores': scores_dict,
                    'total': jury_total
                })
                team_result['total_score'] += jury_total
            except TeamScore.DoesNotExist:
                team_result['jury_scores'].append({
                    'jury_id': jury.id,
                    'jury_name': jury.username,
                    'scores': {},
                    'total': 0
                })
        
        results.append(team_result)
    
    # Sort by total score descending
    results.sort(key=lambda x: x['total_score'], reverse=True)
    
    cache.set(cache_key, results, 300) # Cache for 5 minutes
    return Response(results)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_completion_view(request):
    """Check if all teams have been scored by all juries for an event"""
    event_id = request.query_params.get('event_id')
    if not event_id:
        return Response({'error': 'event_id parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

    teams_count = Team.objects.filter(event_id=event_id).count()
    juries_count = User.objects.filter(role='jury', event_id=event_id).count()
    
    if teams_count == 0 or juries_count == 0:
        return Response({
            'all_complete': False,
            'teams_count': teams_count,
            'juries_count': juries_count,
            'scores_count': 0,
            'required_scores': 0
        })
    
    required_scores = teams_count * juries_count
    completed_scores = TeamScore.objects.filter(locked=True, event_id=event_id).count()
    
    return Response({
        'all_complete': completed_scores == required_scores,
        'teams_count': teams_count,
        'juries_count': juries_count,
        'scores_count': completed_scores,
        'required_scores': required_scores
    })


@api_view(['GET'])
@permission_classes([IsJury | IsAdmin])
def jury_progress_view(request, jury_id):
    """Get progress for a specific jury"""
    try:
        jury = User.objects.get(id=jury_id, role='jury')
    except User.DoesNotExist:
        return Response({'error': 'Jury not found'}, status=status.HTTP_404_NOT_FOUND)
    
    event_id = jury.event_id
    if not event_id:
        return Response({'error': 'Jury is not assigned to an event'}, status=status.HTTP_400_BAD_REQUEST)

    teams_count = Team.objects.filter(event_id=event_id).count()
    scored_count = TeamScore.objects.filter(jury=jury, locked=True, event_id=event_id).count()
    
    return Response({
        'jury_id': jury.id,
        'jury_name': jury.username,
        'teams_count': teams_count,
        'scored_count': scored_count,
        'percentage': round((scored_count / teams_count * 100) if teams_count > 0 else 0)
    })

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def ping_view(request):
    return Response({'status': 'ok', 'timestamp': timezone.now()})
