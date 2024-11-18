from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'brands', views.BrandViewSet)
router.register(r'suppliers', views.SupplierViewSet)
router.register(r'products', views.ProductViewSet)
router.register(r'stock', views.StockViewSet)
router.register(r'stock-movements', views.StockMovementViewSet)
router.register(r'price-history', views.PriceHistoryViewSet)
router.register(r'import-configs', views.ImportConfigurationViewSet)
router.register(r'scraper-configs', views.WebScraperConfigViewSet)
router.register(r'upload-history', views.DataUploadHistoryViewSet)
router.register(r'notifications', views.NotificationViewSet, basename='notification')
router.register(r'dashboard', views.DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
]

# API Endpoints Overview:
# /api/categories/ - Category management
#   GET / - List all categories
#   POST / - Create new category
#   GET /{id}/ - Retrieve category
#   PUT /{id}/ - Update category
#   DELETE /{id}/ - Delete category

# /api/brands/ - Brand management
#   Similar CRUD operations as categories

# /api/suppliers/ - Supplier management
#   Similar CRUD operations as categories

# /api/products/ - Product management
#   GET / - List all products (uses ProductListSerializer)
#   POST / - Create new product
#   GET /{id}/ - Retrieve product details (uses ProductDetailSerializer)
#   PUT /{id}/ - Update product
#   DELETE /{id}/ - Delete product
#   POST /bulk-update/ - Bulk update products
#   POST /import-products/ - Import products from CSV
#   GET /export-products/ - Export products to CSV

# /api/stock/ - Stock management
#   Similar CRUD operations for stock records

# /api/stock-movements/ - Stock movement tracking
#   Similar CRUD operations for stock movements

# /api/price-history/ - Price history tracking
#   Similar CRUD operations for price history

# /api/import-configs/ - Import configuration management
#   Similar CRUD operations for import configurations

# /api/scraper-configs/ - Web scraper configuration
#   Similar CRUD operations for scraper configurations

# /api/upload-history/ - Upload history tracking
#   Similar CRUD operations for upload history

# /api/notifications/ - User notifications
#   GET / - List user's notifications
#   POST /{id}/mark-as-read/ - Mark notification as read
#   POST /mark-all-as-read/ - Mark all notifications as read

# /api/dashboard/ - Dashboard metrics
#   GET /metrics/ - Get dashboard metrics including:
#     - Total products count
#     - Active suppliers count
#     - Low stock items count
#     - Total stock value
#     - Recent imports
#     - Recent activity
#     - Unread alerts
