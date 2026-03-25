import express from 'express';
import { body, validationResult } from 'express-validator';
import Product from '../models/Product.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { category, search, sort = 'createdAt', order = 'desc', page = 1, limit = 12 } = req.query;

        // Build query
        const query = {};

        if (category && category !== 'all') {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tagline: { $regex: search, $options: 'i' } }
            ];
        }

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Execute query
        const products = await Product.find(query)
            .sort({ [sort]: order === 'desc' ? -1 : 1 })
            .skip(skip)
            .limit(limitNum);

        const total = await Product.countDocuments(query);

        res.json({
            status: 'success',
            data: {
                products,
                pagination: {
                    current: pageNum,
                    pages: Math.ceil(total / limitNum),
                    total,
                    limit: limitNum
                }
            }
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching products'
        });
    }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: 'Product not found'
            });
        }

        res.json({
            status: 'success',
            data: { product }
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching product'
        });
    }
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, authorize('admin'), [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
    body('image').isURL().withMessage('Please provide a valid image URL'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('tagline').optional().trim().isLength({ max: 100 }).withMessage('Tagline cannot exceed 100 characters'),
    body('category').optional().trim().isLength({ max: 50 }).withMessage('Category cannot exceed 50 characters')
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

        const productData = req.body;

        // Check if product with same name already exists
        const existingProduct = await Product.findOne({ name: productData.name });
        if (existingProduct) {
            return res.status(400).json({
                status: 'error',
                message: 'Product with this name already exists'
            });
        }

        const product = await Product.create(productData);

        res.status(201).json({
            status: 'success',
            message: 'Product created successfully',
            data: { product }
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while creating product'
        });
    }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), [
    body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters'),
    body('price').optional().isNumeric().withMessage('Price must be a number'),
    body('description').optional().trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
    body('image').optional().isURL().withMessage('Please provide a valid image URL'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('tagline').optional().trim().isLength({ max: 100 }).withMessage('Tagline cannot exceed 100 characters'),
    body('category').optional().trim().isLength({ max: 50 }).withMessage('Category cannot exceed 50 characters')
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

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: 'Product not found'
            });
        }

        // Check if new name conflicts with existing product
        if (req.body.name && req.body.name !== product.name) {
            const existingProduct = await Product.findOne({ name: req.body.name });
            if (existingProduct) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Product with this name already exists'
                });
            }
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            status: 'success',
            message: 'Product updated successfully',
            data: { product: updatedProduct }
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while updating product'
        });
    }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: 'Product not found'
            });
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({
            status: 'success',
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while deleting product'
        });
    }
});

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
router.get('/categories', async (req, res) => {
    try {
        const categories = await Product.distinct('category');

        res.json({
            status: 'success',
            data: { categories }
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching categories'
        });
    }
});

export default router;
