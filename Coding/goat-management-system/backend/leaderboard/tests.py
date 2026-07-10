import datetime
from django.test import TestCase
from rest_framework.test import APIClient
from accounts.models import User
from students.models import Branch, Student
from assessments.models import AssessmentTemplate, Pillar, Criterion, AssessmentSession
from .models import LeaderboardSnapshot


def make_admin():
    u = User(email='admin@goat.com', full_name='Admin', role='admin', is_active=True)
    u.set_password('Admin123!')
    u.save()
    return u


def make_branch():
    return Branch.objects.create(name='Main', location='Cairo', is_active=True)


_student_counter = 0

def make_student(branch, email, sport='boxing'):
    global _student_counter
    _student_counter += 1
    u = User(email=email, full_name=email.split('@')[0], role='student', is_active=True)
    u.set_password('Pass123!')
    u.save()
    return Student.objects.create(
        user=u, branch=branch, sport=sport,
        student_id=f'TEST-{_student_counter:03d}',
        join_date=datetime.date(2026, 1, 1), is_active=True,
    )


def make_template():
    t = AssessmentTemplate.objects.create(name='v1', version=1, is_active=True)
    p = Pillar.objects.create(template=t, name='Cardio', order=1)
    Criterion.objects.create(pillar=p, name='C1', order=1, is_sport_specific=False)
    return t


def make_session(student, template, date, score):
    return AssessmentSession.objects.create(
        student=student, template=template,
        assessment_date=date, overall_score=score,
        grade_percentage=score, level_at_assessment='beginner',
        martial_art=student.sport,
    )


def make_snapshot(student, current, previous=None, improvement=None, total=1):
    s1 = make_session(student, AssessmentTemplate.objects.first(), datetime.date(2026, 6, 1), current)
    snap = LeaderboardSnapshot(
        student=student,
        latest_session=s1,
        current_score=current,
        previous_score=previous,
        improvement=improvement,
        total_assessments=total,
    )
    snap.save()
    return snap


def auth_admin(client):
    resp = client.post('/api/v1/auth/login/', {'email': 'admin@goat.com', 'password': 'Admin123!'}, format='json')
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {resp.data["data"]["access"]}')


class LeaderboardTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        make_admin()
        auth_admin(self.client)
        branch = make_branch()
        make_template()
        self.s1 = make_student(branch, 'ali@goat.com', 'boxing')
        self.s2 = make_student(branch, 'sara@goat.com', 'kickboxing')
        self.s3 = make_student(branch, 'omar@goat.com', 'boxing')
        make_snapshot(self.s1, current=80, previous=60, improvement=20, total=2)
        make_snapshot(self.s2, current=75, previous=70, improvement=5, total=2)
        make_snapshot(self.s3, current=90, previous=50, improvement=40, total=2)

    def test_leaderboard_returns_all(self):
        resp = self.client.get('/api/v1/leaderboard/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data['data']), 3)

    def test_ordered_by_improvement_desc(self):
        resp = self.client.get('/api/v1/leaderboard/')
        improvements = [float(e['improvement']) for e in resp.data['data']]
        self.assertEqual(improvements, sorted(improvements, reverse=True))

    def test_filter_by_sport(self):
        resp = self.client.get('/api/v1/leaderboard/?sport=boxing')
        sports = [e['sport'] for e in resp.data['data']]
        self.assertTrue(all(s == 'boxing' for s in sports))

    def test_filter_by_level(self):
        resp = self.client.get('/api/v1/leaderboard/?level=beginner')
        self.assertEqual(resp.status_code, 200)

    def test_requires_auth(self):
        self.client.credentials()
        resp = self.client.get('/api/v1/leaderboard/')
        self.assertEqual(resp.status_code, 401)

    def test_response_shape(self):
        resp = self.client.get('/api/v1/leaderboard/')
        entry = resp.data['data'][0]
        for field in ['student_id', 'student_name', 'sport', 'level', 'current_score', 'improvement']:
            self.assertIn(field, entry)
