import logging
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User

logger = logging.getLogger(__name__)


def generate_tokens(user: User) -> dict:
    refresh = RefreshToken.for_user(user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }


def blacklist_token(refresh_token: str) -> None:
    token = RefreshToken(refresh_token)
    token.blacklist()


def create_user(email: str, full_name: str, password: str, role: str = User.Role.STUDENT) -> User:
    user = User.objects.create_user(
        email=email,
        full_name=full_name,
        password=password,
        role=role,
    )
    logger.info('User created: %s (role=%s)', email, role)
    return user
