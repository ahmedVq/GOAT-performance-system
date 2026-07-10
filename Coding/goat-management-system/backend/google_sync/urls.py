from django.urls import path
from .views import TriggerSyncView, SyncLogsView, SyncStatusView

urlpatterns = [
    path('trigger/', TriggerSyncView.as_view(), name='sync-trigger'),
    path('logs/', SyncLogsView.as_view(), name='sync-logs'),
    path('status/', SyncStatusView.as_view(), name='sync-status'),
]
