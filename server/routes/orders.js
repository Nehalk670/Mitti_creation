import express from 'express';
import { body, validationResult } from 'express-validator';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { createRazorpayOrder, verifyRazorpayPayment } from '../services/razorpayService.js';

const router = express.Router();

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        // Build query
        const query = { user: req.user._id };
        if (status && status !== 'all') {
            query.orderStatus = status;
        }

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await Order.countDocuments(query);

        res.json({
            status: 'success',
            data: {
                orders,
                pagination: {
                    current: pageNum,
                    pages: Math.ceil(total / limitNum),
                    total,
                    limit: limitNum
                }
            }
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching orders'
        });
    }
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                status: 'error',
                message: 'Order not found'
            });
        }

        // Check if user owns this order or is admin
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied'
            });
        }

        res.json({
            status: 'success',
            data: { order }
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching order'
        });
    }
});

// @desc    Create Razorpay order
// @route   POST /api/orders/create-razorpay-order
// @access  Private
router.post('/create-razorpay-order', protect, [
    body('shippingAddress.name').notEmpty().withMessage('Name is required'),
    body('shippingAddress.email').isEmail().withMessage('Valid email is required'),
    body('shippingAddress.phone').notEmpty().withMessage('Phone is required'),
    body('shippingAddress.address').notEmpty().withMessage('Address is required'),
    body('shippingAddress.city').notEmpty().withMessage('City is required'),
    body('shippingAddress.state').notEmpty().withMessage('State is required'),
    body('shippingAddress.pincode').notEmpty().withMessage('Pincode is required')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { shippingAddress } = req.body;

        // Get user's cart
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Cart is empty'
            });
        }

        // Check stock availability and calculate total
        let totalAmount = 0;
        const orderItems = [];

        for (const item of cart.items) {
            if (item.product.stock < item.quantity) {
                return res.status(400).json({
                    status: 'error',
                    message: `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}`
                });
            }

            const itemTotal = item.product.price * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                product: item.product._id,
                name: item.product.name,
                price: item.product.price,
                image: item.product.image,
                quantity: item.quantity
            });
        }

        // Create Razorpay order
        const razorpayOrder = await createRazorpayOrder(totalAmount);

        if (!razorpayOrder.success) {
            return res.status(500).json({
                status: 'error',
                message: 'Failed to create payment order',
                error: razorpayOrder.error
            });
        }

        // Create order in database
        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            totalAmount,
            paymentMethod: 'razorpay',
            paymentStatus: 'pending',
            shippingAddress,
            razorpayOrderId: razorpayOrder.order.id
        });

        res.json({
            status: 'success',
            message: 'Razorpay order created successfully',
            data: {
                order: {
                    id: order._id,
                    orderNumber: order.orderNumber,
                    totalAmount: order.totalAmount,
                    razorpayOrderId: order.razorpayOrderId
                },
                razorpayOrder: razorpayOrder.order
            }
        });
    } catch (error) {
        console.error('Create Razorpay order error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while creating payment order'
        });
    }
});

// @desc    Verify Razorpay payment and complete order
// @route   POST /api/orders/verify-payment
// @access  Private
router.post('/verify-payment', protect, [
    body('orderId').notEmpty().withMessage('Order ID is required'),
    body('razorpayOrderId').notEmpty().withMessage('Razorpay order ID is required'),
    body('razorpayPaymentId').notEmpty().withMessage('Razorpay payment ID is required'),
    body('razorpaySignature').notEmpty().withMessage('Razorpay signature is required')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

        // Find order
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                status: 'error',
                message: 'Order not found'
            });
        }

        // Check if user owns this order
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied'
            });
        }

        // Check if order is already completed
        if (order.paymentStatus === 'completed') {
            return res.status(400).json({
                status: 'error',
                message: 'Payment already processed'
            });
        }

        // Verify payment signature
        const verification = verifyRazorpayPayment(
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
        );

        if (!verification.success) {
            // Update order status to failed
            order.paymentStatus = 'failed';
            await order.save();

            return res.status(400).json({
                status: 'error',
                message: 'Payment verification failed',
                error: verification.message
            });
        }

        // Update stock quantities
        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: -item.quantity } }
            );
        }

        // Update order status
        order.paymentStatus = 'completed';
        order.orderStatus = 'processing';
        order.razorpayPaymentId = razorpayPaymentId;
        order.razorpaySignature = razorpaySignature;
        await order.save();

        // Clear user's cart
        await Cart.findOneAndDelete({ user: req.user._id });

        res.json({
            status: 'success',
            message: 'Payment verified and order completed successfully',
            data: { order }
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while verifying payment'
        });
    }
});

