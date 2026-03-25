import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { generateToken, generateVerificationToken, generateResetToken } from '../utils/generateToken.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService.js';
import { protect } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
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

        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'User already exists with this email'
            });
        }

        // Generate verification token
        const verificationToken = generateVerificationToken();

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            verificationToken
        });

        // Send verification email
        const emailSent = await sendVerificationEmail(email, verificationToken);

        if (!emailSent) {
            console.log('Warning: Verification email could not be sent');
        }

        // Generate JWT token
        const token = generateToken(user._id);

        res.status(201).json({
            status: 'success',
            message: 'User registered successfully. Please check your email for verification.',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    verified: user.verified
                },
                token
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error during registration'
        });
    }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
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

        const { email, password } = req.body;

        // Find user and include password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = generateToken(user._id);

        res.json({
            status: 'success',
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    verified: user.verified
                },
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error during login'
        });
    }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        res.json({
            status: 'success',
            data: {
                user: {
                    id: req.user._id,
                    name: req.user.name,
                    email: req.user.email,
                    role: req.user.role,
                    verified: req.user.verified
                }
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error'
        });
    }
});

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
router.post('/verify-email', [
    body('token').notEmpty().withMessage('Verification token is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { token } = req.body;

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (decoded.type !== 'verification') {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid verification token'
                });
            }

            // Find user by verification token
            const user = await User.findOne({ verificationToken: token });

            if (!user) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid or expired verification token'
                });
            }

            // Update user verification status
            user.verified = true;
            user.verificationToken = undefined;
            await user.save();

            res.json({
                status: 'success',
                message: 'Email verified successfully'
            });
        } catch (jwtError) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid or expired verification token'
            });
        }
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error during email verification'
        });
    }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            // Don't reveal if user exists or not
            return res.json({
                status: 'success',
                message: 'If an account with that email exists, we have sent a password reset link.'
            });
        }

        // Generate reset token
        const resetToken = generateResetToken();
        const resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Save reset token
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = resetPasswordExpire;
        await user.save();

        // Send reset email
        const emailSent = await sendPasswordResetEmail(email, resetToken);

        if (!emailSent) {
            console.log('Warning: Password reset email could not be sent');
        }

        res.json({
            status: 'success',
            message: 'If an account with that email exists, we have sent a password reset link.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error during password reset request'
        });
    }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { token, password } = req.body;

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (decoded.type !== 'reset') {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid reset token'
                });
            }

            // Find user by reset token
            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpire: { $gt: new Date() }
            });

            if (!user) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid or expired reset token'
                });
            }

            // Update password
            user.password = password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            res.json({
                status: 'success',
                message: 'Password reset successfully'
            });
        } catch (jwtError) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid or expired reset token'
            });
        }
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error during password reset'
        });
    }
});

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
router.put('/update-password', protect, [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const user = await User.findById(req.user._id).select('+password');

        // Check current password
        const isPasswordValid = await user.comparePassword(currentPassword);

        if (!isPasswordValid) {
            return res.status(400).json({
                status: 'error',
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            status: 'success',
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error during password update'
        });
    }
});

export default router;
