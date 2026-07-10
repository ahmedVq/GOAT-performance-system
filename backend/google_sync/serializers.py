from rest_framework import serializers
from .models import SyncLog


class SyncLogSerializer(serializers.ModelSerializer):
    triggered_by_name = serializers.CharField(source='triggered_by.full_name', read_only=True)
    duration_seconds = serializers.ReadOnlyField()

    class Meta:
        model = SyncLog
        fields = [
            'id', 'sheet_id', 'status', 'records_synced', 'records_failed',
            'error_details', 'started_at', 'completed_at',
            'duration_seconds', 'triggered_by_name',
        ]
