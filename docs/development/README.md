# Development Guide

## Development Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker and Docker Compose
- Git

### Quick Start

1. Clone and setup:
```bash
git clone <repository-url>
cd stock-management
cp .env.example .env
```

2. Start services:
```bash
docker-compose up --build
```

3. Access:
- Frontend: http://localhost
- API: http://localhost/api
- Admin: http://localhost/admin

## Project Structure

### Frontend (Svelte + TypeScript)

```
frontend-svelte/
├── src/
│   ├── lib/
│   │   ├── components/    # UI Components
│   │   ├── stores/        # State Management
│   │   └── types.ts       # TypeScript Types
│   └── App.svelte         # Root Component
```

Key Components:
- Dashboard: Real-time metrics display
- StockList: Inventory management
- ProductForm: Product CRUD operations
- ImportSystem: Data import functionality

### Backend (Django + DRF)

```
backend/
├── stock_app/
│   ├── models.py          # Data Models
│   ├── views/            # API Endpoints
│   ├── serializers.py    # Data Serialization
│   └── urls.py           # URL Routing
└── stock_management/     # Project Config
```

Key Features:
- RESTful API endpoints
- JWT Authentication
- Celery task queue
- PostgreSQL database

## API Endpoints

- `/api/dashboard/metrics/`: Dashboard statistics
- `/api/products/`: Product management
- `/api/stock/`: Stock operations
- `/api/stock-movements/`: Movement tracking
- `/api/suppliers/`: Supplier management
- `/api/import-configs/`: Import settings
- `/api/notifications/`: System alerts

## Development Workflow

1. Backend Changes:
   - Update models/views in backend/stock_app/
   - Run migrations if needed
   - Test API endpoints

2. Frontend Changes:
   - Modify components in frontend-svelte/src/
   - Update state in stores/
   - Test UI interactions

3. Testing:
   ```bash
   # Backend
   python manage.py test
   
   # Frontend
   npm run test
   ```

## Common Issues

1. Dashboard Metrics Error:
   - Check authentication token
   - Verify API endpoint response
   - Ensure database connectivity

2. Import System:
   - Validate file formats
   - Check import configurations
   - Monitor Celery tasks

3. Stock Management:
   - Verify stock calculations
   - Check movement validations
   - Test threshold alerts

## Environment Variables

Key variables in .env:
- `DJANGO_SECRET_KEY`: Django secret key
- `DJANGO_DEBUG`: Debug mode
- `DB_NAME`: Database name
- `REDIS_URL`: Redis connection
- `CELERY_BROKER_URL`: Message broker
