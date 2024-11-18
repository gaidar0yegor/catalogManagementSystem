from rest_framework import status
from rest_framework.response import Response

def bad_request(request, exception=None):
    return Response({
        'error': 'Bad Request',
        'message': str(exception) if exception else 'Invalid request'
    }, status=status.HTTP_400_BAD_REQUEST)

def permission_denied(request, exception=None):
    return Response({
        'error': 'Permission Denied',
        'message': str(exception) if exception else 'You do not have permission to perform this action'
    }, status=status.HTTP_403_FORBIDDEN)

def page_not_found(request, exception=None):
    return Response({
        'error': 'Not Found',
        'message': str(exception) if exception else 'The requested resource was not found'
    }, status=status.HTTP_404_NOT_FOUND)

def server_error(request, exception=None):
    return Response({
        'error': 'Internal Server Error',
        'message': 'An unexpected error occurred'
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
