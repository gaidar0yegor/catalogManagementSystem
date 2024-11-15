from django.contrib import admin
from .models import Supplier, Product, Stock, StockMovement, DataUploadHistory, Notification

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'created_at')
    search_fields = ('name', 'email')
    list_filter = ('created_at',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'sku', 'supplier', 'unit_price', 'created_at')
    search_fields = ('name', 'sku')
    list_filter = ('supplier', 'created_at')

@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ('product', 'quantity', 'location', 'last_checked')
    search_fields = ('product__name', 'location')
    list_filter = ('location', 'last_checked')

@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ('product', 'movement_type', 'quantity', 'reference_number', 'timestamp')
    search_fields = ('product__name', 'reference_number')
    list_filter = ('movement_type', 'timestamp')

@admin.register(DataUploadHistory)
class DataUploadHistoryAdmin(admin.ModelAdmin):
    list_display = ('upload_type', 'file_name', 'status', 'upload_date')
    search_fields = ('file_name',)
    list_filter = ('upload_type', 'status', 'upload_date')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('type', 'message', 'created_at', 'read', 'user')
    search_fields = ('message',)
    list_filter = ('type', 'read', 'created_at')
