from django.urls import path
from .views import BranchListView, StudentListView, StudentDetailView, StudentProgressView, StudentMeView

urlpatterns = [
    path('', StudentListView.as_view(), name='student-list'),
    path('me/', StudentMeView.as_view(), name='student-me'),
    path('branches/', BranchListView.as_view(), name='branch-list'),
    path('<uuid:pk>/', StudentDetailView.as_view(), name='student-detail'),
    path('<uuid:pk>/progress/', StudentProgressView.as_view(), name='student-progress'),
]
