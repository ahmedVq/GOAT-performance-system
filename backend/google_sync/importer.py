"""
Importer — writes validated records to the database.
Each student record is imported in its own transaction.
Calls the assessment engine after each import.
"""
import logging
from datetime import datetime
from django.db import transaction
from assessments.models import AssessmentSession, AssessmentTemplate, CriterionScore, Criterion
from assessments.services import calculate_and_store
from leaderboard.services import refresh_student
from students.models import Student
from .parser import ParsedStudentRecord
from .validator import _parse_date

logger = logging.getLogger(__name__)

DATE_FORMATS = ['%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y', '%d-%m-%Y']

SPORT_MAP = {
    'boxing': AssessmentSession.MartialArt.BOXING,
    'kickboxing': AssessmentSession.MartialArt.KICKBOXING,
}


def import_record(record: ParsedStudentRecord, template: AssessmentTemplate) -> dict:
    """
    Import a single validated student record.
    Idempotent: if a session for this student + date already exists, it is updated.
    Returns a result dict with status and any errors.
    """
    try:
        with transaction.atomic():
            student = Student.objects.select_related('user').get(student_id=record.tab_name)
            assessment_date = _parse_date(record.assessment_date)
            sport_raw = record.sport.replace('🥊', '').replace('🦵', '').strip().lower()
            martial_art = SPORT_MAP.get(sport_raw, AssessmentSession.MartialArt.BOXING)

            session, created = AssessmentSession.objects.get_or_create(
                student=student,
                assessment_date=assessment_date,
                defaults={
                    'template': template,
                    'martial_art': martial_art,
                    'sessions_completed': record.sessions_completed,
                    'coach_notes': record.coach_notes,
                    'action_plan': record.action_plan,
                    'synced_from_sheet': True,
                },
            )

            if not created:
                session.martial_art = martial_art
                session.sessions_completed = record.sessions_completed
                session.coach_notes = record.coach_notes
                session.action_plan = record.action_plan
                session.synced_from_sheet = True
                session.save(update_fields=[
                    'martial_art', 'sessions_completed',
                    'coach_notes', 'action_plan', 'synced_from_sheet',
                ])

            _import_scores(session, record, template)

        calculate_and_store(session)
        refresh_student(student)

        logger.info(
            'Imported: student=%s date=%s (%s)',
            record.tab_name, assessment_date, 'created' if created else 'updated',
        )
        return {'student_id': record.tab_name, 'status': 'success', 'created': created}

    except Exception as e:
        logger.exception('Import failed for student=%s: %s', record.tab_name, e)
        return {'student_id': record.tab_name, 'status': 'failed', 'error': str(e)}


def _import_scores(
    session: AssessmentSession,
    record: ParsedStudentRecord,
    template: AssessmentTemplate,
) -> None:
    criteria = list(
        Criterion.objects
        .filter(pillar__template=template)
        .select_related('pillar')
        .order_by('pillar__order', 'order')
    )

    criterion_map = {
        (c.pillar.order, c.order): c for c in criteria
    }

    for raw_score in record.criterion_scores:
        criterion = criterion_map.get((raw_score.pillar_order, raw_score.criterion_order))
        if not criterion:
            continue

        CriterionScore.objects.update_or_create(
            session=session,
            criterion=criterion,
            defaults={
                'boxing_score': raw_score.boxing_score,
                'kickboxing_score': raw_score.kickboxing_score,
                'coach_comment': raw_score.coach_comment,
            },
        )


def import_all(
    records: list[ParsedStudentRecord],
    template: AssessmentTemplate,
) -> tuple[int, int, list[dict]]:
    """
    Import all validated records.
    Returns (success_count, failed_count, error_details).
    """
    success, failed, errors = 0, 0, []

    for record in records:
        result = import_record(record, template)
        if result['status'] == 'success':
            success += 1
        else:
            failed += 1
            errors.append(result)

    return success, failed, errors
