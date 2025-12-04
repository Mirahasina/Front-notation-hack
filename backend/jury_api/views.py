from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.db.models import Sum, Q
from django.utils import timezone
from .models import User, Criterion, Team, TeamScore
from .serializers import (
    UserSerializer, LoginSerializer, CriterionSerializer,
    TeamSerializer, TeamScoreSerializer, TeamResultSerializer
)


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class IsJury(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'jury'


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
def logout_view(request):
    if request.user.is_authenticated:
        request.user.auth_token.delete()
    return Response({'message': 'Logged out successfully'})


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        return queryset


class CriterionViewSet(viewsets.ModelViewSet):
    queryset = Criterion.objects.all()
    serializer_class = CriterionSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [IsAdmin]
        return [permission() for permission in permission_classes]


class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [IsAdmin]
        return [permission() for permission in permission_classes]


class TeamScoreViewSet(viewsets.ModelViewSet):
    queryset = TeamScore.objects.all()
    serializer_class = TeamScoreSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        jury_id = self.request.query_params.get('jury_id')
        team_id = self.request.query_params.get('team_id')
        
        if jury_id:
            queryset = queryset.filter(jury_id=jury_id)
        if team_id:
            queryset = queryset.filter(team_id=team_id)
        
        # Jury can only see their own scores
        if self.request.user.role == 'jury':
            queryset = queryset.filter(jury=self.request.user)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        # Automatically set jury to current user if jury role
        if request.user.role == 'jury':
            request.data['jury'] = request.user.id
        return super().create(request, *args, **kwargs)
    
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
        
        serializer = self.get_serializer(team_score)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def results_view(request):
    """Calculate and return final results"""
    teams = Team.objects.all()
    juries = User.objects.filter(role='jury')
    criteria = Criterion.objects.all()
    
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
                team_score = TeamScore.objects.get(jury=jury, team=team)
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
    
    return Response(results)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_completion_view(request):
    """Check if all teams have been scored by all juries"""
    teams_count = Team.objects.count()
    juries_count = User.objects.filter(role='jury').count()
    
    if teams_count == 0 or juries_count == 0:
        return Response({
            'all_complete': False,
            'teams_count': teams_count,
            'juries_count': juries_count,
            'scores_count': 0,
            'required_scores': 0
        })
    
    required_scores = teams_count * juries_count
    completed_scores = TeamScore.objects.filter(locked=True).count()
    
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
    
    teams_count = Team.objects.count()
    scored_count = TeamScore.objects.filter(jury=jury, locked=True).count()
    
    return Response({
        'jury_id': jury.id,
        'jury_name': jury.username,
        'teams_count': teams_count,
        'scored_count': scored_count,
        'percentage': round((scored_count / teams_count * 100) if teams_count > 0 else 0)
    })
