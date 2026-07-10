from django.urls import path
from .views import AssessmentListView, AssessmentDetailView

urlpatterns = [
    path('', AssessmentListView.as_view(), name='assessment-list'),
    path('<uuid:pk>/', AssessmentDetailView.as_view(), name='assessment-detail'),
]
