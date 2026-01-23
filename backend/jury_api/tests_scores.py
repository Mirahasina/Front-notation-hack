from django.test import TestCase
from django.utils import timezone
from .models import User, Event, Team, Criterion, TeamScore

class ScoreCalculationTest(TestCase):
    def setUp(self):
        self.event = Event.objects.create(
            name="Test Event", 
            date=timezone.now()
        )
        self.admin = User.objects.create_user(username="admin_user", role="admin")
        self.jury = User.objects.create_user(username="jury1", role="jury", event=self.event)
        self.team = Team.objects.create(name="Team Alpha", event=self.event)
        
        self.crit1 = Criterion.objects.create(
            event=self.event, name="Innovation", max_score=20, weight=1.0, priority_order=1
        )
        self.crit2 = Criterion.objects.create(
            event=self.event, name="Technique", max_score=20, weight=2.5, priority_order=2
        )

    def test_weighted_total(self):
        """Test if the total score correctly accounts for weights"""
        # crit1: 10 * 1.0 = 10.0
        # crit2: 12 * 2.5 = 30.0
        # Total: 40.0
        team_score = TeamScore.objects.create(
            event=self.event,
            jury=self.jury,
            team=self.team,
            scores={
                str(self.crit1.id): 10,
                str(self.crit2.id): 12
            }
        )
        
        self.assertEqual(team_score.get_total(), 40.0)

    def test_default_weight(self):
        """Test with default weight (1.0) when not specified"""
        crit3 = Criterion.objects.create(
            event=self.event, name="Design", max_score=10, priority_order=3
        )
        # crit3: 8 * 1.0 = 8.0
        team_score = TeamScore.objects.create(
            event=self.event,
            jury=self.jury,
            team=self.team,
            scores={
                str(crit3.id): 8
            }
        )
        self.assertEqual(team_score.get_total(), 8.0)

    def test_missing_criterion_in_map(self):
        """Test behavior when a score exists for a criterion that is no longer in the event's criteria list"""
        team_score = TeamScore.objects.create(
            event=self.event,
            jury=self.jury,
            team=self.team,
            scores={
                "999": 10  # Non-existent criterion ID
            }
        )
        # Should fallback to weight 1.0
        self.assertEqual(team_score.get_total(), 10.0)
