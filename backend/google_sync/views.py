import logging
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsAdmin
from core.responses import success_response, error_response
from .models import SyncLog
from .serializers import SyncLogSerializer
from .services import run_sync

logger = logging.getLogger(__name__)


class TriggerSyncView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        spreadsheet_id = request.data.get('spreadsheet_id') or _get_default_sheet_id()
        if not spreadsheet_id:
            return error_response('spreadsheet_id is required.')

        log = run_sync(spreadsheet_id=spreadsheet_id, triggered_by=request.user)

        if log.status == SyncLog.Status.FAILED:
            return error_response(
                'Sync failed.',
                errors=log.error_details,
                status_code=502,
            )

        return success_response(
            data=SyncLogSerializer(log).data,
            message=f'Sync complete. {log.records_synced} records imported.',
        )


class SyncLogsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        logs = SyncLog.objects.select_related('triggered_by').order_by('-started_at')[:20]
        return success_response(data=SyncLogSerializer(logs, many=True).data)


class SyncStatusView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        latest = SyncLog.objects.order_by('-started_at').first()
        return success_response(
            data=SyncLogSerializer(latest).data if latest else None,
            message='Latest sync status.',
        )


def _get_default_sheet_id():
    from django.conf import settings
    return getattr(settings, 'GOOGLE_SPREADSHEET_ID', None)
