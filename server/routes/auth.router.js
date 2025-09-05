// server/routes/auth.js
const express = require('express');
const User = require('../models/User.model');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register - User registration
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Basic input validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, and password are required.'
            });
        }

        // Check if user already exists (by username or email)
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email or username already exists.'
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password, // Will be hashed by the pre-save middleware
            role: role === 'admin' ? 'admin' : 'user' // Default to 'user' if not admin
        });

        // Save user to database
        await user.save();

        // Generate JWT token
        const token = generateToken(user._id);

        // Send success response with token and user info
        res.status(201).json({
            success: true,
            message: 'User registered successfully.',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Registration error:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join('. ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    }
});

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Basic input validation
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required.'
            });
        }

        // Find user by username (could also support email login)
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password.'
            });
        }

        // Check password using the instance method we created
        const isValidPassword = await user.comparePassword(password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password.'
            });
        }

        // Generate JWT token
        const token = generateToken(user._id);

        // Send success response
        res.json({
            success: true,
            message: 'Login successful.',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
});

// GET /api/auth/me - Get current user info (protected route)
router.get('/me', authenticateToken, async (req, res) => {
    try {
        // req.user is set by the authenticateToken middleware
        res.json({
            success: true,
            user: {
                id: req.user._id,
                username: req.user.username,
                email: req.user.email,
                role: req.user.role
            }
        });
    } catch (error) {
        console.error('Get user info error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user information.'
        });
    }
});

// POST /api/auth/logout - Logout (client-side token removal)
router.post('/logout', (req, res) => {
    // Since JWT is stateless, we don't need to do anything on the server
    // The client will remove the token from localStorage
    res.json({
        success: true,
        message: 'Logout successful. Please remove token from client.'
    });
});

module.exports = router;