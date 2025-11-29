# ZyCart – Full-Featured MERN E-commerce Platform

ZyCart is a multi-supplier e-commerce web application built using the **MERN stack** with a clean UI/UX powered by **React (Vite) + Tailwind CSS**.  
This project supports multiple roles — **User, Supplier, Admin** — along with multi-supplier order splitting, OTP-based registration, supplier onboarding, inventory management, protected routes, and an admin control panel.

---

## 🚀 Tech Stack

### Frontend
- React (Vite)
- React Router
- Tailwind CSS
- Axios
- Context API (Auth + Cart)
- Clean reusable components

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Multer (image/document upload)
- Cloudinary / Local mock for images
- OTP service (email/console)

---

## 🧑‍💻 Features Overview

### 👤 User
- Register using email → OTP verification  
- Add name, mobile, password  
- Address added during first checkout  
- Cart (quantity limited by stock)  
- Multi-supplier checkout → parent & child orders  
- View combined and supplier-level order statuses  
- Delete account permanently  

### 🛒 Supplier
- Apply for partnership with documents  
- Add, edit, manage products  
- Mark items unavailable  
- Manage inventory  
- Manage supplier-specific orders  
- Update statuses: Confirmed → Packed → Shipped  

### 🛡️ Admin
- Created only via Postman  
- Approve/Reject suppliers  
- Ban/Unban users/suppliers  
- Manage global order statuses: Out for Delivery → Delivered  
- View parent orders with supplier-level child orders  

---

## 🧱 Project Structure

```
/ (root)
│── server/
│── client/
│── README.md
│── .gitignore
│── package.json  (monorepo helper scripts)
│── .env
```

---

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/sujoy-kumar-mondal/ZyCart.git
cd ZyCart
```

---

## ⚙️ Environment Variables

Create `.env` inside `/client`.

```env
VITE_SERVER_URL=http://localhost:5000

```
Create `.env` inside `/server`.

```env
PORT=5000

MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

JWT_SECRET=<your_jwt_secret_key>
JWT_EXPIRES_IN=7d

OTP_EXPIRY_MINUTES=5

CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>

PLATFORM_COMMISSION_RATE=<percentage_as_number>   # e.g., 0.1 for 10%

CLIENT_URL=http://localhost:5173

EMAIL_HOST=<smtp_host>             # e.g., smtp.gmail.com
EMAIL_USER=<your_email_address>
EMAIL_PASS=<your_email_password_or_app_password>

```

---

## ▶️ Running the App

### Install dependencies

```bash
npm run install-all
```

### Start backend

```bash
cd server
npm run dev
```

### Start frontend

```bash
cd client
npm run dev
```

---

## 🔐 Default Roles

### User & Supplier

Create through UI.

### Admin

Create only through Postman:

```
POST /admin/create
```

---

## 🧪 Testing Flow (For Demo)

1. Register a user → verify OTP → login
2. Explore products & add to cart
3. Checkout → multi-supplier order split
4. Register a supplier → apply → approve via admin
5. Add supplier products
6. Mark supplier child orders as Packed/Shipped
7. Admin marks parent order → Out for Delivery → Delivered

---

## 📦 Deployment Tips

* Frontend → Netlify/Vercel
* Backend → Render/Cloud Run
* DB → MongoDB Atlas
* Set CORS + HTTPS in production

---

## 📚 Documentation

A separate `/docs/API.md` will contain all endpoint details.

---

## 👨‍🎓 For University Evaluation

This project fully satisfies the given topic:

* React components with reusable JSX
* Cart, checkout, dynamic rendering (map/filter)
* Role-based routing
* Complete MERN architecture
* Multi-supplier e-commerce workflow