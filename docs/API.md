# ZyCart API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication
- All protected endpoints require a **JWT token** in the `Authorization` header
- Token obtained after login: `Authorization: Bearer <token>`
- Token expires in **7 days**

---

## 📋 Table of Contents

1. [Authentication Routes](#authentication-routes)
2. [User Routes](#user-routes)
3. [Products Routes](#products-routes)
4. [Cart Routes](#cart-routes)
5. [Orders Routes](#orders-routes)
6. [Supplier Routes](#supplier-routes)
7. [Admin Routes](#admin-routes)

---

## Authentication Routes

### Base Path: `/auth`

#### 1. Send OTP (Register with Email)
**POST** `/auth/send-otp`

**Description:** Generate and send OTP to email for registration.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 - Success):**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

**Response (400 - Email already registered):**
```json
{
  "success": false,
  "message": "Email already registered."
}
```

---

#### 2. Verify OTP & Complete Registration
**POST** `/auth/verify-otp`

**Description:** Verify OTP and complete user registration.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "name": "John Doe",
  "mobile": "9876543210",
  "password": "securePassword123"
}
```

**Response (201 - Success):**
```json
{
  "success": true,
  "message": "Registration successful!"
}
```

**Response (400 - Invalid/Expired OTP):**
```json
{
  "success": false,
  "message": "Invalid OTP" or "OTP expired"
}
```

---

#### 3. Login (User, Supplier, Admin)
**POST** `/auth/login`

**Description:** Login for any role (User, Supplier, Admin).

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 - Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "isBanned": false
  }
}
```

**Response (403 - Banned Account):**
```json
{
  "success": false,
  "message": "Your account has been banned."
}
```

---

#### 4. Register Admin (Postman Only)
**POST** `/auth/register-admin`

**Description:** Create a new admin account (for backend/Postman use only).

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "adminPassword123",
  "name": "Admin User"
}
```

**Response (201 - Success):**
```json
{
  "success": true,
  "message": "Admin created successfully",
  "admin": {
    "_id": "admin_id",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

---

## User Routes

### Base Path: `/users`

#### 1. Get User Profile
**GET** `/users/profile`

**Protected:** ✅ (JWT Token Required)

**Description:** Get logged-in user's profile.

**Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "mobile": "9876543210",
    "role": "user",
    "address": "123 Main St, City",
    "isBanned": false,
    "supplierId": null
  }
}
```

---

#### 2. Update User Profile
**PUT** `/users/profile`

**Protected:** ✅ (JWT Token Required)

**Description:** Update user name and mobile number.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "mobile": "9876543211"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "name": "Jane Doe",
    "mobile": "9876543211",
    "role": "user"
  }
}
```

---

#### 3. Delete Account
**DELETE** `/users/delete`

**Protected:** ✅ (JWT Token Required)

**Description:** 
- **For Users:** Permanently delete account
- **For Suppliers:** Deactivate supplier and mark products unavailable

**Response (200):**
```json
{
  "success": true,
  "message": "User account deleted permanently." or "Supplier account deactivated. Products marked unavailable."
}
```

---

## Products Routes

### Base Path: `/products`

#### 1. Get All Products (Homepage)
**GET** `/products/`

**Protected:** ❌ (Public)

**Description:** Get all available products from approved suppliers (excludes banned suppliers).

**Response (200):**
```json
{
  "success": true,
  "products": [
    {
      "_id": "product_id",
      "title": "Product Name",
      "price": 2999,
      "stock": 50,
      "description": "Product description",
      "images": ["image_url"],
      "supplier": {
        "_id": "supplier_id",
        "shopName": "Shop Name",
        "isApproved": true,
        "isBanned": false
      },
      "isAvailable": true
    }
  ]
}
```

---

#### 2. Get All Products (With Filters & Pagination)
**GET** `/products/products`

**Protected:** ❌ (Public)

**Query Parameters:**
```
?search=laptop&category=electronics&brand=Dell&sort=low-high&page=1&limit=12&min=1000&max=50000
```

**Response (200):**
```json
{
  "success": true,
  "products": [...],
  "total": 156,
  "pages": 13,
  "page": 1
}
```

**Sort Options:**
- `low-high` - Price ascending
- `high-low` - Price descending
- `newest` - Recently added
- `oldest` - Oldest first
- `name-asc` - Name A-Z
- `name-desc` - Name Z-A

---

#### 3. Get Single Product
**GET** `/products/:id`

**Protected:** ❌ (Public)

**Description:** Get detailed information about a specific product.

**Response (200):**
```json
{
  "success": true,
  "product": {
    "_id": "product_id",
    "title": "Product Name",
    "price": 2999,
    "stock": 50,
    "description": "Detailed description",
    "images": ["image_url"],
    "supplier": {
      "_id": "supplier_id",
      "shopName": "Shop Name",
      "isApproved": true,
      "isBanned": false
    }
  }
}
```

**Response (404 - Not Available):**
```json
{
  "success": false,
  "message": "Product not available"
}
```

---

#### 4. Check Stock Before Adding to Cart
**POST** `/products/check-stock`

**Protected:** ❌ (Public)

**Description:** Validate if requested quantity is available in stock.

**Request Body:**
```json
{
  "productId": "product_id",
  "qty": 5
}
```

**Response (200 - Valid):**
```json
{
  "success": true,
  "message": "Stock valid"
}
```

**Response (400 - Insufficient Stock):**
```json
{
  "success": false,
  "message": "Only 3 items available"
}
```

---

## Cart Routes

### Base Path: `/cart`

#### 1. Get Cart
**GET** `/cart/`

**Protected:** ✅ (User only)

**Description:** Get the current user's cart with populated product details.

**Response (200):**
```json
{
  "success": true,
  "cart": [
    {
      "_id": "cart_item_id",
      "product": {
        "_id": "product_id",
        "title": "Product Name",
        "price": 2999,
        "images": ["image_url"]
      },
      "qty": 2
    }
  ]
}
```

---

#### 2. Add to Cart
**POST** `/cart/add`

**Protected:** ✅ (User only)

**Description:** Add a product to cart (or increment if already exists).

**Request Body:**
```json
{
  "productId": "product_id",
  "qty": 2
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Added to cart",
  "cart": [...]
}
```

---

#### 3. Update Cart Item
**PATCH** `/cart/update/:productId`

**Protected:** ✅ (User only)

**Description:** Update quantity of a cart item.

**Request Body:**
```json
{
  "qty": 5
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Updated",
  "cart": [...]
}
```

---

#### 4. Remove Item from Cart
**DELETE** `/cart/remove/:productId`

**Protected:** ✅ (User only)

**Description:** Remove a specific product from cart.

**Response (200):**
```json
{
  "success": true,
  "message": "Item removed",
  "cart": [...]
}
```

---

#### 5. Clear Cart
**DELETE** `/cart/clear`

**Protected:** ✅ (User only)

**Description:** Remove all items from cart.

**Response (200):**
```json
{
  "success": true,
  "message": "Cart cleared"
}
```

---

## Orders Routes

### Base Path: `/orders`

#### 1. Place Order
**POST** `/orders/place`

**Protected:** ✅ (User/Supplier)

**Description:** Place a new order with multi-supplier support. Items are automatically grouped by supplier, creating parent order with multiple child orders.

**Request Body:**
```json
{
  "items": [
    {
      "productId": "product_id_1",
      "qty": 2
    },
    {
      "productId": "product_id_2",
      "qty": 1
    }
  ],
  "address": "123 Main Street, City, State 12345"
}
```

**Response (201 - Success):**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "order": {
    "_id": "order_id",
    "parentOrderNumber": "ZYCART-1732812345678-1234",
    "user": "user_id",
    "address": "123 Main Street, City, State 12345",
    "totalAmount": 8997,
    "status": "Confirmed",
    "childOrders": [
      {
        "_id": "child_order_id_1",
        "supplier": "supplier_id_1",
        "items": [
          {
            "productId": "product_id_1",
            "title": "Product 1",
            "price": 2999,
            "qty": 2,
            "subtotal": 5998
          }
        ],
        "amount": 5998,
        "status": "Confirmed"
      },
      {
        "_id": "child_order_id_2",
        "supplier": "supplier_id_2",
        "items": [
          {
            "productId": "product_id_2",
            "title": "Product 2",
            "price": 2999,
            "qty": 1,
            "subtotal": 2999
          }
        ],
        "amount": 2999,
        "status": "Confirmed"
      }
    ]
  },
  "profitDetails": [
    {
      "supplier": "supplier_id_1",
      "supplierAmount": 4798.4,
      "platformAmount": 1199.6
    }
  ]
}
```

**Profit Sharing:** 80% Supplier, 20% Platform

**Response (400 - Insufficient Stock):**
```json
{
  "success": false,
  "message": "Only 3 available for Product Name"
}
```

---

#### 2. Get User Orders
**GET** `/orders/`

**Protected:** ✅ (User/Supplier)

**Description:** Get all orders placed by the logged-in user, sorted by latest first.

**Response (200):**
```json
{
  "success": true,
  "orders": [
    {
      "_id": "order_id",
      "parentOrderNumber": "ZYCART-1732812345678-1234",
      "user": "user_id",
      "address": "123 Main Street, City",
      "totalAmount": 8997,
      "status": "Out for Delivery",
      "childOrders": [
        {
          "_id": "child_order_id",
          "supplier": {
            "_id": "supplier_id",
            "shopName": "Shop Name"
          },
          "items": [...],
          "amount": 5998,
          "status": "Shipped"
        }
      ],
      "createdAt": "2024-11-29T10:30:00Z"
    }
  ]
}
```

---

#### 3. Get User Orders (Alternate Endpoint)
**GET** `/orders/my-orders`

**Protected:** ✅ (User/Supplier)

**Description:** Alternative endpoint for fetching user orders.

**Response:** Same as above

---

## Supplier Routes

### Base Path: `/supplier`

#### 1. Apply for Supplier Partnership
**POST** `/supplier/apply`

**Protected:** ✅ (User)

**Description:** Apply to become a supplier with business documents.

**Request Body (Form-Data):**
```
shopName: "My Shop"
shopType: "Electronics"
pan: "ABCD1234E"
aadhar: "123456789012"
bankAccount: "1234567890123456"
gst: "18AABCT1234H1Z0"
license: <file> (image/pdf)
```

**Response (201):**
```json
{
  "success": true,
  "message": "Application submitted. Wait for admin approval.",
  "supplier": {
    "_id": "supplier_id",
    "shopName": "My Shop",
    "shopType": "Electronics",
    "pan": "ABCD1234E",
    "aadhar": "123456789012",
    "owner": "user_id",
    "isApproved": false,
    "isBanned": false
  }
}
```

---

#### 2. Supplier Dashboard
**GET** `/supplier/dashboard`

**Protected:** ✅ (Supplier only)

**Description:** Get supplier dashboard statistics.

**Response (200):**
```json
{
  "success": true,
  "supplier": {
    "_id": "supplier_id",
    "shopName": "My Shop",
    "isApproved": true,
    "totalProducts": 45
  },
  "totalProducts": 45,
  "totalOrders": 12,
  "pendingShipments": 3
}
```

---

#### 3. Add Product
**POST** `/supplier/products`

**Protected:** ✅ (Supplier only)

**Description:** Add a new product to supplier's catalog.

**Request Body (Form-Data):**
```
title: "Laptop Pro"
price: 89999
stock: 15
description: "High-performance laptop"
image: <file> (image)
```

**Response (201):**
```json
{
  "success": true,
  "message": "Product added successfully",
  "product": {
    "_id": "product_id",
    "title": "Laptop Pro",
    "price": 89999,
    "stock": 15,
    "description": "High-performance laptop",
    "images": ["image_url"],
    "supplier": "supplier_id",
    "isAvailable": true
  }
}
```

---

#### 4. Update Product
**PUT** `/supplier/products/:id`

**Protected:** ✅ (Supplier only)

**Description:** Update product details and/or image.

**Request Body (Form-Data):**
```
title: "Laptop Pro Max"
price: 99999
stock: 20
description: "Updated description"
image: <file> (optional)
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": {...}
}
```

---

#### 5. Mark Product Unavailable
**PATCH** `/supplier/products/unavailable/:id`

**Protected:** ✅ (Supplier only)

**Description:** Mark a product as unavailable without deleting it.

**Response (200):**
```json
{
  "success": true,
  "message": "Product marked unavailable."
}
```

---

#### 6. Get Supplier Products
**GET** `/supplier/products`

**Protected:** ✅ (Supplier only)

**Description:** Get all products added by the logged-in supplier.

**Response (200):**
```json
{
  "success": true,
  "products": [
    {
      "_id": "product_id",
      "title": "Laptop Pro",
      "price": 89999,
      "stock": 15,
      "description": "High-performance laptop",
      "images": ["image_url"],
      "supplier": "supplier_id",
      "isAvailable": true
    }
  ]
}
```

---

#### 7. Get Supplier Orders
**GET** `/supplier/orders`

**Protected:** ✅ (Supplier only)

**Description:** Get all child orders for this supplier.

**Response (200):**
```json
{
  "success": true,
  "orders": [
    {
      "_id": "child_order_id",
      "parentOrderId": {...},
      "items": [
        {
          "productId": "product_id",
          "title": "Laptop Pro",
          "price": 89999,
          "qty": 1,
          "subtotal": 89999
        }
      ],
      "amount": 89999,
      "status": "Confirmed"
    }
  ]
}
```

---

#### 8. Update Child Order Status
**PATCH** `/supplier/orders/status/:id`

**Protected:** ✅ (Supplier only)

**Description:** Update the status of a child order. Valid statuses: `Confirmed`, `Packed`, `Shipped`

**Request Body:**
```json
{
  "status": "Packed"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order updated successfully"
}
```

**Order Status Flow:**
- `Confirmed` → `Packed` → `Shipped`
- When all child orders are `Shipped`, parent order status automatically updates to `Shipped`

---

## Admin Routes

### Base Path: `/admin`

#### 1. Admin Dashboard
**GET** `/admin/dashboard`

**Protected:** ✅ (Admin only)

**Description:** Get admin dashboard statistics.

**Response (200):**
```json
{
  "success": true,
  "users": 145,
  "suppliers": 28,
  "orders": 892,
  "pendingDeliveries": 34
}
```

---

#### 2. Get All Users
**GET** `/admin/users`

**Protected:** ✅ (Admin only)

**Description:** Get list of all users.

**Response (200):**
```json
{
  "success": true,
  "users": [
    {
      "_id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "isBanned": false,
      "mobile": "9876543210"
    }
  ]
}
```

---

#### 3. Ban User
**PATCH** `/admin/users/ban/:id`

**Protected:** ✅ (Admin only)

**Description:** Ban a user account.

**Response (200):**
```json
{
  "success": true,
  "message": "User banned successfully"
}
```

---

#### 4. Unban User
**PATCH** `/admin/users/unban/:id`

**Protected:** ✅ (Admin only)

**Description:** Unban a user account.

**Response (200):**
```json
{
  "success": true,
  "message": "User unbanned successfully"
}
```

---

#### 5. Get All Suppliers
**GET** `/admin/suppliers`

**Protected:** ✅ (Admin only)

**Description:** Get list of all suppliers with owner details.

**Response (200):**
```json
{
  "success": true,
  "suppliers": [
    {
      "_id": "supplier_id",
      "shopName": "My Shop",
      "shopType": "Electronics",
      "pan": "ABCD1234E",
      "gst": "18AABCT1234H1Z0",
      "isApproved": false,
      "isBanned": false,
      "owner": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

---

#### 6. Approve Supplier
**PATCH** `/admin/suppliers/approve/:id`

**Protected:** ✅ (Admin only)

**Description:** Approve a supplier application. Changes user role to "supplier".

**Response (200):**
```json
{
  "success": true,
  "message": "Supplier approved successfully"
}
```

---

#### 7. Ban Supplier
**PATCH** `/admin/suppliers/ban/:id`

**Protected:** ✅ (Admin only)

**Description:** Ban a supplier and mark all their products unavailable.

**Response (200):**
```json
{
  "success": true,
  "message": "Supplier banned & products marked unavailable"
}
```

---

#### 8. Unban Supplier
**PATCH** `/admin/suppliers/unban/:id`

**Protected:** ✅ (Admin only)

**Description:** Unban a supplier (admin must approve again for activation).

**Response (200):**
```json
{
  "success": true,
  "message": "Supplier unbanned. Must be approved again."
}
```

---

#### 9. Get All Orders
**GET** `/admin/orders`

**Protected:** ✅ (Admin only)

**Description:** Get all parent orders with supplier details.

**Response (200):**
```json
{
  "success": true,
  "orders": [
    {
      "_id": "order_id",
      "parentOrderNumber": "ZYCART-1732812345678-1234",
      "user": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "address": "123 Main Street, City",
      "totalAmount": 8997,
      "status": "Confirmed",
      "childOrders": [
        {
          "_id": "child_order_id",
          "supplier": {
            "_id": "supplier_id",
            "shopName": "My Shop"
          },
          "items": [...],
          "amount": 5998,
          "status": "Confirmed"
        }
      ],
      "createdAt": "2024-11-29T10:30:00Z"
    }
  ]
}
```

---

#### 10. Update Parent Order Status
**PATCH** `/admin/orders/status/:parentId`

**Protected:** ✅ (Admin only)

**Description:** Update parent order status. Valid statuses: `Confirmed`, `Shipped`, `Out for Delivery`, `Delivered`

**Request Body:**
```json
{
  "status": "Out for Delivery"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order status updated"
}
```

**Order Status Flow:**
- `Confirmed` → `Shipped` → `Out for Delivery` → `Delivered`
- Parent order controls global delivery status
- Supplier orders track individual supplier shipments

---

## Error Handling

All endpoints return errors in the following format:

**Standard Error Response:**
```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `403` - Forbidden (Banned/Unauthorized)
- `500` - Server Error

---

## Testing with Postman

### Setup:
1. Create an environment with variable: `BASE_URL = http://localhost:5000`
2. After login, save the token: Set `token` as environment variable
3. In protected endpoints, use `Authorization: Bearer {{token}}`

### Sample Testing Flow:
```
1. POST /auth/send-otp → Send OTP
2. POST /auth/verify-otp → Register user
3. POST /auth/login → Get token
4. GET /products → Browse products
5. POST /cart/add → Add to cart
6. POST /orders/place → Place order
```

---

## Rate Limiting & CORS

- **CORS Enabled:** Frontend can access from configured origin
- **Request Size Limit:** 20MB for JSON/URL-encoded
- **Session:** Uses JWT tokens (httpOnly cookies supported)

---

## Notes

- **Supplier Role Change:** Happens automatically when admin approves supplier application
- **Multi-Supplier Orders:** System automatically groups items by supplier
- **Stock Management:** Decremented only after order is successfully placed
- **Address Storage:** Saved to user profile on first order
- **Profit Sharing:** 80% to supplier, 20% to platform (stored in profitDetails)

---

**Last Updated:** November 29, 2024  
**API Version:** 1.0
