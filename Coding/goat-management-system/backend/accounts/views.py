import logging
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError

from core.responses import success_response, error_response, created_response
from .permissions import IsAdmin
from .models import User
from .serializers import LoginSerializer, RegisterSerializer, UserSerializer, ChangePasswordSerializer
from .services import generate_tokens, blacklist_token

logger = logging.getLogger(__name__)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response('Invalid credentials.', serializer.errors)

        user = serializer.validated_data['user']
        tokens = generate_tokens(user)
        logger.info('Login: %s', user.email)

        return success_response(
            data={**tokens, 'user': UserSerializer(user).data},
            message='Login successful.',
        )


class RegisterView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response('Registration failed.', serializer.errors)

        user = serializer.save()
        return created_response(
            data=UserSerializer(user).data,
            message='User created successfully.',
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return error_response('Refresh token is required.')
        try:
            blacklist_token(refresh_token)
            logger.info('Logout: %s', request.user.email)
            return success_response(message='Logged out successfully.')
        except TokenError:
            return error_response('Invalid or expired token.')


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return success_response(data=UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if not serializer.is_valid():
            return error_response('Update failed.', serializer.errors)
        serializer.save()
        return success_response(data=serializer.data, message='Profile updated.')


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return error_response('Password change failed.', serializer.errors)

        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        logger.info('Password changed: %s', request.user.email)
        return success_response(message='Password changed successfully.')


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return error_response('Email is required.')

        # Always return success to prevent email enumeration
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return success_response(message='If that email exists, a reset link has been sent.')

        token_generator = PasswordResetTokenGenerator()
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = token_generator.make_token(user)

        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        reset_url = f'{frontend_url}/reset-password?uid={uid}&token={token}'

        try:
            send_mail(
                subject='GOAT Academy — Password Reset',
                message=(
                    f'Hi {user.full_name},\n\n'
                    f'You requested a password reset for your GOAT Academy account.\n\n'
                    f'Click the link below to set a new password (valid for 1 hour):\n\n'
                    f'{reset_url}\n\n'
                    f'If you did not request this, you can safely ignore this email.\n\n'
                    f'— GOAT Martial Arts Academy'
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception as exc:
            logger.error('Failed to send password reset email to %s: %s', email, exc)
            return error_response(
                'Could not send reset email. Please check the email configuration in the server settings.',
                status_code=503,
            )
        logger.info('Password reset requested: %s', email)
        # In DEBUG mode return the reset URL so dev can test without real email
        response_data = {'debug_reset_url': reset_url} if settings.DEBUG else None
        return success_response(message='If that email exists, a reset link has been sent.', data=response_data)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uid = request.data.get('uid', '')
        token = request.data.get('token', '')
        new_password = request.data.get('new_password', '')

        if not uid or not token or not new_password:
            return error_response('uid, token, and new_password are required.')

        if len(new_password) < 8:
            return error_response('Password must be at least 8 characters.')

        try:
            pk = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=pk)
        except (User.DoesNotExist, ValueError, Exception):
            return error_response('Invalid reset link.', status_code=400)

        token_generator = PasswordResetTokenGenerator()
        if not token_generator.check_token(user, token):
            return error_response('Reset link has expired or is invalid.', status_code=400)

        user.set_password(new_password)
        user.save()
        logger.info('Password reset completed: %s', user.email)
        return success_response(message='Password reset successfully. You can now sign in.')
