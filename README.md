# ZyCart - E-Commerce Platform

A comprehensive full-stack e-commerce platform with separate applications for users, sellers, and administrators.

## 📋 Project Overview

ZyCart is a multi-user e-commerce platform designed to support three distinct user roles:
- **Users**: Browse and purchase products
- **Sellers**: Manage inventory and sales
- **Admins**: Oversee platform operations

## 🏗️ Architecture

The project is structured as a monorepo with separate client and server applications:

```
ZyCart/
├── client-user/          # User-facing React application
├── client-seller/        # Seller dashboard React application
├── client-admin/         # Admin dashboard React application
└── server/               # Backend Node.js/Express server
```

## 🛠️ Tech Stack

### Frontend (All Client Applications)
- **React** - UI framework
- **Vite** - Build tool and dev server
- **CSS** - Styling
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Cloudinary** - Image hosting
- **JWT** - Authentication

## 📁 Project Structure

### Server (`server/`)
```
server/
├── config/               # Configuration files (DB, Cloudinary)
├── controllers/          # Request handlers
├── middleware/           # Custom middleware
├── models/              # MongoDB schemas
├── routes/              # API endpoints
├── scripts/             # Seed scripts
├── utils/               # Utility functions
└── server.js            # Entry point
```

### Client Applications
Each client (`client-admin/`, `client-seller/`, `client-user/`) follows this structure:
```
src/
├── components/          # Reusable React components
├── context/             # Context API providers
├── pages/               # Page components
├── routes/              # Route definitions
├── utils/               # Utility functions
├── assets/              # Static assets
├── App.jsx              # Main App component
├── main.jsx             # Entry point
└── index.css            # Global styles
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB
- Cloudinary account (for image hosting)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ZyCart
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install client dependencies**
```bash
# For user client
cd ../client-user
npm install

# For seller client
cd ../client-seller
npm install

# For admin client
cd ../client-admin
npm install
```

### Environment Configuration

1. **Server Configuration** (`server/`)
Create a `.env` file in the server directory:
```
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
CLOUDINARY_NAME=<your-cloudinary-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
SMTP_EMAIL=<your-email>
SMTP_PASSWORD=<your-password>
PORT=5000
```

2. **Client Configuration** (All client folders)
Create a `.env` file in each client directory:
```
VITE_API_BASE_URL=http://localhost:5000
```

### Running the Application

1. **Start the server**
```bash
cd server
npm start
```
The server will run on `http://localhost:5000`

2. **Start client applications** (in separate terminals)
```bash
# User client
cd client-user
npm run dev

# Seller client
cd client-seller
npm run dev

# Admin client
cd client-admin
npm run dev
```

### Access Points
- **User Application**: `http://localhost:5173`
- **Seller Dashboard**: `http://localhost:5174`
- **Admin Dashboard**: `http://localhost:5175`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset
- `POST /api/auth/change-password` - Change password

### Product Endpoints
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Seller)
- `PUT /api/products/:id` - Update product (Seller)
- `DELETE /api/products/:id` - Delete product (Seller)

### User Endpoints
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/:id/wishlist` - Get wishlist
- `POST /api/cart` - Add to cart
- `GET /api/cart` - Get cart items

### Order Endpoints
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order status

### Admin Endpoints
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - Manage users
- `GET /api/admin/sellers` - Manage sellers
- `POST /api/admin/categories` - Manage categories

## 📝 Available Scripts

### Server
```bash
npm start          # Start the server
npm test           # Run tests (if configured)
```

### Client Applications
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

## 🔐 Authentication & Authorization

The platform uses JWT-based authentication with role-based access control:
- **User**: Can browse products, make purchases, write reviews
- **Seller**: Can manage products, view orders, manage inventory
- **Admin**: Full platform control, user management, analytics

Protected routes are implemented using the `ProtectedRoute` component in each client application.

## 📦 Database Models

- **User** - Customer accounts
- **Seller** - Seller accounts
- **Admin** - Administrator accounts
- **Product** - Product listings
- **Category** - Product categories
- **Order** - Customer orders
- **Review** - Product reviews
- **Wishlist** - User wishlists
- **Cart** - Shopping cart (session-based)
- **Attribute** - Product attributes
- **Trend** - Trending products

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, please contact support@zycart.com or open an issue on GitHub.

## 🗺️ Roadmap

- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Email notifications
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Advanced search filters
- [ ] AI-powered recommendations
- [ ] Multi-language support

---

**Last Updated**: February 2026
