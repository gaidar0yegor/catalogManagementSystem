from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.http import FileResponse, Http404
import os
import mimetypes
import logging

from ..models import (
    ImportConfiguration,
    WebScraperConfig,
    DataUploadHistory,
    Notification
)
from ..serializers import (
    ImportConfigurationSerializer,
    WebScraperConfigSerializer,
    DataUploadHistorySerializer,
    FilePreviewSerializer,
    ProductImportSerializer
)

logger = logging.getLogger(__name__)

class ImportConfigurationViewSet(viewsets.ModelViewSet):
    queryset = ImportConfiguration.objects.all()
    serializer_class = ImportConfigurationSerializer
    permission_classes = [IsAuthenticated]

class WebScraperConfigViewSet(viewsets.ModelViewSet):
    queryset = WebScraperConfig.objects.all()
    serializer_class = WebScraperConfigSerializer
    permission_classes = [IsAuthenticated]

class DataUploadHistoryViewSet(viewsets.ModelViewSet):
    queryset = DataUploadHistory.objects.all().order_by('-upload_date')  # Order by newest first
    serializer_class = DataUploadHistorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['file_name']
    filterset_fields = ['upload_type', 'status', 'uploaded_by']
    pagination_class = None  # Disable pagination for this viewset

    @action(detail=True, methods=['GET'], url_path='download')
    def download_file(self, request, pk=None):
        try:
            upload_history = self.get_object()
            if not upload_history.file_name:
                return Response(
                    {'error': 'No file associated with this record'},
                    status=status.HTTP_404_NOT_FOUND
                )

            file_path = os.path.join('/app/upload_temp', upload_history.file_name)
            if not os.path.exists(file_path):
                logger.error(f"File not found at path: {file_path}")
                return Response(
                    {'error': 'File not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Get the file's mime type
            content_type, _ = mimetypes.guess_type(file_path)
            if not content_type:
                content_type = 'application/octet-stream'

            # Open the file in binary mode
            file_handle = open(file_path, 'rb')
            response = FileResponse(
                file_handle,
                content_type=content_type,
                as_attachment=True,
                filename=upload_history.file_name
            )

            # Add Content-Length header
            response['Content-Length'] = os.path.getsize(file_path)

            return response

        except Http404:
            logger.error(f"Record not found for ID: {pk}")
            return Response(
                {'error': 'Record not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error downloading file: {str(e)}")
            return Response(
                {'error': 'Failed to download file', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['POST'], url_path='upload-file')
    def upload_file(self, request):
        try:
            # Validate file upload
            file_serializer = FilePreviewSerializer(data=request.data)
            if not file_serializer.is_valid():
                return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            uploaded_file = request.FILES['file']
            
            # Create upload history record
            upload_history = DataUploadHistory.objects.create(
                upload_type='FILE',
                file_name=uploaded_file.name,
                uploaded_by=request.user,
                status='PENDING',
                records_processed=0,
                records_failed=0
            )

            # Ensure upload directory exists
            os.makedirs('/app/upload_temp', exist_ok=True)

            # Save the file
            file_path = os.path.join('/app/upload_temp', uploaded_file.name)
            with open(file_path, 'wb+') as destination:
                for chunk in uploaded_file.chunks():
                    destination.write(chunk)

            # Process the file
            try:
                # For now, just mark as completed with basic processing
                upload_history.status = 'COMPLETED'
                upload_history.records_processed = 1
                upload_history.save()

                # Create notification for successful upload
                Notification.objects.create(
                    type='UPLOAD_COMPLETE',
                    message=f'File "{uploaded_file.name}" uploaded successfully',
                    user=request.user
                )

                return Response({
                    'message': f'File "{uploaded_file.name}" uploaded successfully',
                    'upload_id': upload_history.id,
                    'status': 'COMPLETED',
                    'records_processed': 1,
                    'records_failed': 0
                }, status=status.HTTP_201_CREATED)

            except Exception as e:
                logger.error(f"Error processing file: {str(e)}")
                upload_history.status = 'FAILED'
                upload_history.error_message = str(e)
                upload_history.save()

                # Create notification for failed upload
                Notification.objects.create(
                    type='UPLOAD_FAILED',
                    message=f'Failed to process file "{uploaded_file.name}": {str(e)}',
                    user=request.user
                )

                return Response({
                    'error': 'Failed to process file',
                    'detail': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            logger.error(f"Error uploading file: {str(e)}")
            # Create notification for failed upload
            Notification.objects.create(
                type='UPLOAD_FAILED',
                message=f'Failed to upload file: {str(e)}',
                user=request.user
            )
            return Response({
                'error': 'Failed to upload file',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['POST'], url_path='import-products')
    def import_products(self, request):
        try:
            serializer = ProductImportSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            uploaded_file = request.FILES['file']

            # Create upload history record
            upload_history = DataUploadHistory.objects.create(
                upload_type='FILE',
                file_name=uploaded_file.name,
                uploaded_by=request.user,
                status='PROCESSING',
                records_processed=0,
                records_failed=0
            )

            # Ensure upload directory exists
            os.makedirs('/app/upload_temp', exist_ok=True)

            # Save the file
            file_path = os.path.join('/app/upload_temp', uploaded_file.name)
            with open(file_path, 'wb+') as destination:
                for chunk in uploaded_file.chunks():
                    destination.write(chunk)

            try:
                # Process product import
                # Implementation details would go here
                upload_history.status = 'COMPLETED'
                upload_history.records_processed = 1
                upload_history.save()

                # Create notification for successful import
                Notification.objects.create(
                    type='UPLOAD_COMPLETE',
                    message=f'Products from "{uploaded_file.name}" imported successfully',
                    user=request.user
                )

                return Response({
                    'message': f'Products from "{uploaded_file.name}" imported successfully',
                    'upload_id': upload_history.id,
                    'status': 'COMPLETED',
                    'records_processed': 1,
                    'records_failed': 0
                }, status=status.HTTP_201_CREATED)

            except Exception as e:
                logger.error(f"Error importing products: {str(e)}")
                upload_history.status = 'FAILED'
                upload_history.error_message = str(e)
                upload_history.save()

                # Create notification for failed import
                Notification.objects.create(
                    type='UPLOAD_FAILED',
                    message=f'Failed to import products from "{uploaded_file.name}": {str(e)}',
                    user=request.user
                )

                return Response({
                    'error': 'Failed to import products',
                    'detail': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            logger.error(f"Error in product import: {str(e)}")
            # Create notification for failed import
            Notification.objects.create(
                type='UPLOAD_FAILED',
                message=f'Failed to process import: {str(e)}',
                user=request.user
            )
            return Response({
                'error': 'Failed to process import',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
