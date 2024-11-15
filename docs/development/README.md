# Development Guide

## Project Structure

The project consists of three main components:
- Backend (Django/Python)
- Frontend (Svelte/TypeScript)
- Database (PostgreSQL)

## Development Options

You can develop the application using either Docker (recommended) or local setup.

### Option 1: Docker Development (Recommended)

1. Prerequisites:
- Docker
- Docker Compose

2. Start the development environment:
```bash
docker-compose up --build
```

This will start:
- Frontend at http://localhost:5173
- Backend at http://localhost:8000
- PostgreSQL at localhost:5432

3. View logs:
```bash
docker-compose logs -f
```

4. Common Docker commands:
```bash
# Restart services
docker-compose restart

# Stop services
docker-compose down

# View running containers
docker-compose ps

# Execute command in container
docker-compose exec backend python manage.py makemigrations
docker-compose exec frontend npm install
```

See [Docker Configuration Guide](../deployment/docker.md) for detailed Docker setup.

### Option 2: Local Development

#### Backend Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run migrations:
```bash
python manage.py migrate
```

4. Load initial data:
```bash
python manage.py loaddata stock_app/fixtures/initial_data.json
```

5. Start the development server:
```bash
python manage.py runserver
```

#### Frontend Setup

1. Install dependencies:
```bash
cd frontend-svelte
npm install
```

2. Start the development server:
```bash
npm run dev
```

## Architecture

### Backend

The backend is built with Django and Django REST Framework:

- `stock_app/`: Main application module
  - `models.py`: Database models
  - `views.py`: API endpoints
  - `serializers.py`: Data serialization
  - `urls.py`: URL routing
  - `admin.py`: Admin interface configuration
  - `fixtures/`: Initial data

### Frontend

The frontend is built with Svelte and TypeScript:

- `src/`
  - `lib/`: Reusable components and utilities
    - `stores/`: Svelte stores for state management
    - `components/`: Shared UI components
  - `routes/`: Page components
  - `app.css`: Global styles
  - `App.svelte`: Root component
  - `main.ts`: Application entry point

### State Management

The application uses Svelte stores for state management:
```typescript
// stores/stockStore.ts
import { writable } from 'svelte/store';

export const stocks = writable([]);
export const loading = writable(false);
export const error = writable(null);
```

## Development Workflow

1. Create feature branch:
```bash
git checkout -b feature/new-feature
```

2. Make changes and test:
```bash
# Backend tests
python manage.py test

# Frontend tests
npm run test
```

3. Submit pull request

## Code Style

### Backend

Follow PEP 8 guidelines:
```bash
# Install flake8
pip install flake8

# Run linter
flake8 .
```

### Frontend

Use Prettier and ESLint:
```bash
# Format code
npm run format

# Lint code
npm run lint
```

## Testing

### Backend Tests

```bash
# Run all tests
python manage.py test

# Run specific test
python manage.py test stock_app.tests.test_views
```

### Frontend Tests

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

## API Development

1. Add new endpoint:
```python
# views.py
from rest_framework import viewsets

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
```

2. Add URL:
```python
# urls.py
router.register(r'products', ProductViewSet)
```

## Database Management

1. Create migration:
```bash
python manage.py makemigrations
```

2. Apply migration:
```bash
python manage.py migrate
```

3. Create fixture:
```bash
python manage.py dumpdata stock_app > fixture.json
```

## Debugging

### Backend Debugging

1. Django Debug Toolbar:
```python
INSTALLED_APPS = [
    ...
    'debug_toolbar',
]
```

2. Logging:
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
        },
    },
}
```

### Frontend Debugging

1. Svelte DevTools:
- Install browser extension
- Use `$: console.log()` for reactive debugging

2. Network debugging:
- Use browser DevTools Network tab
- Monitor API requests/responses

## Performance Optimization

1. Backend:
- Use Django Debug Toolbar to identify bottlenecks
- Optimize database queries
- Implement caching

2. Frontend:
- Use production builds
- Implement lazy loading
- Optimize bundle size

## Security

1. Backend:
- Keep dependencies updated
- Use environment variables
- Implement proper authentication
- Validate input data

2. Frontend:
- Sanitize user input
- Use HTTPS
- Implement CSP
- Handle errors properly

## Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Write tests
5. Submit pull request

## Troubleshooting

Common issues and solutions:

1. Database issues:
```bash
# Reset migrations
python manage.py migrate --fake stock_app zero
python manage.py migrate stock_app
```

2. Frontend build issues:
```bash
# Clear cache
npm clean-install
```

3. Docker issues:
```bash
# Rebuild containers
docker-compose up --build --force-recreate
```

Remember to check the [Docker Configuration Guide](../deployment/docker.md) for Docker-specific development instructions.
