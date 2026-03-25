import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - require authentication
export const protect = async (req, res, next) => {
    try {
        let token;

        // Get token from header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Access denied. No token provided.'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Token is valid but user no longer exists.'
                });
            }

            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid token.'
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Server error in authentication.'
        });
    }
};

// Restrict to specific roles
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied. Insufficient permissions.'
            });
        }
        next();
    };
};

// Optional auth - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id).select('-password');
                if (user) {
                    req.user = user;
                }
            } catch (error) {
                // Token is invalid, but we don't fail
                console.log('Optional auth: Invalid token');
            }
        }

        next();
    } catch (error) {
        console.error('Optional auth middleware error:', error);
        next();
    }
};
