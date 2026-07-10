"""
Leaderboard service — rebuilds LeaderboardSnapshot for one or all students.
Called automatically after every assessment calculation.
"""
import logging
from decimal import Decimal
from django.db import transaction
from assessments.models import AssessmentSession
from students.models import Student
from .models import LeaderboardSnapshot

logger = logging.getLogger(__name__)


def refresh_student(student: Student) -> None:
    """Rebuild the leaderboard snapshot for a single student."""
    sessions = list(
        AssessmentSession.objects
        .filter(student=student, overall_score__isnull=False)
        .order_by('-assessment_date')
        .only('id', 'overall_score', 'grade_percentage')
    )

    if not sessions:
        LeaderboardSnapshot.objects.filter(student=student).delete()
        return

    latest = sessions[0]
    previous = sessions[1] if len(sessions) > 1 else None

    current_score = Decimal(str(latest.grade_percentage))
    prev_score = Decimal(str(previous.grade_percentage)) if previous else None
    improvement = round(current_score - prev_score, 2) if prev_score is not None else None

    with transaction.atomic():
        LeaderboardSnapshot.objects.update_or_create(
            student=student,
            defaults={
                'latest_session': latest,
                'previous_session': previous,
                'current_score': current_score,
                'previous_score': prev_score,
                'improvement': improvement,
                'total_assessments': len(sessions),
            },
        )

    logger.debug(
        'Leaderboard refreshed: student=%s score=%s improvement=%s',
        student.student_id, current_score, improvement,
    )


def refresh_all() -> None:
    """Rebuild snapshots for every active student. Used after bulk sync."""
    students = Student.objects.filter(is_active=True).select_related('user')
    for student in students:
        try:
            refresh_student(student)
        except Exception:
            logger.exception('Leaderboard refresh failed for student=%s', student.student_id)
    logger.info('Leaderboard refresh complete: %d students processed', students.count())


def get_leaderboard(
    branch_id: str = None,
    level: str = None,
    sport: str = None,
    limit: int = 50,
) -> list:
    """
    Return ranked leaderboard entries.
    Primary sort: biggest improvement. Secondary: highest current score.
    """
    qs = (
        LeaderboardSnapshot.objects
        .select_related('student__user', 'student__branch')
        .order_by('-improvement', '-current_score')
    )

    if branch_id:
        qs = qs.filter(student__branch_id=branch_id)
    if level:
        qs = qs.filter(student__level=level)
    if sport:
        qs = qs.filter(student__sport=sport)

    return list(qs[:limit])
