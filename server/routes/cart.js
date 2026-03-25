import express from 'express';
import { body, validationResult } from 'express-validator';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product', 'name price image tagline stock');

        if (!cart) {
            return res.json({
                status: 'success',
                data: {
                    cart: {
                        items: [],
                        totalItems: 0,
                        totalAmount: 0
                    }
                }
            });
        }

        // Calculate total amount
        let totalAmount = 0;
        const cartItems = cart.items.map(item => {
            const itemTotal = item.product.price * item.quantity;
            totalAmount += itemTotal;

            return {
                id: item.product._id,
                product: {
                    id: item.product._id,
                    name: item.product.name,
                    price: item.product.price,
                    image: item.product.image,
                    tagline: item.product.tagline,
                    stock: item.product.stock
                },
                quantity: item.quantity,
                itemTotal
            };
        });

        res.json({
            status: 'success',
            data: {
                cart: {
                    items: cartItems,
                    totalItems: cart.totalItems,
                    totalAmount
                }
            }
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching cart'
        });
    }
});

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
router.post('/add', protect, [
    body('productId').isMongoId().withMessage('Valid product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
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

        const { productId, quantity } = req.body;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: 'Product not found'
            });
        }

        // Check stock availability
        if (product.stock < quantity) {
            return res.status(400).json({
                status: 'error',
                message: `Only ${product.stock} items available in stock`
            });
        }

        // Find or create cart
        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = await Cart.create({
                user: req.user._id,
                items: []
            });
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (existingItemIndex > -1) {
            // Update existing item quantity
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;

            // Check stock again
            if (product.stock < newQuantity) {
                return res.status(400).json({
                    status: 'error',
                    message: `Only ${product.stock} items available in stock`
                });
            }

            cart.items[existingItemIndex].quantity = newQuantity;
        } else {
            // Add new item
            cart.items.push({
                product: productId,
                quantity
            });
        }

        await cart.save();

        // Populate the cart with product details for response
        await cart.populate('items.product', 'name price image tagline stock');

        // Calculate total amount
        let totalAmount = 0;
        const cartItems = cart.items.map(item => {
            const itemTotal = item.product.price * item.quantity;
            totalAmount += itemTotal;

            return {
                id: item.product._id,
                product: {
                    id: item.product._id,
                    name: item.product.name,
                    price: item.product.price,
                    image: item.product.image,
                    tagline: item.product.tagline,
                    stock: item.product.stock
                },
                quantity: item.quantity,
                itemTotal
            };
        });

        res.json({
            status: 'success',
            message: 'Item added to cart successfully',
            data: {
                cart: {
                    items: cartItems,
                    totalItems: cart.totalItems,
                    totalAmount
                }
            }
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while adding item to cart'
        });
    }
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
router.put('/update', protect, [
    body('productId').isMongoId().withMessage('Valid product ID is required'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be non-negative')
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

        const { productId, quantity } = req.body;

        // Find cart
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: 'Cart not found'
            });
        }

        // Find item in cart
        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                status: 'error',
                message: 'Item not found in cart'
            });
        }

        if (quantity === 0) {
            // Remove item from cart
            cart.items.splice(itemIndex, 1);
        } else {
            // Check stock availability
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Product not found'
                });
            }

            if (product.stock < quantity) {
                return res.status(400).json({
                    status: 'error',
                    message: `Only ${product.stock} items available in stock`
                });
            }

            // Update quantity
            cart.items[itemIndex].quantity = quantity;
        }

        await cart.save();

        // If cart is empty, delete it
        if (cart.items.length === 0) {
            await Cart.findByIdAndDelete(cart._id);
            return res.json({
                status: 'success',
                message: 'Cart updated successfully',
                data: {
                    cart: {
                        items: [],
                        totalItems: 0,
                        totalAmount: 0
                    }
                }
            });
        }

        // Populate the cart with product details for response
        await cart.populate('items.product', 'name price image tagline stock');

        // Calculate total amount
        let totalAmount = 0;
        const cartItems = cart.items.map(item => {
            const itemTotal = item.product.price * item.quantity;
            totalAmount += itemTotal;

            return {
                id: item.product._id,
                product: {
                    id: item.product._id,
                    name: item.product.name,
                    price: item.product.price,
                    image: item.product.image,
                    tagline: item.product.tagline,
                    stock: item.product.stock
                },
                quantity: item.quantity,
                itemTotal
            };
        });

        res.json({
            status: 'success',
            message: 'Cart updated successfully',
            data: {
                cart: {
                    items: cartItems,
                    totalItems: cart.totalItems,
                    totalAmount
                }
            }
        });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while updating cart'
        });
    }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
router.delete('/remove/:productId', protect, async (req, res) => {
    try {
        const { productId } = req.params;

        // Find cart
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: 'Cart not found'
            });
        }

        // Find and remove item
        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                status: 'error',
                message: 'Item not found in cart'
            });
        }

        cart.items.splice(itemIndex, 1);
        await cart.save();

        // If cart is empty, delete it
        if (cart.items.length === 0) {
            await Cart.findByIdAndDelete(cart._id);
            return res.json({
                status: 'success',
                message: 'Item removed from cart successfully',
                data: {
                    cart: {
                        items: [],
                        totalItems: 0,
                        totalAmount: 0
                    }
                }
            });
        }

        // Populate the cart with product details for response
        await cart.populate('items.product', 'name price image tagline stock');

        // Calculate total amount
        let totalAmount = 0;
        const cartItems = cart.items.map(item => {
            const itemTotal = item.product.price * item.quantity;
            totalAmount += itemTotal;

            return {
                id: item.product._id,
                product: {
                    id: item.product._id,
                    name: item.product.name,
                    price: item.product.price,
                    image: item.product.image,
                    tagline: item.product.tagline,
                    stock: item.product.stock
                },
                quantity: item.quantity,
                itemTotal
            };
        });

        res.json({
            status: 'success',
            message: 'Item removed from cart successfully',
            data: {
                cart: {
                    items: cartItems,
                    totalItems: cart.totalItems,
                    totalAmount
                }
            }
        });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while removing item from cart'
        });
    }
});

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
router.delete('/clear', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.json({
                status: 'success',
                message: 'Cart is already empty'
            });
        }

        await Cart.findByIdAndDelete(cart._id);

        res.json({
            status: 'success',
            message: 'Cart cleared successfully'
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while clearing cart'
        });
    }
});

export default router;
