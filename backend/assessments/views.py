from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsAdmin
from core.responses import success_response, error_response
from .models import AssessmentSession
from .serializers import AssessmentListSerializer, AssessmentDetailSerializer


class AssessmentListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        qs = (
            AssessmentSession.objects
            .select_related('student__user')
            .order_by('-assessment_date')
        )

        student_id = request.query_params.get('student')
        if student_id:
            qs = qs.filter(student_id=student_id)

        martial_art = request.query_params.get('martial_art')
        if martial_art:
            qs = qs.filter(martial_art=martial_art)

        return success_response(data=AssessmentListSerializer(qs[:50], many=True).data)


class AssessmentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            session = (
                AssessmentSession.objects
                .select_related('student__user')
                .prefetch_related(
                    'pillar_scores__pillar',
                    'criterion_scores__criterion__pillar',
                )
                .get(pk=pk)
            )
        except AssessmentSession.DoesNotExist:
            return error_response('Assessment not found.', status_code=404)

        if not request.user.is_admin:
            if not hasattr(request.user, 'student_profile'):
                return error_response('Forbidden.', status_code=403)
            if session.student != request.user.student_profile:
                return error_response('Forbidden.', status_code=403)

        return success_response(data=AssessmentDetailSerializer(session).data)
