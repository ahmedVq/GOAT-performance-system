"""
Sync service — orchestrates the full pipeline and writes the SyncLog.
This is the single entry point called by the API and the scheduler.
"""
import logging
from datetime import datetime, timezone
from assessments.models import AssessmentTemplate
from students.models import Student
from .models import SyncLog
from .sheets_client import get_client
from .parser import parse_spreadsheet
from .validator import validate_all
from .importer import import_all

logger = logging.getLogger(__name__)


def run_sync(spreadsheet_id: str, triggered_by=None) -> SyncLog:
    """
    Full sync pipeline:
    1. Fetch all tabs from Google Sheets.
    2. Parse each tab.
    3. Validate records.
    4. Import valid records into the DB.
    5. Log results.
    """
    log = SyncLog.objects.create(
        triggered_by=triggered_by,
        sheet_id=spreadsheet_id,
        status=SyncLog.Status.FAILED,
        started_at=datetime.now(tz=timezone.utc),
    )

    try:
        template = AssessmentTemplate.objects.filter(is_active=True).order_by('-version').first()
        if not template:
            raise RuntimeError('No active assessment template found.')

        client = get_client()
        tab_names = client.get_sheet_names(spreadsheet_id)
        logger.info('Sync started: %d tabs found in spreadsheet %s', len(tab_names), spreadsheet_id)

        tabs_data = {}
        for tab in tab_names:
            tabs_data[tab] = client.get_tab_values(spreadsheet_id, tab)

        parsed_records = parse_spreadsheet(tabs_data)
        logger.info('Parsed %d student records', len(parsed_records))

        existing_ids = set(
            Student.objects.filter(is_active=True).values_list('student_id', flat=True)
        )
        valid_records, validation_errors = validate_all(parsed_records, existing_ids)
        logger.info('%d valid / %d invalid records', len(valid_records), len(validation_errors))

        success_count, failed_count, import_errors = import_all(valid_records, template)

        all_errors = (
            [{'type': 'validation', **e} for e in validation_errors]
            + [{'type': 'import', **e} for e in import_errors]
        )

        if failed_count > 0 or validation_errors:
            status = SyncLog.Status.PARTIAL if success_count > 0 else SyncLog.Status.FAILED
        else:
            status = SyncLog.Status.SUCCESS

        log.status = status
        log.records_synced = success_count
        log.records_failed = failed_count + len(validation_errors)
        log.error_details = all_errors
        log.completed_at = datetime.now(tz=timezone.utc)
        log.save()

        logger.info(
            'Sync complete: status=%s synced=%d failed=%d',
            status, success_count, failed_count,
        )

    except Exception as e:
        logger.exception('Sync pipeline failed: %s', e)
        log.status = SyncLog.Status.FAILED
        log.error_details = [{'type': 'fatal', 'error': str(e)}]
        log.completed_at = datetime.now(tz=timezone.utc)
        log.save()

    return log
