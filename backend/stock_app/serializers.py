from rest_framework import serializers
from .models import Supplier, Product, Stock, StockMovement, DataUploadHistory, Notification

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ('id', 'name', 'email', 'phone', 'address', 'created_at', 'updated_at')

class ProductSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)

    class Meta:
        model = Product
        fields = ('id', 'name', 'description', 'sku', 'supplier', 'supplier_name', 'unit_price', 'created_at', 'updated_at')

class StockSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = Stock
        fields = ('id', 'product', 'product_name', 'quantity', 'location', 'last_checked', 'minimum_threshold', 'maximum_threshold')

class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    performed_by_username = serializers.CharField(source='performed_by.username', read_only=True)

    class Meta:
        model = StockMovement
        fields = ('id', 'product', 'product_name', 'movement_type', 'quantity', 'reference_number', 'timestamp', 'performed_by', 'performed_by_username', 'notes')

class StockMovementCreateSerializer(StockMovementSerializer):
    class Meta(StockMovementSerializer.Meta):
        fields = ('product', 'movement_type', 'quantity', 'reference_number', 'notes')

class DataUploadHistorySerializer(serializers.ModelSerializer):
    uploaded_by_username = serializers.CharField(source='uploaded_by.username', read_only=True)

    class Meta:
        model = DataUploadHistory
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('created_at',)

class ProductDetailSerializer(ProductSerializer):
    stock_records = StockSerializer(many=True, read_only=True)
    movements = StockMovementSerializer(many=True, read_only=True)

    class Meta(ProductSerializer.Meta):
        fields = tuple(list(ProductSerializer.Meta.fields) + ['stock_records', 'movements'])

class SupplierDetailSerializer(SupplierSerializer):
    products = ProductSerializer(many=True, read_only=True)

    class Meta(SupplierSerializer.Meta):
        fields = tuple(list(SupplierSerializer.Meta.fields) + ['products'])
