from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator
import json


class Event(models.Model):
    STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
    ]
    name = models.CharField(max_length=200)
    date = models.DateTimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ongoing')
    description = models.TextField(blank=True, null=True)
    instructions = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'events'
        ordering = ['-date']

    def __str__(self):
        return self.name



class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('jury', 'Jury'),
        ('team', 'Team'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='jury')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, null=True, blank=True, related_name='users')
    track = models.CharField(max_length=100, blank=True, null=True)
    assigned_criteria = models.JSONField(default=list, blank=True)
    
    class Meta:
        db_table = 'users'


class Criterion(models.Model):
    """Scoring criteria"""
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='criteria', null=True, blank=True)
    name = models.CharField(max_length=200)
    max_score = models.IntegerField(validators=[MinValueValidator(1)])
    weight = models.DecimalField(max_digits=5, decimal_places=2, default=1.00)
    priority_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'criteria'
        ordering = ['priority_order', 'created_at']
    
    def __str__(self):
        return f"{self.name} ({self.max_score}pts)"


class Team(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='teams', null=True, blank=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    generated_email = models.EmailField(blank=True, null=True)
    password = models.CharField(max_length=128, blank=True, null=True)
    has_logged_in = models.BooleanField(default=False)
    passage_order = models.IntegerField(null=True, blank=True)
    passage_time = models.CharField(max_length=100, null=True, blank=True)
    track = models.CharField(max_length=100, blank=True, null=True)
    imported_from = models.CharField(max_length=50, default='manual')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'teams'
        ordering = ['passage_order', 'created_at']
    
    def __str__(self):
        return self.name


class TeamScore(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='scores', null=True, blank=True)
    jury = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'jury'})
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    scores = models.JSONField(default=dict)
    criterion_comments = models.JSONField(default=dict, blank=True)
    global_comments = models.TextField(blank=True, null=True)
    locked = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'team_scores'
        unique_together = [['jury', 'team']]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.jury.username} -> {self.team.name}"
    
    def get_total(self):
        """Calculate total score with weights"""
        total = 0
        from .models import Criterion
        criteria_map = {c.id: c.weight for c in Criterion.objects.filter(event=self.event)}
        
        for criterion_id, score in self.scores.items():
            weight = criteria_map.get(int(criterion_id), 1.0)
            total += float(score) * float(weight)
        return total


class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=100)
    target_type = models.CharField(max_length=100)
    target_id = models.CharField(max_length=100, blank=True, null=True)
    changes = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_logs'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.action} on {self.target_type} at {self.timestamp}"
