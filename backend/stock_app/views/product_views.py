from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponse
import csv
import pandas as pd

from ..models import (
    Product,
    PriceHistory,
    Stock,
    StockMovement,
    DataUploadHistory
)
from ..serializers import (
    ProductSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    FilePreviewSerializer,
    ProductImportSerializer,
    BulkProductUpdateSerializer
)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['name', 'description', 'sku', 'barcode']
    filterset_fields = ['is_active', 'brand', 'category', 'supplier']

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        elif self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductSerializer

    @action(detail=False, methods=['post'])
    def preview_import(self, request):
        serializer = FilePreviewSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            file = serializer.validated_data['file']
            header_row = serializer.validated_data['header_row']
            preview_rows = serializer.validated_data['preview_rows']

            # Read the file
            if file.name.endswith('.csv'):
                df = pd.read_csv(file, nrows=preview_rows + header_row + 1, encoding='utf-8')
            else:  # Excel files
                df = pd.read_excel(file, nrows=preview_rows + header_row + 1)

            # Get headers and preview data
            headers = df.iloc[header_row].tolist()
            preview_data = df.iloc[header_row + 1:header_row + 1 + preview_rows].to_dict('records')

            # Suggest column mapping
            model_fields = ['name', 'sku', 'description', 'barcode', 'unit_price', 'purchase_price']
            suggested_mapping = {}
            
            for field in model_fields:
                # Try to find an exact match
                matches = [h for h in headers if h.lower() == field.lower()]
                if matches:
                    suggested_mapping[field] = matches[0]
                else:
                    # Try to find a partial match
                    matches = [h for h in headers if field.lower() in h.lower()]
                    if matches:
                        suggested_mapping[field] = matches[0]

            return Response({
                'headers': headers,
                'preview': preview_data,
                'suggested_mapping': suggested_mapping
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def import_products(self, request):
        serializer = ProductImportSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        file = serializer.validated_data['file']
        header_row = serializer.validated_data['header_row']
        data_start_row = serializer.validated_data['data_start_row']
        column_mapping = serializer.validated_data['column_mapping']

        upload_history = DataUploadHistory.objects.create(
            upload_type='FILE',
            file_name=file.name,
            uploaded_by=request.user,
            status='PROCESSING'
        )

        try:
            # Read the file
            if file.name.endswith('.csv'):
                df = pd.read_csv(file, skiprows=header_row, encoding='utf-8')
            else:  # Excel files
                df = pd.read_excel(file, skiprows=header_row)

            # Skip to data start row
            df = df.iloc[data_start_row - header_row - 1:]

            # Process each row
            for _, row in df.iterrows():
                product_data = {}
                for model_field, file_column in column_mapping.items():
                    if file_column in df.columns:
                        value = row[file_column]
                        # Handle NaN values
                        if pd.isna(value):
                            value = None
                        product_data[model_field] = value

                product_serializer = ProductSerializer(data=product_data)
                if product_serializer.is_valid():
                    product_serializer.save()
                    upload_history.records_processed += 1
                else:
                    upload_history.records_failed += 1
                    upload_history.error_message += f"Row {_}: {product_serializer.errors}\n"

            upload_history.status = 'COMPLETED'
            upload_history.save()

            return Response({
                'status': 'success',
                'processed': upload_history.records_processed,
                'failed': upload_history.records_failed,
                'errors': upload_history.error_message if upload_history.error_message else None
            })

        except Exception as e:
            upload_history.status = 'FAILED'
            upload_history.error_message = str(e)
            upload_history.save()
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        serializer = BulkProductUpdateSerializer(data=request.data)
        if serializer.is_valid():
            product_ids = serializer.validated_data['product_ids']
            action = serializer.validated_data['action']
            value = serializer.validated_data.get('value', {})

            products = Product.objects.filter(id__in=product_ids)
            
            if action == 'update_price':
                new_price = value.get('price')
                if new_price is not None:
                    for product in products:
                        PriceHistory.objects.create(
                            product=product,
                            price_type='SALE',
                            old_price=product.unit_price,
                            new_price=new_price,
                            changed_by=request.user
                        )
                        product.unit_price = new_price
                        product.save()

            elif action == 'update_stock':
                quantity = value.get('quantity')
                if quantity is not None:
                    for product in products:
                        stock = product.stock_records.first()
                        if stock:
                            StockMovement.objects.create(
                                product=product,
                                movement_type='ADJUST',
                                quantity=quantity - stock.quantity,
                                reference_number=f'BULK-ADJ-{product.id}',
                                performed_by=request.user
                            )
                            stock.quantity = quantity
                            stock.save()

            elif action in ['activate', 'deactivate']:
                is_active = action == 'activate'
                products.update(is_active=is_active)

            return Response({'status': 'success'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def export_products(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = ProductListSerializer(queryset, many=True)
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="products.csv"'
        
        writer = csv.writer(response)
        
        # Write headers
        headers = ['ID', 'Name', 'SKU', 'Barcode', 'Unit Price', 'Current Stock', 'Status']
        writer.writerow(headers)
        
        # Write data
        for product in serializer.data:
            writer.writerow([
                product['id'],
                product['name'],
                product['sku'],
                product['barcode'],
                product['unit_price'],
                product['current_stock'],
                'Active' if product['is_active'] else 'Inactive'
            ])
        
        return response
