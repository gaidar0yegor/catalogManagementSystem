# API Documentation

## Overview

This document describes the REST API endpoints for the Stock Management System. The API is built using Django REST Framework and follows RESTful principles.

## Base URL

```
http://localhost/api/
```

## Authentication

The API uses JWT (JSON Web Token) authentication.

To obtain a token:
```http
POST /api/token/
Content-Type: application/json

{
    "username": "your-username",
    "password": "your-password"
}
```

Response:
```json
{
    "access": "your-access-token",
    "refresh": "your-refresh-token"
}
```

To refresh a token:
```http
POST /api/token/refresh/
Content-Type: application/json

{
    "refresh": "your-refresh-token"
}
```

Use the access token in subsequent requests:
```http
Authorization: Bearer your-access-token
```

## Endpoints

### Products

#### List Products
```http
GET /api/products/
```

Response:
```json
[
    {
        "id": 1,
        "name": "Test Product",
        "description": "Test product description",
        "sku": "TEST-001",
        "unit_price": "39.99",
        "created_at": "2024-11-15T12:00:00Z",
        "updated_at": "2024-11-15T12:00:00Z"
    }
]
```

#### Create Product
```http
POST /api/products/
Content-Type: application/json

{
    "name": "Test Product",
    "description": "Test product description",
    "sku": "TEST-001",
    "unit_price": "39.99"
}
```

#### Get Product
```http
GET /api/products/{id}/
```

#### Update Product
```http
PUT /api/products/{id}/
Content-Type: application/json

{
    "name": "Test Product",
    "description": "Updated description",
    "sku": "TEST-001",
    "unit_price": "39.99"
}
```

#### Delete Product
```http
DELETE /api/products/{id}/
```

### Stock

#### List Stock
```http
GET /api/stocks/
```

Response:
```json
[
    {
        "id": 1,
        "product": 1,
        "product_name": "Test Product",
        "quantity": 100,
        "location": "Warehouse A",
        "last_checked": "2024-11-15T12:00:00Z",
        "minimum_threshold": 10,
        "maximum_threshold": 100
    }
]
```

#### Create Stock
```http
POST /api/stocks/
Content-Type: application/json

{
    "product": 1,
    "quantity": 100,
    "location": "Warehouse A",
    "minimum_threshold": 10,
    "maximum_threshold": 100
}
```

#### Get Stock
```http
GET /api/stocks/{id}/
```

#### Update Stock
```http
PUT /api/stocks/{id}/
Content-Type: application/json

{
    "product": 1,
    "quantity": 150,
    "location": "Warehouse A",
    "minimum_threshold": 10,
    "maximum_threshold": 100
}
```

#### Delete Stock
```http
DELETE /api/stocks/{id}/
```

### Stock Movements

#### List Movements
```http
GET /api/stock-movements/
```

Response:
```json
[
    {
        "id": 1,
        "product": 1,
        "product_name": "Test Product",
        "movement_type": "IN",
        "quantity": 50,
        "timestamp": "2024-11-15T12:00:00Z",
        "performed_by": 1,
        "performed_by_username": "admin",
        "notes": "Initial stock"
    }
]
```

#### Create Movement
```http
POST /api/stock-movements/
Content-Type: application/json

{
    "product": 1,
    "movement_type": "IN",
    "quantity": 50,
    "notes": "Initial stock"
}
```

#### Get Movement
```http
GET /api/stock-movements/{id}/
```

### Reports

#### Daily Summary
```http
GET /api/stock-movements/daily_summary/
```

Response:
```json
{
    "date": "2024-11-15",
    "total_in": 500,
    "total_out": 200,
    "net_change": 300,
    "movements_count": 10
}
```

#### Weekly Summary
```http
GET /api/stock-movements/weekly_summary/
```

Response:
```json
{
    "week_start": "2024-11-11",
    "week_end": "2024-11-17",
    "total_in": 2000,
    "total_out": 800,
    "net_change": 1200,
    "movements_count": 45
}
```

## Error Responses

The API uses standard HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error Response Format:
```json
{
    "error": "Error message here",
    "details": {
        "field": ["Error details"]
    }
}
```

## Rate Limiting

API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1605451200
```

## Pagination

List endpoints support pagination:

```http
GET /api/products/?page=1&page_size=10
```

Response includes pagination metadata:
```json
{
    "count": 100,
    "next": "http://localhost/api/products/?page=2",
    "previous": null,
    "results": []
}
```

## Filtering

Most list endpoints support filtering:

```http
GET /api/products/?search=test
GET /api/stocks/?location=Warehouse%20A
GET /api/stock-movements/?movement_type=IN
```

## Ordering

List endpoints support ordering:

```http
GET /api/products/?ordering=-created_at
GET /api/stocks/?ordering=quantity
```

## Websocket Support

Real-time updates are available through WebSocket connections:

```javascript
const ws = new WebSocket('ws://localhost/ws/stocks/');
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Stock update:', data);
};
