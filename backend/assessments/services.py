"""
Assessment service — orchestrates DB reads/writes around the engine.
Business logic only. No HTTP, no serializers.
"""
import logging
from decimal import Decimal
from django.db import transaction
from .engine import process_session
from .models import AssessmentSession, CriterionScore, PillarScore, Criterion, Pillar

logger = logging.getLogger(__name__)


def calculate_and_store(session: AssessmentSession) -> AssessmentSession:
    """
    Run the assessment engine on a session and persist all calculated values.
    Always runs inside a transaction — partial writes are rolled back.
    """
    with transaction.atomic():
        pillars = list(
            Pillar.objects.filter(template=session.template).order_by('order')
            .values('id', 'name')
        )
        pillar_id_map = {str(p['id']): p for p in pillars}

        raw_scores = list(
            CriterionScore.objects
            .filter(session=session)
            .select_related('criterion__pillar')
            .values(
                'id',
                'criterion_id',
                'criterion__pillar_id',
                'criterion__pillar__name',
                'boxing_score',
                'kickboxing_score',
            )
        )

        engine_input = [
            {
                'criterion_id': str(r['criterion_id']),
                'pillar_id': str(r['criterion__pillar_id']),
                'pillar_name': r['criterion__pillar__name'],
                'boxing_score': r['boxing_score'],
                'kickboxing_score': r['kickboxing_score'],
            }
            for r in raw_scores
        ]

        result = process_session(engine_input, pillars=[
            {'id': str(p['id']), 'name': p['name']} for p in pillars
        ])

        # Persist effective scores on each CriterionScore row
        score_map = {cr.criterion_id: cr for cr in result.pillar_results
                     for cr in cr.criterion_results}

        for raw in raw_scores:
            crit_id = str(raw['criterion_id'])
            if crit_id in score_map:
                CriterionScore.objects.filter(
                    session=session, criterion_id=raw['criterion_id']
                ).update(effective_score=score_map[crit_id].effective_score)

        # Persist pillar scores
        PillarScore.objects.filter(session=session).delete()
        for pr in result.pillar_results:
            if pr.score is not None:
                PillarScore.objects.create(
                    session=session,
                    pillar_id=pr.pillar_id,
                    score=pr.score,
                )

        # Persist session-level calculated fields
        session.overall_score = result.overall_score
        session.grade_percentage = result.grade_percentage
        session.level_at_assessment = result.level
        session.save(update_fields=['overall_score', 'grade_percentage', 'level_at_assessment'])

        logger.info(
            'Assessment calculated: session=%s score=%s grade=%s%% level=%s',
            session.id, result.overall_score, result.grade_percentage, result.level,
        )

    return session


def get_student_progress(student_id: str) -> dict:
    """
    Return a progress summary for a student across all their assessments.
    """
    sessions = (
        AssessmentSession.objects
        .filter(student_id=student_id, overall_score__isnull=False)
        .order_by('assessment_date')
        .values('id', 'assessment_date', 'overall_score', 'grade_percentage', 'level_at_assessment')
    )

    if not sessions:
        return _empty_progress()

    scores = [Decimal(str(s['overall_score'])) for s in sessions]
    latest = sessions[len(sessions) - 1]
    previous = sessions[len(sessions) - 2] if len(sessions) > 1 else None

    current = Decimal(str(latest['overall_score']))
    prev = Decimal(str(previous['overall_score'])) if previous else None

    return {
        'current_score': current,
        'previous_score': prev,
        'improvement': round(current - prev, 2) if prev is not None else None,
        'highest_score': max(scores),
        'lowest_score': min(scores),
        'average_score': round(sum(scores) / len(scores), 2),
        'total_assessments': len(scores),
        'history': list(sessions),
    }


def _empty_progress() -> dict:
    return {
        'current_score': None,
        'previous_score': None,
        'improvement': None,
        'highest_score': None,
        'lowest_score': None,
        'average_score': None,
        'total_assessments': 0,
        'history': [],
    }
