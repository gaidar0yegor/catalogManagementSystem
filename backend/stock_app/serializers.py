from rest_framework import serializers
from .models import (
    Category,
    Brand,
    Supplier,
    Product,
    Stock,
    StockMovement,
    PriceHistory,
    ImportConfiguration,
    WebScraperConfig,
    DataUploadHistory,
    Notification
)

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = '__all__'

class SupplierSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Supplier
        fields = '__all__'

    def get_product_count(self, obj):
        return obj.products.count()

class ProductSerializer(serializers.ModelSerializer):
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    current_stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'sku', 'barcode', 'brand', 'brand_name',
            'category', 'category_name', 'supplier', 'supplier_name', 'unit_price',
            'purchase_price', 'is_active', 'current_stock', 'created_at', 'updated_at'
        ]

    def get_current_stock(self, obj):
        stock = obj.stock_records.first()
        return stock.quantity if stock else 0

class StockSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = Stock
        fields = '__all__'

class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    performed_by_username = serializers.CharField(source='performed_by.username', read_only=True)

    class Meta:
        model = StockMovement
        fields = '__all__'

class PriceHistorySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    changed_by_username = serializers.CharField(source='changed_by.username', read_only=True)

    class Meta:
        model = PriceHistory
        fields = '__all__'

class ImportConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImportConfiguration
        fields = '__all__'
        extra_kwargs = {
            'password': {'write_only': True}
        }

class WebScraperConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebScraperConfig
        fields = '__all__'

class DataUploadHistorySerializer(serializers.ModelSerializer):
    uploaded_by_username = serializers.CharField(source='uploaded_by.username', read_only=True)

    class Meta:
        model = DataUploadHistory
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class DashboardMetricsSerializer(serializers.Serializer):
    totalProducts = serializers.IntegerField()
    activeSuppliers = serializers.IntegerField()
    lowStockItems = serializers.IntegerField()
    totalValue = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)
    recentImports = serializers.ListSerializer(child=DataUploadHistorySerializer())
    recentActivity = serializers.ListSerializer(child=StockMovementSerializer())
    alerts = serializers.ListSerializer(child=NotificationSerializer())

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Convert QuerySets to serialized data
        data['recentImports'] = DataUploadHistorySerializer(instance['recentImports'], many=True).data
        data['recentActivity'] = StockMovementSerializer(instance['recentActivity'], many=True).data
        data['alerts'] = NotificationSerializer(instance['alerts'], many=True).data
        return data

# Advanced Serializers for specific use cases
class ProductDetailSerializer(ProductSerializer):
    stock_movements = StockMovementSerializer(many=True, read_only=True, source='movements')
    price_history = PriceHistorySerializer(many=True, read_only=True)
    stock_records = StockSerializer(many=True, read_only=True)

    class Meta(ProductSerializer.Meta):
        fields = ProductSerializer.Meta.fields + [
            'stock_movements',
            'price_history',
            'stock_records'
        ]

class ProductListSerializer(ProductSerializer):
    class Meta(ProductSerializer.Meta):
        fields = ['id', 'name', 'sku', 'barcode', 'unit_price', 'current_stock', 'is_active']

class BulkProductUpdateSerializer(serializers.Serializer):
    product_ids = serializers.ListField(child=serializers.IntegerField())
    action = serializers.ChoiceField(choices=['update_price', 'update_stock', 'deactivate', 'activate'])
    value = serializers.JSONField(required=False)

class FilePreviewSerializer(serializers.Serializer):
    file = serializers.FileField()
    header_row = serializers.IntegerField(default=0)
    preview_rows = serializers.IntegerField(default=5)

class ProductImportSerializer(serializers.Serializer):
    file = serializers.FileField()
    header_row = serializers.IntegerField(default=0)
    data_start_row = serializers.IntegerField(default=1)
    column_mapping = serializers.JSONField()

    def validate_column_mapping(self, value):
        required_fields = ['name', 'sku']
        for field in required_fields:
            if field not in value or not value[field]:
                raise serializers.ValidationError(f"'{field}' is required in column mapping")
        return value

    def validate(self, data):
        if data['data_start_row'] <= data['header_row']:
            raise serializers.ValidationError("Data start row must be greater than header row")
        return data