// @desc    Create COD order
// @route   POST /api/orders/cod
// @access  Private
router.post('/cod', protect, [
    body('shippingAddress.name').notEmpty().withMessage('Name is required'),
    body('shippingAddress.email').isEmail().withMessage('Valid email is required'),
    body('shippingAddress.phone').notEmpty().withMessage('Phone is required'),
    body('shippingAddress.address').notEmpty().withMessage('Address is required'),
    body('shippingAddress.city').notEmpty().withMessage('City is required'),
    body('shippingAddress.state').notEmpty().withMessage('State is required'),
    body('shippingAddress.pincode').notEmpty().withMessage('Pincode is required')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { shippingAddress } = req.body;

        // Get user's cart
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Cart is empty'
            });
        }

        // Check stock availability and calculate total
        let totalAmount = 0;
        const orderItems = [];

        for (const item of cart.items) {
            if (item.product.stock < item.quantity) {
                return res.status(400).json({
                    status: 'error',
                    message: `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}`
                });
            }

            const itemTotal = item.product.price * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                product: item.product._id,
                name: item.product.name,
                price: item.product.price,
                image: item.product.image,
                quantity: item.quantity
            });
        }

        // Update stock quantities
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: -item.quantity } }
            );
        }

        // Create COD order
        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            totalAmount,
            paymentMethod: 'cod',
            paymentStatus: 'pending',
            orderStatus: 'processing',
            shippingAddress
        });

        // Clear user's cart
        await Cart.findOneAndDelete({ user: req.user._id });

        res.status(201).json({
            status: 'success',
            message: 'Order placed successfully. Pay on delivery.',
            data: { order }
        });
    } catch (error) {
        console.error('Create COD order error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while creating COD order'
        });
    }
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
    try {
        const { page = 1, limit = 10, status, paymentStatus } = req.query;

        // Build query
        const query = {};
        if (status && status !== 'all') {
            query.orderStatus = status;
        }
        if (paymentStatus && paymentStatus !== 'all') {
            query.paymentStatus = paymentStatus;
        }

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const orders = await Order.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await Order.countDocuments(query);

        res.json({
            status: 'success',
            data: {
                orders,
                pagination: {
                    current: pageNum,
                    pages: Math.ceil(total / limitNum),
                    total,
                    limit: limitNum
                }
            }
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching orders'
        });
    }
});

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), [
    body('orderStatus').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid order status'),
    body('paymentStatus').optional().isIn(['pending', 'completed', 'failed', 'refunded']).withMessage('Invalid payment status')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                status: 'error',
                message: 'Order not found'
            });
        }

        // Update order status
        order.orderStatus = req.body.orderStatus;

        if (req.body.paymentStatus) {
            order.paymentStatus = req.body.paymentStatus;
        }

        // Set delivered date if order is delivered
        if (req.body.orderStatus === 'delivered') {
            order.deliveredAt = new Date();
        }

        await order.save();

        res.json({
            status: 'success',
            message: 'Order status updated successfully',
            data: { order }
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while updating order status'
        });
    }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                status: 'error',
                message: 'Order not found'
            });
        }

        // Check if user owns this order
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied'
            });
        }

        // Check if order can be cancelled
        if (['shipped', 'delivered', 'cancelled'].includes(order.orderStatus)) {
            return res.status(400).json({
                status: 'error',
                message: 'Order cannot be cancelled at this stage'
            });
        }

        // Restore stock quantities
        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: item.quantity } }
            );
        }

        // Update order status
        order.orderStatus = 'cancelled';
        if (order.paymentStatus === 'completed') {
            order.paymentStatus = 'refunded';
        }
        await order.save();

        res.json({
            status: 'success',
            message: 'Order cancelled successfully',
            data: { order }
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while cancelling order'
        });
    }
});

export default router;
