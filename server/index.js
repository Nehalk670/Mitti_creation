import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet());
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow localhost origins
        if (origin.match(/^http:\/\/localhost:\d+$/) ||
            origin.match(/^http:\/\/127\.0\.0\.1:\d+$/) ||
            origin.match(/^http:\/\/192\.168\.\d+\.\d+:\d+$/)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('../public'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Mitti Creation API is running!',
        timestamp: new Date().toISOString()
    });
});

// Demo credentials endpoint
app.get('/api/demo-credentials', (req, res) => {
    res.status(200).json({
        admin: {
            email: 'admin@mitti.com',
            password: 'admin123'
        },
        user: {
            email: 'user@mitti.com',
            password: 'user123'
        }
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: `Route ${req.originalUrl} not found`
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong!',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Initialize demo data
        await initializeDemoData();
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

// Initialize demo data
const initializeDemoData = async () => {
    try {
        // Import models
        const User = (await import('./models/User.js')).default;
        const Product = (await import('./models/Product.js')).default;

        // Create demo users and products
        await User.createDemoUsers();
        await Product.createInitialProducts();
    } catch (error) {
        console.error('Demo data initialization error:', error);
    }
};

// Start server
const startServer = async () => {
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`
🚀 Server is running on port ${PORT}
📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}
🔗 API URL: http://localhost:${PORT}/api
💡 Demo Credentials:
   Admin: admin@mitti.com / admin123
   User: user@mitti.com / user123
    `);
    });
};

startServer();
