# ZyCart - Multi-Vendor E-Commerce Platform

ZyCart is a full-stack MERN (MongoDB, Express.js, React 19, Node.js) multi-vendor e-commerce ecosystem. It features three dedicated React client applications for **Customers**, **Sellers**, and **Administrators**, powered by a robust Express.js REST API with split-order fulfillment, Two-Factor Authentication (2FA Email OTP), Cloudinary image hosting, granular Role-Based Access Control (RBAC), and dynamic category-attribute product filtering.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
  - [Customer Storefront (`client-user`)](#-customer-storefront-client-user)
  - [Seller Portal (`client-seller`)](#-seller-portal-client-seller)
  - [Admin Operations Portal (`client-admin`)](#-admin-operations-portal-client-admin)
- [Security & Architecture Standards](#-security--architecture-standards)
- [Monorepo Architecture](#-monorepo-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Seeding & Super Admin Setup](#database-seeding--super-admin-setup)
  - [Running the Applications Locally](#running-the-applications-locally)
- [Vercel Deployment Guide](#-vercel-deployment-guide)
- [API Documentation](#-api-documentation)
- [Database Models](#-database-models)
- [Available Scripts](#-available-scripts)
- [License](#-license)

---

## 📋 Project Overview

ZyCart supports three distinct user roles with dedicated frontend applications:

1. 🛒 **Customer Storefront (`client-user`)**: Discover products, filter by dynamic category attributes, manage cart and wishlist, checkout multi-seller orders, track real-time order history, and post product reviews.
2. 🏪 **Seller Portal (`client-seller`)**: 2-step seller onboarding (OTP verification + license upload), product catalog management with Cloudinary multi-image uploads, inventory availability toggles, sales metrics, and child order status fulfillment.
3. ⚙️ **Admin Operations Portal (`client-admin`)**: Platform-wide analytics, seller application review & approval workflow, customer/seller account governance (ban/unban/delete), Super Admin RBAC management, dynamic system settings (Maintenance Mode, Announcement Banners, Delivery Fees), and parent/child order oversight.

---

## ✨ Key Features

### 🛒 Customer Storefront (`client-user`)
- **2FA Authentication & Ephemeral Session Lifecycle**:
  - Email signup & login protected with 5-minute OTP verification (Nodemailer Gmail SMTP).
  - "Remember me on this device" support: Unchecked sessions are stored in `sessionStorage` (clearing automatically when the browser closes); checked sessions persist in `localStorage`.
- **Protected Cart & Checkout**:
  - Add to Cart, Buy Now, Wishlist toggles, `/cart`, and `/checkout` require authentication, smoothly redirecting unauthenticated users to `/login`.
  - Concurrency-safe inventory deduction preventing double decrement on payment retries.
  - Per-item quantity limits (`maxQuantityPerPurchase`) and live stock verification.
- **Product Discovery & Reviews**:
  - Live product search, category navigation, trending slider (top views/purchases), and category-specific dynamic attribute filters.
  - Customer review submissions with photo uploads and helpfulness upvoting.

### 🏪 Seller Portal (`client-seller`)
- **Validated Onboarding Workflow**:
  - 2-step registration with email OTP verification followed by business detail and document submission (PAN, Aadhaar, Bank Account, GSTIN format validations).
- **Product Catalog Management**:
  - Create, update, soft-delete, and toggle product availability with up to 5 Cloudinary images.
  - Automatic Cloudinary asset cleanup when deleting products.
  - Seller unbanning automatically restores product availability across the storefront.
- **Order Fulfillment & Analytics**:
  - Split child orders per seller with status tracking (`Processing`, `Shipped`, `Delivered`, `Cancelled`).
  - Real-time revenue, order count, and platform commission breakdown.

### ⚙️ Admin Operations Portal (`client-admin`)
- **Granular Role-Based Access Control (RBAC)**:
  - Super Admin vs Sub-Admin distinction.
  - Specific module privileges: `manage_users`, `manage_sellers`, `manage_orders`, `manage_products`, `manage_categories`, `manage_admins`, `view_analytics`, `system_settings`.
  - Sub-admins cannot delete Super Admin accounts, and privilege badges accurately reflect granted permissions.
- **Seller Application Approval Workflow**:
  - Inspect seller trade licenses, bank details, and business identification with instant Approve / Reject controls.
- **Customer & Seller Governance**:
  - Search, inspect complete profiles, ban/unban, or permanently remove accounts.
- **System Settings & Maintenance Mode**:
  - Live platform configuration: Storefront Maintenance Mode toggle with customizable message, global Announcement Banner, platform commission rates, free shipping thresholds, and delivery fees.

---

## 🔒 Security & Architecture Standards

- **Payload Sanitization**: All authentication, login, registration, and user query endpoints strip sensitive properties (`password`, `otp`, `otpExpires`) before returning responses.
- **Two-Factor Authentication (2FA)**: All roles (User, Seller, Admin) enforce password verification followed by a 6-digit Email OTP before JWT tokens are issued.
- **Admin Bootstrap Security**: Direct unauthenticated admin registration is restricted to first-time setup (when 0 admins exist) and automatically locks thereafter.
- **Strong Password Policy**: Passwords require a minimum of 8 characters, at least one uppercase letter (`A-Z`), one lowercase letter (`a-z`), one number (`0-9`), and one special character.
- **Sticky Layouts & Viewport Bounds**: Viewports utilize `overflow-x: clip` to completely prevent horizontal scrollbars on mobile and desktop devices without breaking native `position: sticky; top: 0;` navigation bars.
- **Outside Click Listeners**: Profile dropdown menus and modals close on outside clicks via event listeners and React refs.

---

## 🏗️ Monorepo Architecture

```
zycart/
├── client-user/          # Customer React 19 Frontend (Port 5173)
├── client-seller/        # Seller Portal React 19 Frontend (Port 5174)
├── client-admin/         # Admin Management React 19 Frontend (Port 5175)
└── server/               # Express.js REST API Backend (Port 5000)
    ├── config/           # Database (db.js) & Cloudinary configuration
    ├── controllers/      # Controllers for auth, products, orders, cart, admin, settings
    ├── middleware/       # JWT auth guards (User, Seller, Admin, RBAC) & Multer uploads
    ├── models/           # Mongoose schemas (User, Seller, Admin, Product, Order, Settings)
    ├── routes/           # Express API route definitions
    ├── scripts/          # Database seeding & Super Admin creation scripts
    ├── utils/            # Category cache, sanitizers, and email/OTP utilities
    └── server.js         # Backend server entry point
```

---

## 🛠️ Tech Stack

### Frontend (`client-user`, `client-seller`, `client-admin`)
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
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & 2FA Email OTPs
- **File Uploads**: [Cloudinary 2.8](https://cloudinary.com/) & [Multer 2.0](https://github.com/expressjs/multer)
- **Email Service**: Gmail SMTP via [Nodemailer 7.0](https://nodemailer.com/)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas cluster
- **Cloudinary Account**: Cloud name, API key, and API secret
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
Create a `server/.env` file with the following keys:

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
Create `.env` in `client-user/`, `client-seller/`, and `client-admin/`:

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
   # Run default Super Admin provision:
   npm run seed:superadmin

   # Or provide custom credentials:
   node scripts/createSuperAdmin.js "admin@zycart.com" "SuperAdmin@2026" "9876543210" "Chief Admin"
   ```

### Running the Applications Locally

1. **Start Backend API Server**:
   ```bash
   cd server
   npm run dev
   ```
   *Backend runs on `http://localhost:5000`*

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
1. In Vercel, import the repository and set **Root Directory** to `server`.
2. Ensure `server/vercel.json` exists:
   ```json
   {
     "version": 2,
     "builds": [{ "src": "server.js", "use": "@vercel/node" }],
     "routes": [{ "src": "/(.*)", "dest": "server.js" }]
   }
   ```
3. Add Backend Environment Variables (`MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_*`, `EMAIL_USER`, `EMAIL_PASS`, `CLIENT_URL1/2/3`).
4. Deploy to receive your live API URL (e.g., `https://zycart-api.vercel.app`).

### 2. Deploy Frontends (`client-user`, `client-seller`, `client-admin`)
For each frontend:
1. Import the repository in Vercel.
2. Set **Root Directory** to `client-user`, `client-seller`, or `client-admin`.
3. Add Environment Variable:
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
| `POST` | `/auth/seller/submit-details` | Submit seller business details & trade license | Public |

### ⚙️ Admin Operations (`/admin`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/admin/dashboard` | Platform metrics & summary statistics | Admin (`view_analytics`) |
| `GET` | `/admin/admins` | List all system admin accounts | Super Admin / Admin (`manage_admins`) |
| `POST` | `/admin/admins` | Create new sub-admin with permissions | Super Admin / Admin (`manage_admins`) |
| `PUT` | `/admin/admins/:id` | Update sub-admin permissions & status | Super Admin / Admin (`manage_admins`) |
| `DELETE` | `/admin/admins/:id` | Delete sub-admin account | Super Admin Only |
| `PATCH` | `/admin/sellers/approve/:id` | Approve seller application | Admin (`manage_sellers`) |
| `PATCH` | `/admin/sellers/reject/:id` | Reject seller application | Admin (`manage_sellers`) |
| `PATCH` | `/admin/sellers/ban/:id` | Ban seller and unlist products | Admin (`manage_sellers`) |
| `PATCH` | `/admin/sellers/unban/:id` | Unban seller and restore products | Admin (`manage_sellers`) |
| `PATCH` | `/admin/users/ban/:id` | Ban customer account | Admin (`manage_users`) |
| `PATCH` | `/admin/users/unban/:id` | Unban customer account | Admin (`manage_users`) |

---

## 📦 Database Models

- **User**: Customer credentials, addresses, ban status, and OTP tokens.
- **Seller**: Merchant profile, business details, trade license document URL, approval status (`pending`, `approved`, `rejected`), bank info, and metrics.
- **Admin**: Administrator credentials, role (`super_admin` vs `admin`), active status, and granular permissions array.
- **Product**: Title, description, price, discounted price, stock, max quantity per purchase (`maxQuantityPerPurchase`), Cloudinary images, category references, seller reference, and dynamic attribute map.
- **Order**: Split-order model containing Parent Order details, customer reference, shipping address, payment status, total price, and embedded child orders per seller.
- **Settings**: Dynamic platform configurations (Platform Name, Currency, Maintenance Mode, Announcement Banners, Commission Rates, Delivery Fees).

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
