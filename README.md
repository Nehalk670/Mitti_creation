# Mitti Creation - MERN Stack E-commerce

A beautiful e-commerce platform for handcrafted festive items, built with React, Express, MongoDB, and Node.js.

## Features

- 🛍️ **Product Catalog**: Browse handcrafted diyas, lanterns, and candles
- 🛒 **Shopping Cart**: Add items, manage quantities, and checkout
- 💳 **Payment Gateway**: Integrated Razorpay for online payments
- 🚚 **Cash on Delivery**: COD option available
- 👤 **User Authentication**: JWT-based auth with email verification
- 🔐 **Role-based Access**: Admin and user roles
- 📊 **Admin Dashboard**: Manage products and orders
- 📱 **Responsive Design**: Beautiful UI with dark theme
- ⚡ **Real-time Updates**: Live cart and order management

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Framer Motion for animations
- Axios for API calls
- React Router for navigation

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Razorpay for payments
- Nodemailer for email verification

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- Razorpay account for payments
- Email service for verification

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd mitti-creation

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Environment Variables

Create a `.env` file in the root directory:
```env
# Frontend
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
```

Create a `.env` file in the server directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mitti-creation

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@mitticreation.com

# Razorpay Configuration
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 3. Run the Application

```bash
# Install all dependencies (frontend + backend)
npm run install-all

# Start both frontend and backend concurrently
npm start
```

Or run separately:
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Admin Dashboard**: http://localhost:5173/admin

## Demo Credentials

### Admin Account
- **Email**: admin@mitti.com
- **Password**: admin123

### User Account
- **Email**: user@mitti.com
- **Password**: user123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove/:id` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders/create-razorpay-order` - Create Razorpay order
- `POST /api/orders/verify-payment` - Verify payment
- `POST /api/orders/cod` - Create COD order
- `PUT /api/orders/:id/status` - Update order status (Admin)

## Project Structure

```
mitti-creation/
├── src/                    # Frontend React app
│   ├── components/         # Reusable components
│   ├── context/           # React contexts
│   ├── lib/               # API utilities
│   ├── pages/             # Page components
│   ├── services/          # Data services
│   └── main.tsx           # App entry point
├── server/                # Backend Express app
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
│   ├── services/          # External services
│   └── index.js           # Server entry point
├── package.json           # Frontend dependencies
└── server/package.json    # Backend dependencies
```

## Features Overview

### 🛍️ Shopping Experience
- Browse products with beautiful animations
- Add items to cart with quantity management
- Secure checkout with shipping information
- Multiple payment options (Razorpay + COD)

### 👤 User Management
- JWT-based authentication
- Email verification system
- Password reset functionality
- Role-based access control

### 📊 Admin Features
- Product management (CRUD operations)
- Order management and status updates
- User role management
- Real-time dashboard

### 🔒 Security
- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- CORS and security headers

## Development

### Adding New Features
1. Create API endpoints in `server/routes/`
2. Add corresponding frontend components
3. Update TypeScript interfaces
4. Test with demo credentials

### Database Schema
- **Users**: Authentication and profile data
- **Products**: Product catalog with inventory
- **Cart**: User shopping cart items
- **Orders**: Order history and payment info

## Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables in hosting platform

### Backend (Railway/Heroku)
1. Set up MongoDB Atlas
2. Configure environment variables
3. Deploy server code
4. Update frontend API URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

---

**Mitti Creation** - Handcrafted Elegance for Your Festive Celebrations 🪔
