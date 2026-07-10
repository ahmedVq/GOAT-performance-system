import uuid
from django.db import models
from students.models import Student
from assessments.models import AssessmentSession


class LeaderboardSnapshot(models.Model):
    """
    Cached leaderboard entry per student, refreshed after every sync.
    Derived entirely from AssessmentSession data by the engine.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.OneToOneField(
        Student, on_delete=models.CASCADE, related_name='leaderboard_entry'
    )
    latest_session = models.ForeignKey(
        AssessmentSession, on_delete=models.SET_NULL, null=True, related_name='+'
    )
    previous_session = models.ForeignKey(
        AssessmentSession, on_delete=models.SET_NULL, null=True, related_name='+',
        help_text='Session before latest, used to calculate improvement.'
    )
    current_score = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    previous_score = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    improvement = models.DecimalField(
        max_digits=5, decimal_places=2, null=True,
        help_text='current_score - previous_score. Primary leaderboard ranking field.'
    )
    total_assessments = models.PositiveSmallIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'leaderboard_snapshots'
        ordering = ['-improvement', '-current_score']

    def __str__(self):
        return f'{self.student.student_id} — improvement: {self.improvement}'
