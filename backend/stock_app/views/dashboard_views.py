from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, F, DecimalField
from django.db.models.functions import Coalesce
from django.utils import timezone
from datetime import timedelta
import logging

from ..models import (
    Product,
    Supplier,
    Stock,
    StockMovement,
    DataUploadHistory,
    Notification
)

logger = logging.getLogger(__name__)

class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def metrics(self, request):
        try:
            logger.debug("Fetching dashboard metrics")
            
            # Get total products
            total_products = Product.objects.filter(is_active=True).count()
            logger.debug(f"Total products: {total_products}")

            # Get active suppliers
            active_suppliers = Supplier.objects.filter(is_active=True).count()
            logger.debug(f"Active suppliers: {active_suppliers}")

            # Get low stock items (products with stock below minimum threshold)
            low_stock_items = Stock.objects.filter(
                quantity__lt=F('minimum_threshold')
            ).count()
            logger.debug(f"Low stock items: {low_stock_items}")

            # Calculate total stock value
            total_value = Stock.objects.aggregate(
                total=Coalesce(
                    Sum(F('quantity') * F('product__unit_price')),
                    0,
                    output_field=DecimalField()
                )
            )['total']
            logger.debug(f"Total stock value: {total_value}")

            # Get recent imports (last 7 days)
            recent_imports = DataUploadHistory.objects.filter(
                upload_date__gte=timezone.now() - timedelta(days=7)
            ).order_by('-upload_date')[:5]
            logger.debug(f"Recent imports count: {recent_imports.count()}")

            # Get recent activity (stock movements, last 7 days)
            recent_activity = StockMovement.objects.filter(
                timestamp__gte=timezone.now() - timedelta(days=7)
            ).order_by('-timestamp')[:10]
            logger.debug(f"Recent activity count: {recent_activity.count()}")

            # Get unread alerts/notifications
            alerts = Notification.objects.filter(
                user=request.user,
                read=False
            ).order_by('-created_at')[:5]
            logger.debug(f"Alerts count: {alerts.count()}")

            # Format recent activity for frontend
            activity_list = [{
                'id': activity.id,
                'date': activity.timestamp.isoformat(),
                'type': activity.movement_type,
                'description': f"{activity.get_movement_type_display()} - {activity.product.name} ({activity.quantity} units)"
            } for activity in recent_activity]

            # Format imports for frontend
            imports_list = [{
                'id': imp.id,
                'date': imp.upload_date.isoformat(),
                'type': imp.get_upload_type_display(),
                'status': imp.status,
                'processed': imp.records_processed,
                'failed': imp.records_failed
            } for imp in recent_imports]

            # Format alerts for frontend
            alerts_list = [{
                'id': alert.id,
                'type': alert.get_type_display(),
                'message': alert.message,
                'severity': 'warning' if alert.type == 'STOCK_LOW' else 'info'
            } for alert in alerts]

            # Prepare data for serialization
            metrics = {
                'totalProducts': total_products,
                'activeSuppliers': active_suppliers,
                'lowStockItems': low_stock_items,
                'totalValue': float(total_value),
                'recentImports': imports_list,
                'recentActivity': activity_list,
                'alerts': alerts_list
            }

            logger.debug("Data prepared successfully")
            return Response(metrics)

        except Exception as e:
            logger.error(f"Error fetching dashboard metrics: {str(e)}", exc_info=True)
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
