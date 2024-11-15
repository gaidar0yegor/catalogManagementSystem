from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def health_check(request):
    return HttpResponse("healthy", content_type="text/plain")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('stock_app.urls')),
    path('health/', health_check, name='health_check'),
]
