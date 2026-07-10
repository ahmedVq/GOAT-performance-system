from django.urls import path
from .views import (
    AdminSummaryView, SportBreakdownView, PillarAnalyticsView,
    TopPerformersView, ScoreDistributionView,
)

urlpatterns = [
    path('summary/', AdminSummaryView.as_view(), name='analytics-summary'),
    path('sport-breakdown/', SportBreakdownView.as_view(), name='analytics-sport-breakdown'),
    path('pillars/', PillarAnalyticsView.as_view(), name='analytics-pillars'),
    path('top-performers/', TopPerformersView.as_view(), name='analytics-top-performers'),
    path('score-distribution/', ScoreDistributionView.as_view(), name='analytics-score-distribution'),
]
