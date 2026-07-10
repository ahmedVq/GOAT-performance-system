import uuid
from django.db import models
from accounts.models import User


class SyncLog(models.Model):
    class Status(models.TextChoices):
        SUCCESS = 'success', 'Success'
        PARTIAL = 'partial', 'Partial'
        FAILED = 'failed', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    triggered_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='sync_logs'
    )
    sheet_id = models.CharField(max_length=200)
    status = models.CharField(max_length=10, choices=Status.choices)
    records_synced = models.PositiveSmallIntegerField(default=0)
    records_failed = models.PositiveSmallIntegerField(default=0)
    error_details = models.JSONField(default=list)
    started_at = models.DateTimeField()
    completed_at = models.DateTimeField(null=True)

    class Meta:
        db_table = 'sync_logs'
        ordering = ['-started_at']

    def __str__(self):
        return f'Sync {self.status} — {self.started_at:%Y-%m-%d %H:%M}'

    @property
    def duration_seconds(self):
        if self.completed_at:
            return (self.completed_at - self.started_at).total_seconds()
        return None
