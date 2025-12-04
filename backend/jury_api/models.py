from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator
import json


class User(AbstractUser):
    """Custom user model with role field"""
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('jury', 'Jury'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='jury')
    
    class Meta:
        db_table = 'users'


class Criterion(models.Model):
    """Scoring criteria"""
    name = models.CharField(max_length=200)
    max_score = models.IntegerField(validators=[MinValueValidator(1)])
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'criteria'
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.name} ({self.max_score}pts)"


class Team(models.Model):
    """Participating teams"""
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'teams'
        ordering = ['created_at']
    
    def __str__(self):
        return self.name


class TeamScore(models.Model):
    """Scores given by juries to teams"""
    jury = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'jury'})
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    scores = models.JSONField(default=dict)  # {criterion_id: score}
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
        """Calculate total score"""
        return sum(self.scores.values())
