from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Criterion, Team, TeamScore


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'role', 'is_staff', 'is_active']
    list_filter = ['role', 'is_staff', 'is_active']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('role',)}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Custom Fields', {'fields': ('role',)}),
    )


@admin.register(Criterion)
class CriterionAdmin(admin.ModelAdmin):
    list_display = ['name', 'max_score', 'created_at']
    search_fields = ['name']
    ordering = ['-created_at']


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'created_at']
    search_fields = ['name']
    ordering = ['-created_at']


@admin.register(TeamScore)
class TeamScoreAdmin(admin.ModelAdmin):
    list_display = ['jury', 'team', 'locked', 'submitted_at', 'get_total']
    list_filter = ['locked', 'submitted_at']
    search_fields = ['jury__username', 'team__name']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    
    def get_total(self, obj):
        return obj.get_total()
    get_total.short_description = 'Total Score'
