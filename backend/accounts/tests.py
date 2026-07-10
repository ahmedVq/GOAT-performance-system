from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import User


def make_admin(**kwargs):
    defaults = dict(email='admin@goat.com', full_name='Test Admin', role='admin', is_active=True)
    defaults.update(kwargs)
    u = User(**defaults)
    u.set_password('Admin123!')
    u.save()
    return u


def make_student_user(**kwargs):
    defaults = dict(email='student@goat.com', full_name='Test Student', role='student', is_active=True)
    defaults.update(kwargs)
    u = User(**defaults)
    u.set_password('Student123!')
    u.save()
    return u


def get_tokens(client, email, password):
    resp = client.post('/api/v1/auth/login/', {'email': email, 'password': password}, format='json')
    return resp.data['data']['access'], resp.data['data']['refresh']


class LoginTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = make_admin()

    def test_login_success(self):
        resp = self.client.post('/api/v1/auth/login/', {
            'email': 'admin@goat.com', 'password': 'Admin123!'
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.data['success'])
        self.assertIn('access', resp.data['data'])
        self.assertIn('refresh', resp.data['data'])
        self.assertEqual(resp.data['data']['user']['role'], 'admin')

    def test_login_wrong_password(self):
        resp = self.client.post('/api/v1/auth/login/', {
            'email': 'admin@goat.com', 'password': 'wrong'
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(resp.data['success'])

    def test_login_unknown_email(self):
        resp = self.client.post('/api/v1/auth/login/', {
            'email': 'nobody@goat.com', 'password': 'Admin123!'
        }, format='json')
        self.assertFalse(resp.data['success'])

    def test_login_inactive_user(self):
        self.admin.is_active = False
        self.admin.save()
        resp = self.client.post('/api/v1/auth/login/', {
            'email': 'admin@goat.com', 'password': 'Admin123!'
        }, format='json')
        self.assertFalse(resp.data['success'])

    def test_login_missing_fields(self):
        resp = self.client.post('/api/v1/auth/login/', {}, format='json')
        self.assertFalse(resp.data['success'])


class MeTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = make_admin()
        token, _ = get_tokens(self.client, 'admin@goat.com', 'Admin123!')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_get_me(self):
        resp = self.client.get('/api/v1/auth/me/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['data']['email'], 'admin@goat.com')

    def test_get_me_unauthenticated(self):
        self.client.credentials()
        resp = self.client.get('/api/v1/auth/me/')
        self.assertEqual(resp.status_code, 401)

    def test_patch_me(self):
        resp = self.client.patch('/api/v1/auth/me/', {'full_name': 'Updated Name'}, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['data']['full_name'], 'Updated Name')


class LogoutTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        make_admin()

    def test_logout_success(self):
        token, refresh = get_tokens(self.client, 'admin@goat.com', 'Admin123!')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        resp = self.client.post('/api/v1/auth/logout/', {'refresh': refresh}, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data['success'])

    def test_logout_without_refresh(self):
        token, _ = get_tokens(self.client, 'admin@goat.com', 'Admin123!')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        resp = self.client.post('/api/v1/auth/logout/', {}, format='json')
        self.assertFalse(resp.data['success'])


class RegisterTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        admin = make_admin()
        token, _ = get_tokens(self.client, 'admin@goat.com', 'Admin123!')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_register_by_admin(self):
        resp = self.client.post('/api/v1/auth/register/', {
            'email': 'new@goat.com', 'full_name': 'New User',
            'password': 'NewPass123!', 'password_confirm': 'NewPass123!', 'role': 'student',
        }, format='json')
        self.assertIn(resp.status_code, [200, 201])
        self.assertTrue(resp.data['success'])

    def test_register_duplicate_email(self):
        self.client.post('/api/v1/auth/register/', {
            'email': 'dup@goat.com', 'full_name': 'Dup',
            'password': 'Pass123!', 'password_confirm': 'Pass123!', 'role': 'student',
        }, format='json')
        resp = self.client.post('/api/v1/auth/register/', {
            'email': 'dup@goat.com', 'full_name': 'Dup2',
            'password': 'Pass123!', 'password_confirm': 'Pass123!', 'role': 'student',
        }, format='json')
        self.assertFalse(resp.data['success'])

    def test_register_forbidden_for_student(self):
        student = make_student_user(email='s@goat.com')
        s_token, _ = get_tokens(self.client, 's@goat.com', 'Student123!')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {s_token}')
        resp = self.client.post('/api/v1/auth/register/', {
            'email': 'x@goat.com', 'full_name': 'X',
            'password': 'Pass123!', 'password_confirm': 'Pass123!', 'role': 'student',
        }, format='json')
        self.assertEqual(resp.status_code, 403)


class ChangePasswordTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        make_admin()
        token, _ = get_tokens(self.client, 'admin@goat.com', 'Admin123!')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_change_password_success(self):
        resp = self.client.post('/api/v1/auth/change-password/', {
            'current_password': 'Admin123!',
            'new_password': 'NewAdmin456!',
            'new_password_confirm': 'NewAdmin456!',
        }, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data['success'])

    def test_change_password_wrong_old(self):
        resp = self.client.post('/api/v1/auth/change-password/', {
            'current_password': 'WrongPass!',
            'new_password': 'NewAdmin456!',
            'new_password_confirm': 'NewAdmin456!',
        }, format='json')
        self.assertFalse(resp.data['success'])
