# ZyCart - Multi-Supplier E-Commerce Platform

ZyCart is a full-stack MERN (MongoDB, Express.js, React 19, Node.js) multi-vendor e-commerce ecosystem. It features three dedicated React client applications for **Customers**, **Sellers**, and **Administrators**, powered by a robust Express.js backend with split-order fulfillment, OTP email verification, Cloudinary image hosting, and dynamic category-attribute product filtering.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Architecture & Monorepo Structure](#-architecture--monorepo-structure)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Seeding](#database-seeding)
  - [Environment Variables](#environment-variables)
  - [Running the Applications](#running-the-applications)
- [API Documentation](#-api-documentation)
- [Database Models](#-database-models)
- [Available Scripts](#-available-scripts)
- [License](#-license)

---

## 📋 Project Overview

ZyCart supports three distinct user roles with dedicated frontend applications:

1. 🛒 **Customer Storefront (`client-user`)**: Discover products, filter by dynamic attributes, manage cart and wishlist, checkout multi-seller orders, track orders, and post product reviews.
2. 🏪 **Seller Portal (`client-seller`)**: 2-step seller onboarding (OTP verification + license upload), product catalog management with Cloudinary multi-image uploads, inventory availability toggles, and order status fulfillment.
3. ⚙️ **Admin Dashboard (`client-admin`)**: Platform analytics, seller application review & approval workflow, user/seller account management (ban/unban/delete), and parent order oversight.

---

## ✨ Key Features

### 🛒 Customer Storefront (`client-user`)
- **Authentication**: Email registration with 5-minute OTP verification (Nodemailer Gmail SMTP), role-based JWT authentication, and OTP password reset.
- **Product Discovery**: Search, category breakdown, top-view and top-purchase trends, and dynamic attribute filtering based on category.
- **Cart & Wishlist**: Real-time stock availability check, session/account cart management, and wishlist toggling.
- **Multi-Vendor Checkout**: Split-order system automatically divides orders into seller-specific child orders upon placement.
- **Reviews & Ratings**: Customer reviews with photo upload capabilities and helpfulness voting.

### 🏪 Seller Portal (`client-seller`)
- **2-Step Onboarding**: OTP-verified signup followed by business detail and trade license document submission.
- **Product Management**: Create, update, soft-delete, and toggle availability of products with up to 5 Cloudinary images.
- **Order Fulfillment**: Track seller-specific child orders and update shipment status (Processing, Shipped, Delivered, Cancelled).
- **Dashboard Metrics**: View total sales, active listings, order statuses, and platform commission breakdowns.

### ⚙️ Operations Dashboard (`client-admin`)
- **Seller Approval Workflow**: Inspect submitted seller licenses and business details to approve or reject sellers.
- **User & Seller Governance**: Search, view detailed profiles, ban/unban, or delete user and seller accounts.
- **Master Order Oversight**: View parent orders, sub-order breakdowns, platform revenue cuts, and order statuses.
- **Category & Attribute System**: Manage main categories, sub-categories, sub-sub-categories, and schema attributes.

---

## 🏗️ Architecture & Monorepo Structure

```
zycart/
├── client-user/          # Customer React 19 Frontend (Port 5173)
├── client-seller/        # Seller Dashboard React 19 Frontend (Port 5174)
├── client-admin/         # Admin Management React 19 Frontend (Port 5175)
└── server/               # Express.js REST API Backend (Port 5000)
    ├── config/           # Database (db.js) & Cloudinary setup
    ├── controllers/      # Request handlers for auth, products, orders, admin, etc.
    ├── middleware/       # JWT auth protection (User, Seller, Admin) & Multer uploads
    ├── models/           # Mongoose schemas (User, Seller, Admin, Product, Order, etc.)
    ├── routes/           # Express API route declarations
    ├── scripts/          # Database seed scripts for categories and attributes
    ├── utils/            # Category cache initializer & Brevo email/OTP utility
    └── server.js         # Backend server entry point
```

---

## 🛠️ Tech Stack

### Frontend (All Client Apps)
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)
- **Carousel**: [React Slick](https://react-slick.neostack.com/) (`client-user`)

### Backend (`server/`)
- **Runtime**: Node.js (ES Modules, `"type": "module"`)
- **Framework**: [Express.js 4.19](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose 8.4](https://mongoosejs.com/)
- **Authentication**: JWT (`jsonwebtoken`) & Cookie Parser
- **File Uploads**: [Cloudinary 2.8](https://cloudinary.com/) & [Multer 2.0](https://github.com/expressjs/multer) (with local disk storage fallback)
- **Email Service**: Gmail SMTP via [Nodemailer 7.0](https://nodemailer.com/) using Google App Passwords for OTP delivery
- **Validation**: `express-validator` & `validator`

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas cluster
- **Cloudinary Account**: For image storage (optional, falls back to disk upload)
- **Google Account & App Password**: For sending OTP verification emails via Nodemailer

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zycart
   ```

2. **Install Server Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   # Customer App
   cd ../client-user
   npm install

   # Seller App
   cd ../client-seller
   npm install

   # Admin App
   cd ../client-admin
   npm install
   ```

### Database Seeding

To populate the database with category hierarchies and filterable category attributes:

```bash
cd server
node scripts/seedCategoryHierarchy.js
node scripts/seedCategoryAttributes.js
```

### Environment Variables

#### Backend Configuration (`server/.env`)
Create a `.env` file inside the `server/` directory:

```env
# Server Port
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/zycart

# JWT Settings
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# OTP Settings
OTP_EXPIRY_MINUTES=5

# Cloudinary (Image Hosting - Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Platform Fees (e.g. 0.20 = 20% platform commission)
PLATFORM_COMMISSION_RATE=0.20

# CORS Allowed Origins
CLIENT_URL1=http://localhost:5173
CLIENT_URL2=http://localhost:5174
CLIENT_URL3=http://localhost:5175

# Email Settings (Required for OTP delivery via Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_google_app_password
```

#### Frontend Configuration (`.env` in each client app)
Create a `.env` file in `client-user/`, `client-seller/`, and `client-admin/`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### Running the Applications

1. **Start the Backend API Server**
   ```bash
   cd server
   npm run dev
   ```
   *Runs on `http://localhost:5000`*

2. **Start Frontend Applications** (in separate terminal windows)
   ```bash
   # Start Customer Storefront
   cd client-user
   npm run dev
   # Access at: http://localhost:5173

   # Start Seller Portal
   cd client-seller
   npm run dev
   # Access at: http://localhost:5174

   # Start Admin Dashboard
   cd client-admin
   npm run dev
   # Access at: http://localhost:5175
   ```

---

## 📚 API Documentation

> Note: All API routes are mounted directly without `/api` prefix.

### 🏥 Health & System Routes

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | API status message | Public |
| `GET` | `/health` | Server health check (timestamp & status) | Public |

### 🔑 Authentication Routes (`/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/user/send-otp` | Send registration OTP to user email | Public |
| `POST` | `/auth/user/verify-otp` | Verify OTP & complete user signup | Public |
| `POST` | `/auth/user/login` | User login | Public |
| `POST` | `/auth/user/send-reset-otp` | Send password reset OTP | Public |
| `POST` | `/auth/user/verify-reset-otp` | Verify reset OTP & set new password | Public |
| `POST` | `/auth/user/change-password` | Change logged-in user password | User |
| `POST` | `/auth/seller/send-otp` | Send seller signup OTP | Public |
| `POST` | `/auth/seller/verify-otp` | Verify OTP & create initial seller account | Public |
| `POST` | `/auth/seller/submit-details` | Submit business info & license upload | Public |
| `POST` | `/auth/seller/login` | Seller login | Public |
| `POST` | `/auth/seller/send-reset-otp` | Send seller reset password OTP | Public |
| `POST` | `/auth/seller/verify-reset-otp` | Reset seller password | Public |
| `POST` | `/auth/seller/change-password` | Change seller password | Seller |
| `POST` | `/auth/admin/login` | Admin login | Public |
| `POST` | `/auth/admin/change-password` | Change admin password | Admin |

---

### 👤 User Routes (`/users`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/users/profile` | Get logged-in user profile | User |
| `PUT` | `/users/profile` | Update profile information | User |
| `DELETE` | `/users/delete` | Delete user account | User |

---

### 🏪 Seller Routes (`/seller`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/seller/dashboard` | Get seller sales & order stats | Seller |
| `GET` | `/seller/products` | Get products listed by logged-in seller | Seller |
| `POST` | `/seller/products` | Add new product (with image upload) | Seller |
| `PUT` | `/seller/products/:id` | Update product details or images | Seller |
| `PATCH` | `/seller/products/unavailable/:id` | Mark product unavailable | Seller |
| `PATCH` | `/seller/products/available/:id` | Mark product available | Seller |
| `DELETE` | `/seller/products/:id` | Delete product listing | Seller |
| `GET` | `/seller/orders` | Get seller-specific child orders | Seller |
| `GET` | `/seller/orders/:orderId` | Get detailed child order view | Seller |
| `PATCH` | `/seller/orders/status/:id` | Update child order fulfillment status | Seller |
| `GET` | `/seller/profile` | Get seller profile & business details | Seller |
| `PUT` | `/seller/profile` | Update seller profile | Seller |
| `GET` | `/seller/:id` | Get public seller information | Public |

---

### ⚙️ Admin Routes (`/admin`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/admin/dashboard` | Platform metrics & summary statistics | Admin |
| `GET` | `/admin/users` | List all users | Admin |
| `GET` | `/admin/users/:userId` | Get user details | Admin |
| `PATCH` | `/admin/users/ban/:id` | Ban user account | Admin |
| `PATCH` | `/admin/users/unban/:id` | Unban user account | Admin |
| `DELETE` | `/admin/users/:id` | Delete user account | Admin |
| `GET` | `/admin/sellers` | List all seller applications & accounts | Admin |
| `GET` | `/admin/sellers/:sellerId` | Get seller application details | Admin |
| `PATCH` | `/admin/sellers/approve/:id` | Approve pending seller application | Admin |
| `PATCH` | `/admin/sellers/ban/:id` | Ban seller account | Admin |
| `PATCH` | `/admin/sellers/unban/:id` | Unban seller account | Admin |
| `GET` | `/admin/orders` | List all parent orders | Admin |
| `GET` | `/admin/orders/:orderId` | Get detailed parent order & sub-orders | Admin |
| `PATCH` | `/admin/orders/status/:parentId` | Update parent order status | Admin |
| `GET` | `/admin/profile` | Get admin profile | Admin |
| `PUT` | `/admin/profile` | Update admin profile | Admin |

---

### 🛍️ Product & Trend Routes (`/products`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/products/` | Get available homepage products | Public |
| `GET` | `/products/products` | Get products with filtering & pagination | Public |
| `POST` | `/products/check-stock` | Verify item stock availability | Public |
| `GET` | `/products/trends/top-purchase` | Get top purchased products | Public |
| `GET` | `/products/trends/top-views` | Get top viewed products | Public |
| `GET` | `/products/categories` | Get main categories | Public |
| `GET` | `/products/categories/:main` | Get sub-categories | Public |
| `GET` | `/products/categories/:main/:sub` | Get sub-sub-categories | Public |
| `GET` | `/products/categories/:main/:sub/:subsub/attributes` | Get filterable attributes for sub-sub category | Public |
| `GET` | `/products/:id` | Get single product by ID | Public |

---

### 📦 Order Routes (`/orders`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/orders/place` | Place new multi-vendor order | User |
| `GET` | `/orders/my-orders` | Get logged-in user order history | User |
| `GET` | `/orders/:orderId` | Get order details by ID | User |
| `PATCH` | `/orders/:orderId` | Update order payment details | User |

---

### 🛒 Cart & Wishlist Routes (`/cart`, `/wishlist`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/cart` | Get user cart items | User |
| `POST` | `/cart/add` | Add product item to cart | User |
| `PATCH` | `/cart/update/:productId` | Update item quantity in cart | User |
| `DELETE` | `/cart/remove/:productId` | Remove item from cart | User |
| `DELETE` | `/cart/clear` | Empty cart | User |
| `GET` | `/wishlist` | Get user wishlist | User |
| `POST` | `/wishlist/add` | Add product to wishlist | User |
| `POST` | `/wishlist/remove` | Remove product from wishlist | User |
| `GET` | `/wishlist/check` | Check if product is in wishlist | User |
| `POST` | `/wishlist/clear` | Clear wishlist | User |

---

### ⭐ Review Routes (`/reviews`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/reviews/upload-image` | Upload review photo to Cloudinary/Disk | User |
| `POST` | `/reviews/` | Create review for purchased product | User |
| `GET` | `/reviews/product/:productId` | Get all reviews for a product | Public |
| `GET` | `/reviews/:reviewId` | Get single review | Public |
| `PUT` | `/reviews/:reviewId` | Edit review | User |
| `DELETE` | `/reviews/:reviewId` | Delete review | User |
| `POST` | `/reviews/:reviewId/helpful` | Mark review as helpful | User |

---

## 📦 Database Models

- **User**: Customer profiles, credentials, shipping addresses, ban status, and OTP tokens.
- **Seller**: Supplier credentials, shop details, trade license document URL, approval status (`pending`, `approved`, `rejected`), bank details, and metrics.
- **Admin**: System administrator account credentials and profiles.
- **Product**: Product details, title, description, price, stock, images array, main/sub/sub-sub category references, seller ID, and dynamic attribute key-value map.
- **Category**: Main category, sub-category, and sub-sub category hierarchy records.
- **AttributeSchema / CategoryAttribute**: Dynamic attribute configurations (e.g. Size, Color, RAM, Material) associated with specific sub-sub categories.
- **Order**: Split-order model containing Parent Order details, user reference, payment info, overall total, and embedded/referenced child orders per seller.
- **Review**: Product rating (1-5 stars), title, review text, photos array, user ID, product ID, and helpfulness upvotes.
- **Wishlist**: Customer saved items list.
- **Trend**: Tracking metrics for product view counts and purchase frequencies.

---

## 📝 Available Scripts

### Backend (`server/`)
```bash
npm start           # Run server in production mode
npm run dev         # Run server with nodemon auto-reloading
```

### Frontend Applications (`client-user`, `client-seller`, `client-admin`)
```bash
npm run dev         # Start Vite development server
npm run build       # Build optimized production bundle
npm run preview     # Local preview of production build
npm run lint        # Run ESLint validation
```

---

## 📄 License

This project is licensed under the MIT License.
