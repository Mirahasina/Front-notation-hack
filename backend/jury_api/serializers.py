from rest_framework import serializers
from .models import User, Criterion, Team, TeamScore, Event
from django.contrib.auth.password_validation import validate_password


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'name', 'date', 'status', 'description', 'created_at']
        read_only_fields = ['created_at']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'role', 'first_name', 'last_name', 'email', 'event']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class CriterionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Criterion
        fields = ['id', 'event', 'name', 'max_score', 'priority_order', 'created_at']
        read_only_fields = ['created_at']


class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = [
            'id', 'event', 'name', 'description', 'email', 'generated_email', 
            'password', 'has_logged_in', 'passage_order', 'passage_time', 'created_at'
        ]
        read_only_fields = ['created_at']


class TeamScoreSerializer(serializers.ModelSerializer):
    jury_username = serializers.CharField(source='jury.username', read_only=True)
    team_name = serializers.CharField(source='team.name', read_only=True)
    total = serializers.SerializerMethodField()
    
    class Meta:
        model = TeamScore
        fields = ['id', 'event', 'jury', 'jury_username', 'team', 'team_name', 
                  'scores', 'locked', 'submitted_at', 'total', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_total(self, obj):
        return obj.get_total()
    
    def validate(self, data):
        # Check if already locked
        if self.instance and self.instance.locked:
            raise serializers.ValidationError("Cannot modify locked scores")
        
        # Validate scores against criteria
        if 'scores' in data:
            for criterion_id, score in data['scores'].items():
                try:
                    # Search specifically in the event context if provided
                    event = data.get('event') or (self.instance.event if self.instance else None)
                    if event:
                        criterion = Criterion.objects.get(id=criterion_id, event=event)
                    else:
                        criterion = Criterion.objects.get(id=criterion_id)
                        
                    if score < 0 or score > criterion.max_score:
                        raise serializers.ValidationError(
                            f"Score for {criterion.name} must be between 0 and {criterion.max_score}"
                        )
                except Criterion.DoesNotExist:
                    raise serializers.ValidationError(f"Criterion {criterion_id} does not exist in this event context")
        
        return data


class TeamResultSerializer(serializers.Serializer):
    team_id = serializers.IntegerField()
    team_name = serializers.CharField()
    total_score = serializers.IntegerField()
    jury_scores = serializers.ListField()
