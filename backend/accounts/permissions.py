from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin


class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'student'


class IsAdminOrOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_admin:
            return True
        return hasattr(obj, 'user') and obj.user == request.user
