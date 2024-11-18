from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"

class Brand(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    website = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Supplier(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    address = models.TextField()
    currency = models.CharField(max_length=3, default='USD')  # Added currency
    payment_terms = models.TextField(blank=True)  # Added payment terms
    is_active = models.BooleanField(default=True)  # Added active status
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    sku = models.CharField(max_length=50, unique=True)
    barcode = models.CharField(max_length=100, blank=True)  # Added barcode
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True)  # Added brand
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)  # Added category
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='products')
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  # Added default value
    is_active = models.BooleanField(default=True)  # Added active status
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.sku})"

class PriceHistory(models.Model):
    PRICE_TYPES = [
        ('PURCHASE', 'Purchase Price'),
        ('SALE', 'Sale Price'),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='price_history')
    price_type = models.CharField(max_length=10, choices=PRICE_TYPES)
    old_price = models.DecimalField(max_digits=10, decimal_places=2)
    new_price = models.DecimalField(max_digits=10, decimal_places=2)
    changed_at = models.DateTimeField(auto_now_add=True)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    reason = models.TextField(blank=True)

    def __str__(self):
        return f"{self.product.name} - {self.price_type} change"

class Stock(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_records')
    quantity = models.IntegerField()
    location = models.CharField(max_length=100)
    last_checked = models.DateTimeField(auto_now=True)
    minimum_threshold = models.IntegerField(default=10)
    maximum_threshold = models.IntegerField(default=100)

    def __str__(self):
        return f"{self.product.name} - {self.quantity} units"

class StockMovement(models.Model):
    MOVEMENT_TYPES = [
        ('IN', 'Stock In'),
        ('OUT', 'Stock Out'),
        ('ADJUST', 'Adjustment'),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='movements')
    movement_type = models.CharField(max_length=6, choices=MOVEMENT_TYPES)
    quantity = models.IntegerField()
    reference_number = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.get_movement_type_display()} - {self.product.name} ({self.quantity})"

class ImportConfiguration(models.Model):
    IMPORT_TYPES = [
        ('FTP', 'FTP'),
        ('SFTP', 'SFTP'),
        ('SCRAPER', 'Web Scraper'),
    ]

    name = models.CharField(max_length=200)
    import_type = models.CharField(max_length=10, choices=IMPORT_TYPES)
    host = models.CharField(max_length=255, blank=True)
    port = models.IntegerField(null=True, blank=True)
    username = models.CharField(max_length=100, blank=True)
    password = models.CharField(max_length=100, blank=True)
    remote_path = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    schedule = models.CharField(max_length=100, blank=True)  # Cron expression
    last_run = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.get_import_type_display()})"

class WebScraperConfig(models.Model):
    name = models.CharField(max_length=200)
    url = models.URLField()
    selectors = models.JSONField()  # Store CSS selectors for scraping
    schedule = models.CharField(max_length=100, blank=True)  # Cron expression
    is_active = models.BooleanField(default=True)
    last_run = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class DataUploadHistory(models.Model):
    UPLOAD_TYPES = [
        ('FILE', 'File Upload'),
        ('API', 'API Upload'),
        ('SCRAPE', 'Web Scraping'),
        ('FTP', 'FTP/SFTP Upload'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]

    upload_type = models.CharField(max_length=10, choices=UPLOAD_TYPES)
    file_name = models.CharField(max_length=255, null=True, blank=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    upload_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    records_processed = models.IntegerField(default=0)
    records_failed = models.IntegerField(default=0)
    error_message = models.TextField(blank=True)

    def __str__(self):
        return f"{self.get_upload_type_display()} - {self.upload_date}"

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('STOCK_LOW', 'Low Stock Alert'),
        ('STOCK_HIGH', 'High Stock Alert'),
        ('UPLOAD_COMPLETE', 'Upload Complete'),
        ('UPLOAD_FAILED', 'Upload Failed'),
        ('SYSTEM', 'System Notification'),
    ]

    type = models.CharField(max_length=15, choices=NOTIFICATION_TYPES)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')

    def __str__(self):
        return f"{self.get_type_display()} - {self.created_at}"
