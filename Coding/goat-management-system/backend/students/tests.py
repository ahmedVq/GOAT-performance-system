import uuid
from django.test import TestCase
from rest_framework.test import APIClient
from accounts.models import User
from .models import Branch, Student


def make_admin(email='admin@goat.com'):
    u = User(email=email, full_name='Admin', role='admin', is_active=True)
    u.set_password('Admin123!')
    u.save()
    return u


def make_branch(name='GOAT Main Branch'):
    return Branch.objects.create(name=name, location='Cairo', is_active=True)


def get_token(client, email='admin@goat.com', password='Admin123!'):
    resp = client.post('/api/v1/auth/login/', {'email': email, 'password': password}, format='json')
    return resp.data['data']['access']


def auth_admin(client):
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {get_token(client)}')


STUDENT_PAYLOAD = {
    'full_name': 'Adam Boxer',
    'email': 'adam@goat.com',
    'password': 'Adam1234!',
    'sport': 'boxing',
    'join_date': '2026-01-01',
}


class BranchTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        make_admin()
        auth_admin(self.client)
        self.branch = make_branch()

    def test_list_branches(self):
        resp = self.client.get('/api/v1/students/branches/')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data['success'])
        self.assertEqual(len(resp.data['data']), 1)

    def test_branches_require_auth(self):
        self.client.credentials()
        resp = self.client.get('/api/v1/students/branches/')
        self.assertEqual(resp.status_code, 401)


class StudentCreateTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        make_admin()
        auth_admin(self.client)
        self.branch = make_branch()

    def _payload(self, **overrides):
        p = {**STUDENT_PAYLOAD, 'branch': str(self.branch.id)}
        p.update(overrides)
        return p

    def test_create_success(self):
        resp = self.client.post('/api/v1/students/', self._payload(), format='json')
        self.assertIn(resp.status_code, [200, 201])
        self.assertTrue(resp.data['success'])
        self.assertTrue(resp.data['data']['student_id'].startswith('GOAT-'))

    def test_student_id_auto_increments(self):
        self.client.post('/api/v1/students/', self._payload(), format='json')
        self.client.post('/api/v1/students/', self._payload(email='adam2@goat.com'), format='json')
        ids = sorted(s.student_id for s in Student.objects.all())
        self.assertEqual(ids, ['GOAT-001', 'GOAT-002'])

    def test_duplicate_email_rejected(self):
        self.client.post('/api/v1/students/', self._payload(), format='json')
        resp = self.client.post('/api/v1/students/', self._payload(), format='json')
        self.assertFalse(resp.data['success'])

    def test_invalid_sport_rejected(self):
        resp = self.client.post('/api/v1/students/', self._payload(sport='karate'), format='json')
        self.assertFalse(resp.data['success'])

    def test_missing_required_fields(self):
        resp = self.client.post('/api/v1/students/', {}, format='json')
        self.assertFalse(resp.data['success'])

    def test_requires_admin_role(self):
        su = User(email='s@goat.com', full_name='S', role='student', is_active=True)
        su.set_password('Pass123!')
        su.save()
        token = get_token(self.client, 's@goat.com', 'Pass123!')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        resp = self.client.post('/api/v1/students/', self._payload(), format='json')
        self.assertEqual(resp.status_code, 403)


class StudentListFilterTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        make_admin()
        auth_admin(self.client)
        self.branch = make_branch()
        for name, email, sport in [
            ('Ali Hassan', 'ali@goat.com', 'boxing'),
            ('Sara Ali', 'sara@goat.com', 'kickboxing'),
            ('Omar Said', 'omar@goat.com', 'boxing'),
        ]:
            self.client.post('/api/v1/students/', {
                'full_name': name, 'email': email, 'password': 'Pass123!',
                'sport': sport, 'branch': str(self.branch.id), 'join_date': '2026-01-01',
            }, format='json')

    def test_list_returns_all(self):
        resp = self.client.get('/api/v1/students/')
        self.assertEqual(len(resp.data['data']), 3)

    def test_filter_boxing(self):
        resp = self.client.get('/api/v1/students/?sport=boxing')
        self.assertEqual(len(resp.data['data']), 2)

    def test_filter_kickboxing(self):
        resp = self.client.get('/api/v1/students/?sport=kickboxing')
        self.assertEqual(len(resp.data['data']), 1)

    def test_search_by_name(self):
        resp = self.client.get('/api/v1/students/?search=Sara')
        self.assertEqual(len(resp.data['data']), 1)

    def test_filter_active(self):
        resp = self.client.get('/api/v1/students/?is_active=true')
        self.assertEqual(len(resp.data['data']), 3)


class StudentDetailTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        make_admin()
        auth_admin(self.client)
        self.branch = make_branch()
        resp = self.client.post('/api/v1/students/', {
            **STUDENT_PAYLOAD, 'branch': str(self.branch.id)
        }, format='json')
        self.student_uuid = resp.data['data']['id']

    def test_get_student(self):
        resp = self.client.get(f'/api/v1/students/{self.student_uuid}/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['data']['id'], self.student_uuid)

    def test_get_nonexistent_returns_404(self):
        resp = self.client.get(f'/api/v1/students/{uuid.uuid4()}/')
        self.assertEqual(resp.status_code, 404)

    def test_patch_sport(self):
        resp = self.client.patch(f'/api/v1/students/{self.student_uuid}/', {'sport': 'kickboxing'}, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['data']['sport'], 'kickboxing')

    def test_deactivate_sets_is_active_false(self):
        self.client.delete(f'/api/v1/students/{self.student_uuid}/')
        student = Student.objects.get(id=self.student_uuid)
        self.assertFalse(student.is_active)

    def test_deactivate_returns_200(self):
        resp = self.client.delete(f'/api/v1/students/{self.student_uuid}/')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data['success'])
