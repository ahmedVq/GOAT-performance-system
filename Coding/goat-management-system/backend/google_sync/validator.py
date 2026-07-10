"""
Validates parsed student records before any DB writes.
Returns (valid_records, validation_errors) — never raises.
"""
from datetime import datetime
from .parser import ParsedStudentRecord

VALID_SPORTS = {'boxing', 'kickboxing'}
DATE_FORMATS = ['%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y', '%d-%m-%Y']


def _parse_date(value: str):
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(value.strip(), fmt).date()
        except (ValueError, AttributeError):
            continue
    return None


def validate_record(record: ParsedStudentRecord) -> list[str]:
    errors = []

    if not record.tab_name or not record.tab_name.strip():
        errors.append('Missing student ID (tab name is empty).')

    if not record.assessment_date:
        errors.append(f'[{record.tab_name}] Missing assessment date.')
    elif _parse_date(record.assessment_date) is None:
        errors.append(f'[{record.tab_name}] Invalid date format: "{record.assessment_date}".')

    sport = record.sport.replace('🥊', '').replace('🦵', '').strip().lower()
    if sport not in VALID_SPORTS:
        errors.append(f'[{record.tab_name}] Invalid sport: "{record.sport}". Must be boxing or kickboxing.')

    filled_scores = [
        s for s in record.criterion_scores
        if s.boxing_score is not None or s.kickboxing_score is not None
    ]
    if not filled_scores:
        errors.append(f'[{record.tab_name}] No scores found — at least one criterion must be scored.')

    return errors


def validate_all(
    records: list[ParsedStudentRecord],
    existing_student_ids: set[str],
) -> tuple[list[ParsedStudentRecord], list[dict]]:
    """
    Returns (valid_records, error_list).
    Logs validation failures without stopping the batch.
    """
    seen_ids = set()
    valid = []
    errors = []

    for record in records:
        tab = record.tab_name
        record_errors = validate_record(record)

        if tab in seen_ids:
            record_errors.append(f'[{tab}] Duplicate student ID in this import.')
        seen_ids.add(tab)

        if tab not in existing_student_ids:
            record_errors.append(f'[{tab}] Student ID not found in database — skipping.')

        if record_errors:
            errors.append({'student_id': tab, 'errors': record_errors})
        else:
            valid.append(record)

    return valid, errors
