// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

// Middleware to verify JWT token and authenticate users
const authenticateToken = async (req, res, next) => {
    try {
        // Get token from Authorization header (format: "Bearer <token>")
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Extract token after "Bearer "

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required. Please login.'
            });
        }

        // Verify token with JWT secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by ID from token payload
        const user = await User.findById(decoded.userId).select('-password');

        // Check if user still exists (in case user was deleted after token was issued)
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Please login again.'
            });
        }

        // Attach user info to request object for use in route handlers
        req.user = user;
        next(); // Continue to the next middleware/route handler

    } catch (error) {
        // Handle different types of JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please login again.'
            });
        }

        // Generic error
        res.status(500).json({
            success: false,
            message: 'Authentication failed.'
        });
    }
};

// Middleware to check if user has admin role
const requireAdmin = (req, res, next) => {
    // This middleware should be used after authenticateToken
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.'
        });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required.'
        });
    }

    next(); // User is admin, continue
};

// Utility function to generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId }, // Payload - contains user ID
        process.env.JWT_SECRET, // Secret key from environment variables
        {
            expiresIn: process.env.JWT_EXPIRE || '7d' // Token expiration time
        }
    );
};

module.exports = {
    authenticateToken,
    requireAdmin,
    generateToken
};