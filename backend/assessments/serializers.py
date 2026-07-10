from rest_framework import serializers
from .models import AssessmentSession, CriterionScore, PillarScore


class CriterionScoreSerializer(serializers.ModelSerializer):
    criterion_name = serializers.CharField(source='criterion.name', read_only=True)
    pillar_name = serializers.CharField(source='criterion.pillar.name', read_only=True)
    pillar_order = serializers.IntegerField(source='criterion.pillar.order', read_only=True)
    criterion_order = serializers.IntegerField(source='criterion.order', read_only=True)

    class Meta:
        model = CriterionScore
        fields = [
            'id', 'criterion_name', 'pillar_name', 'pillar_order', 'criterion_order',
            'boxing_score', 'kickboxing_score', 'effective_score', 'coach_comment',
        ]


class PillarScoreSerializer(serializers.ModelSerializer):
    pillar_name = serializers.CharField(source='pillar.name', read_only=True)
    pillar_order = serializers.IntegerField(source='pillar.order', read_only=True)

    class Meta:
        model = PillarScore
        fields = ['pillar_name', 'pillar_order', 'score']


class AssessmentListSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    student_id = serializers.CharField(source='student.student_id', read_only=True)

    class Meta:
        model = AssessmentSession
        fields = [
            'id', 'student_id', 'student_name', 'assessment_date',
            'martial_art', 'overall_score', 'grade_percentage',
            'level_at_assessment', 'sessions_completed', 'created_at',
        ]


class AssessmentDetailSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    pillar_scores = PillarScoreSerializer(many=True, read_only=True)
    criterion_scores = CriterionScoreSerializer(many=True, read_only=True)

    class Meta:
        model = AssessmentSession
        fields = [
            'id', 'student_id', 'student_name', 'assessment_date',
            'martial_art', 'sessions_completed', 'overall_score',
            'grade_percentage', 'level_at_assessment',
            'coach_notes', 'action_plan',
            'pillar_scores', 'criterion_scores', 'created_at',
        ]
