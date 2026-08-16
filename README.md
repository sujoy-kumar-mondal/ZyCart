# ZyCart - Multi-Supplier E-Commerce Platform

ZyCart is a full-stack MERN (MongoDB, Express.js, React 19, Node.js) multi-vendor e-commerce ecosystem. It features three dedicated React client applications for **Customers**, **Sellers**, and **Administrators**, powered by a robust Express.js backend with split-order fulfillment, Two-Factor Authentication (2FA Email OTP), Cloudinary image hosting, granular Role-Based Access Control (RBAC), and dynamic category-attribute product filtering.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Security & Validation Standards](#-security--validation-standards)
- [Architecture & Monorepo Structure](#-architecture--monorepo-structure)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Seeding & Super Admin Setup](#database-seeding--super-admin-setup)
  - [Running the Applications](#running-the-applications)
- [Vercel Deployment Guide](#-vercel-deployment-guide)
- [API Documentation](#-api-documentation)
- [Database Models](#-database-models)
- [Available Scripts](#-available-scripts)
- [License](#-license)

---

## 📋 Project Overview

ZyCart supports three distinct user roles with dedicated frontend applications:

1. 🛒 **Customer Storefront (`client-user`)**: Discover products, filter by dynamic attributes, manage cart and wishlist, checkout multi-seller orders, track order history, and post product reviews.
2. 🏪 **Seller Portal (`client-seller`)**: 2-step seller onboarding (OTP verification + license upload), product catalog management with Cloudinary multi-image uploads, inventory availability toggles, and order status fulfillment.
3. ⚙️ **Admin Dashboard (`client-admin`)**: Platform analytics, seller application approval workflow, user/seller account management (ban/unban/delete), granular permission-based admin access, and parent order oversight.

---

## ✨ Key Features

### 🛒 Customer Storefront (`client-user`)
- **2FA Authentication**: Email signup & login protected with 5-minute OTP verification (Nodemailer Gmail SMTP), role-based JWT authentication, and OTP password reset.
- **Product Discovery**: Search, category breakdown, top-view and top-purchase trends, and dynamic attribute filtering based on category.
- **Cart & Quantity Limits**: Stock availability checks, max quantity per purchase enforcement (`maxQuantityPerPurchase`), session/account cart management, and wishlist toggling.
- **Multi-Vendor Checkout**: Split-order system automatically divides orders into seller-specific child orders upon placement.
- **Reviews & Ratings**: Customer reviews with photo upload capabilities and helpfulness voting.

### 🏪 Seller Portal (`client-seller`)
- **Validated Onboarding**: OTP-verified signup followed by business detail and document submission (PAN, Aadhaar, Bank Account, GSTIN format validations).
- **Product Management**: Create, update, soft-delete, and toggle availability of products with up to 5 Cloudinary images. Automatic Cloudinary asset removal on product deletion.
- **Order Fulfillment**: Track seller-specific child orders and update shipment status (Processing, Shipped, Delivered, Cancelled).
- **Dashboard Metrics**: View total sales, active listings, order statuses, and platform commission breakdowns.

### ⚙️ Operations Dashboard (`client-admin`)
- **Role-Based Access Control (RBAC)**: Super Admin vs Regular Admin distinction. Assign granular permissions (`manage_users`, `manage_sellers`, `manage_orders`, `manage_products`, `manage_categories`, `manage_admins`, `view_analytics`, `system_settings`).
- **Seller Approval Workflow**: Inspect submitted seller credentials and business details to approve or reject sellers.
- **User & Seller Governance**: Search, view detailed profiles, ban/unban, or delete user and seller accounts.
- **Master Order Oversight**: View parent orders, sub-order breakdowns, platform revenue cuts, and order statuses.
- **Admin Management**: Super Admins can create new admins, edit permissions, toggle active status, and revoke access.

---

## 🔒 Security & Validation Standards

- **Two-Factor Authentication (2FA)**: All logins (User, Seller, Admin) require password verification followed by a 6-digit Email OTP before a JWT session token is issued.
- **Strong Password Policy**: All passwords must be at least 8 characters long and contain an uppercase letter (`A-Z`), a lowercase letter (`a-z`), a number (`0-9`), and a special character/symbol.
- **Strict Format Validations**:
  - Mobile Numbers: Mandatory 10-digit numeric check (`/^[0-9]{10}$/`).
  - PAN Card: 10-character alphanumeric check (`/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/`).
  - Aadhaar Number: 12-digit numeric check (`/^\d{12}$/`).
  - Bank Account Number: 9 to 18 digits (`/^\d{9,18}$/`).
  - GSTIN: 15-character GST format check (`/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/`).

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
    ├── middleware/       # JWT auth protection (User, Seller, Admin, RBAC) & Multer uploads
    ├── models/           # Mongoose schemas (User, Seller, Admin, Product, Order, etc.)
    ├── routes/           # Express API route declarations
    ├── scripts/          # Seed scripts (Categories, Attributes, Super Admin)
    ├── utils/            # Category cache initializer & email/OTP utility
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

### Backend (`server/`)
- **Runtime**: Node.js (ES Modules, `"type": "module"`)
- **Framework**: [Express.js 4.19](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose 8.4](https://mongoosejs.com/)
- **Authentication**: JWT (`jsonwebtoken`) & 2FA Email OTP
- **File Uploads**: [Cloudinary 2.8](https://cloudinary.com/) & [Multer 2.0](https://github.com/expressjs/multer)
- **Email Service**: Gmail SMTP via [Nodemailer 7.0](https://nodemailer.com/)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas cluster
- **Cloudinary Account**: For image storage
- **Google Account & App Password**: For sending OTP verification emails via Nodemailer

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sujoy-kumar-mondal/ZyCart.git
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

### Environment Variables

#### Backend Configuration (`server/.env`)
Copy `server/.env.example` to `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/zycart?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
OTP_EXPIRY_MINUTES=5

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

PLATFORM_COMMISSION_RATE=0.20

CLIENT_URL1=http://localhost:5173
CLIENT_URL2=http://localhost:5174
CLIENT_URL3=http://localhost:5175

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_google_app_password
```

#### Frontend Configuration (`.env` in each client app)
Create a `.env` file in `client-user/`, `client-seller/`, and `client-admin/`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### Database Seeding & Super Admin Setup

1. **Seed Categories & Attributes**:
   ```bash
   cd server
   node scripts/seedCategoryHierarchy.js
   node scripts/seedCategoryAttributes.js
   ```

2. **Provision Super Admin Account**:
   ```bash
   # Run default Super Admin provision
   npm run seed:superadmin

   # Or provide custom credentials:
   node scripts/createSuperAdmin.js "admin@zycart.com" "SuperAdmin@2026" "9876543210" "Chief Admin"
   ```

### Running the Applications

1. **Start Backend API Server**:
   ```bash
   cd server
   npm run dev
   ```
   *Runs on `http://localhost:5000`*

2. **Start Frontend Applications** (in separate terminals):
   ```bash
   # Customer Storefront (http://localhost:5173)
   cd client-user && npm run dev

   # Seller Portal (http://localhost:5174)
   cd client-seller && npm run dev

   # Admin Dashboard (http://localhost:5175)
   cd client-admin && npm run dev
   ```

---

## 🌐 Vercel Deployment Guide

ZyCart is structured as a monorepo containing 3 Vite frontends and 1 Express backend. Follow these steps to deploy to Vercel:

### 1. Deploy the Backend API (`server/`)
1. Create a `vercel.json` file inside `server/`:
   ```json
   {
     "version": 2,
     "builds": [{ "src": "server.js", "use": "@vercel/node" }],
     "routes": [{ "src": "/(.*)", "dest": "server.js" }]
   }
   ```
2. In Vercel, import the repository and set **Root Directory** to `server`.
3. Add Environment Variables (`MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_*`, `EMAIL_USER`, `EMAIL_PASS`, `CLIENT_URL1/2/3`).
4. Deploy to get your live API URL (e.g. `https://zycart-api.vercel.app`).

### 2. Deploy Frontends (`client-user`, `client-seller`, `client-admin`)
For each client app:
1. Import the repository in Vercel.
2. Set **Root Directory** to `client-user` (or `client-seller` / `client-admin`).
3. Set Environment Variable:
   - `VITE_API_BASE_URL` = `https://zycart-api.vercel.app`
4. Set Framework Preset to **Vite**.
5. Deploy each application!

---

## 📚 API Documentation

### 🏥 Health Routes
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/` | API status message | Public |
| `GET` | `/health` | Server health check | Public |

### 🔑 Authentication Routes (`/auth`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/user/login` | User Login Step 1 (Password -> OTP) | Public |
| `POST` | `/auth/user/verify-login-otp` | User Login Step 2 (OTP -> JWT) | Public |
| `POST` | `/auth/seller/login` | Seller Login Step 1 (Password -> OTP) | Public |
| `POST` | `/auth/seller/verify-login-otp` | Seller Login Step 2 (OTP -> JWT) | Public |
| `POST` | `/auth/admin/login` | Admin Login Step 1 (Password -> OTP) | Public |
| `POST` | `/auth/admin/verify-login-otp` | Admin Login Step 2 (OTP -> JWT) | Public |
| `POST` | `/auth/user/send-otp` | Send signup OTP | Public |
| `POST` | `/auth/user/verify-otp` | Verify OTP & complete user signup | Public |
| `POST` | `/auth/seller/submit-details` | Submit seller business info & license | Public |

### ⚙️ Admin Routes (`/admin`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/admin/dashboard` | Platform metrics & summary statistics | Admin (`view_analytics`) |
| `GET` | `/admin/admins` | List all system admin accounts | Super Admin / Admin (`manage_admins`) |
| `POST` | `/admin/admins` | Create new admin account with permissions | Super Admin / Admin (`manage_admins`) |
| `PUT` | `/admin/admins/:id` | Update admin account & permissions | Super Admin / Admin (`manage_admins`) |
| `DELETE` | `/admin/admins/:id` | Delete admin account | Super Admin Only |
| `PATCH` | `/admin/sellers/approve/:id` | Approve seller application | Admin (`manage_sellers`) |
| `PATCH` | `/admin/users/ban/:id` | Ban user account | Admin (`manage_users`) |

---

## 📦 Database Models

- **User**: Customer profiles, credentials, shipping addresses, ban status, and OTP tokens.
- **Seller**: Supplier credentials, shop details, trade license document URL, approval status (`pending`, `approved`, `rejected`), bank details, and metrics.
- **Admin**: Administrator account credentials, role (`super_admin` vs `admin`), active status, and granular permissions array.
- **Product**: Product details, title, description, price, max quantity per purchase (`maxQuantityPerPurchase`), images array, category references, seller ID, and dynamic attribute map.
- **Order**: Split-order model containing Parent Order details, user reference, payment info, overall total, and embedded/referenced child orders per seller.

---

## 📝 Available Scripts

### Backend (`server/`)
```bash
npm start               # Run server in production mode
npm run dev             # Run server with nodemon auto-reloading
npm run seed:superadmin # Provision or seed Super Admin account
```

### Frontend Applications (`client-user`, `client-seller`, `client-admin`)
```bash
npm run dev             # Start Vite development server
npm run build           # Build optimized production bundle
npm run preview         # Local preview of production build
```

---

## 📄 License

This project is licensed under the MIT License.

