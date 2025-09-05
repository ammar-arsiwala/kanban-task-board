const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Task description is required'],
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    status: {
        type: String,
        required: true,
        enum: ['To Do', 'In Progress', 'Done'], // Exactly as specified in NYI document
        default: 'To Do'
    },
    position: {
        type: Number,
        required: true,
        default: 0 // Used for ordering tasks within columns
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to User model
        required: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Index for better query performance
taskSchema.index({ status: 1, position: 1 });
taskSchema.index({ createdBy: 1 });

// Populate user information when querying tasks
taskSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'createdBy',
        select: 'username email role' 
    });
    next();
});

module.exports = mongoose.model('Task', taskSchema);