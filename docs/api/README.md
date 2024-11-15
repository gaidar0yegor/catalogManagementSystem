# API Documentation

## Overview

This document describes the REST API endpoints for the Stock Management System. The API is built using Django REST Framework and follows RESTful principles.

## Base URL

```
http://localhost:8000/api/stock-app/
```

## Authentication

All API endpoints require authentication. The API uses token-based authentication.

To obtain a token:
```http
POST /api/auth/token/
Content-Type: application/json

{
    "username": "your-username",
    "password": "your-password"
}
```

Use the token in subsequent requests:
```http
Authorization: Token your-token-here
```

## Endpoints

### Products

#### List Products
```http
GET /products/
```

Response:
```json
[
    {
        "id": 1,
        "name": "Arduino Mega 2560 R3",
        "description": "Microcontroller board based on the ATmega2560",
        "sku": "ARD-MEGA2560-R3",
        "supplier": 1,
        "unit_price": "39.99",
        "created_at": "2024-11-15T12:00:00Z",
        "updated_at": "2024-11-15T12:00:00Z"
    }
]
```

#### Create Product
```http
POST /products/
Content-Type: application/json

{
    "name": "Arduino Mega 2560 R3",
    "description": "Microcontroller board based on the ATmega2560",
    "sku": "ARD-MEGA2560-R3",
    "supplier": 1,
    "unit_price": "39.99"
}
```

#### Get Product
```http
GET /products/{id}/
```

#### Update Product
```http
PUT /products/{id}/
Content-Type: application/json

{
    "name": "Arduino Mega 2560 R3",
    "description": "Updated description",
    "sku": "ARD-MEGA2560-R3",
    "supplier": 1,
    "unit_price": "39.99"
}
```

#### Delete Product
```http
DELETE /products/{id}/
```

### Stock

#### List Stock
```http
GET /stocks/
```

Response:
```json
[
    {
        "id": 1,
        "product": 1,
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
POST /stocks/
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
GET /stocks/{id}/
```

#### Update Stock
```http
PUT /stocks/{id}/
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
DELETE /stocks/{id}/
```

### Stock Movements

#### List Movements
```http
GET /movements/
```

Response:
```json
[
    {
        "id": 1,
        "product": 1,
        "movement_type": "IN",
        "quantity": 50,
        "reference_number": "REF001",
        "timestamp": "2024-11-15T12:00:00Z",
        "performed_by": 1,
        "notes": "Initial stock"
    }
]
```

#### Create Movement
```http
POST /movements/
Content-Type: application/json

{
    "product": 1,
    "movement_type": "IN",
    "quantity": 50,
    "reference_number": "REF001",
    "notes": "Initial stock"
}
```

#### Get Movement
```http
GET /movements/{id}/
```

### Suppliers

#### List Suppliers
```http
GET /suppliers/
```

Response:
```json
[
    {
        "id": 1,
        "name": "Tech Electronics Supply Co.",
        "email": "contact@techelectronics.com",
        "phone": "+1-555-123-4567",
        "address": "123 Tech Park Drive",
        "created_at": "2024-11-15T12:00:00Z",
        "updated_at": "2024-11-15T12:00:00Z"
    }
]
```

#### Create Supplier
```http
POST /suppliers/
Content-Type: application/json

{
    "name": "Tech Electronics Supply Co.",
    "email": "contact@techelectronics.com",
    "phone": "+1-555-123-4567",
    "address": "123 Tech Park Drive"
}
```

#### Get Supplier
```http
GET /suppliers/{id}/
```

#### Update Supplier
```http
PUT /suppliers/{id}/
Content-Type: application/json

{
    "name": "Tech Electronics Supply Co.",
    "email": "contact@techelectronics.com",
    "phone": "+1-555-123-4567",
    "address": "123 Tech Park Drive"
}
```

#### Delete Supplier
```http
DELETE /suppliers/{id}/
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
GET /products/?page=1&page_size=10
```

Response includes pagination metadata:
```json
{
    "count": 100,
    "next": "http://api.example.org/products/?page=2",
    "previous": null,
    "results": []
}
```

## Filtering

Most list endpoints support filtering:

```http
GET /products/?supplier=1
GET /stocks/?location=Warehouse%20A
GET /movements/?movement_type=IN
```

## Ordering

List endpoints support ordering:

```http
GET /products/?ordering=-created_at
GET /stocks/?ordering=quantity
```

## Search

List endpoints support search:

```http
GET /products/?search=arduino
GET /suppliers/?search=tech
```

## Versioning

The API version is included in the URL:
```http
GET /api/v1/stock-app/products/
```

Current version: v1
