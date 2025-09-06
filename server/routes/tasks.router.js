// server/routes/tasks.js
const express = require('express');
const Task = require('../models/Task.models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
//GET
router.get('/',authenticateToken,async (req, res) => {
    try {
        // const tasks = await Task.find().sort({ status: 1, position: 1 });
        const tasks = await Task.find().populate().sort({ status: 1, position: 1 });
        res.json({
            success: true,
            tasks
        });
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tasks'
        });
    }
});

router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, description, status = 'To Do' } = req.body;

        // Input validation
        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: 'Title and description are required'
            });
        }

        const highestPositionTask = await Task.findOne({ status }).sort({ position: -1 });
        const position = highestPositionTask ? highestPositionTask.position + 1 : 0;

        // Create new task
        const task = new Task({
            title,
            description,
            status,
            position,
            createdBy: req.user._id 
        });

        await task.save();
        await task.populate('createdBy', 'username email role');

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            task
        });
    } catch (error) {
        console.error('Create task error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join('. ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create task'
        });
    }
});
//PUT
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, position } = req.body;

        // Find the task
        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        
        if (task.createdBy._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own tasks'
            });
        }

        // Update fields if provided
        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (status !== undefined) task.status = status;
        if (position !== undefined) task.position = position;

        await task.save();

        res.json({
            success: true,
            message: 'Task updated successfully',
            task
        });
    } catch (error) {
        console.error('Update task error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join('. ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update task'
        });
    }
});

router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id).populate('createdBy', 'name email role');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        if (task.createdBy._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You can only view your own tasks'
            });
        }

        res.json({
            success: true,
            task
        });
    } catch (error) {
        console.error('Get task error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve task'
        });
    }
});

// DELETE 
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Find the task
        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Check permissions: only creator or admin can delete
        if (task.createdBy._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own tasks'
            });
        }

        await Task.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete task'
        });
    }
});

module.exports = router;