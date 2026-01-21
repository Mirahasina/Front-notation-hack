from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'events', views.EventViewSet)
router.register(r'users', views.UserViewSet)
router.register(r'criteria', views.CriterionViewSet)
router.register(r'teams', views.TeamViewSet)
router.register(r'team-scores', views.TeamScoreViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('results/', views.results_view, name='results'),
    path('check-completion/', views.check_completion_view, name='check-completion'),
    path('jury-progress/<int:jury_id>/', views.jury_progress_view, name='jury-progress'),
]
