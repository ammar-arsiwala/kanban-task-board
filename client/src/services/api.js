// client/src/services/api.js
import axios from 'axios';

// Create axios instance with base configuration
const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add JWT token to all requests
API.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('kanban_token');

        // If token exists, add it to Authorization header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiration
API.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // If token is expired or invalid, redirect to login
        if (error.response?.status === 401) {
            // Remove invalid token
            localStorage.removeItem('kanban_token');
            localStorage.removeItem('kanban_user');

            // Redirect to login page (you can customize this)
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

// Authentication API methods
export const authAPI = {
    // Register new user
    register: async (userData) => {
        try {
            const response = await API.post('/auth/register', userData);

            // If registration successful, store token and user info
            if (response.data.success) {
                localStorage.setItem('kanban_token', response.data.token);
                localStorage.setItem('kanban_user', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Registration failed' };
        }
    },

    // Login user
    login: async (credentials) => {
        try {
            const response = await API.post('/auth/login', credentials);

            // If login successful, store token and user info
            if (response.data.success) {
                localStorage.setItem('kanban_token', response.data.token);
                localStorage.setItem('kanban_user', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Login failed' };
        }
    },

    // Logout user
    logout: () => {
        // Remove token and user info from localStorage
        localStorage.removeItem('kanban_token');
        localStorage.removeItem('kanban_user');

        // Redirect to login page
        window.location.href = '/login';
    },

    // Get current user info
    getCurrentUser: async () => {
        try {
            const response = await API.get('/auth/me');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to get user info' };
        }
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        const token = localStorage.getItem('kanban_token');
        return !!token; // Returns true if token exists, false otherwise
    },

    // Get stored user info
    getStoredUser: () => {
        const user = localStorage.getItem('kanban_user');
        return user ? JSON.parse(user) : null;
    }
};

// Task API methods (for future use)
export const taskAPI = {
    // Get all tasks
    getAllTasks: async () => {
        try {
            const response = await API.get('/tasks');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch tasks' };
        }
    },

    // Create new task
    createTask: async (taskData) => {
        try {
            const response = await API.post('/tasks', taskData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to create task' };
        }
    },

    // Update task
    updateTask: async (taskId, taskData) => {
        try {
            console.log('Updating task:', taskId, 'with data:', taskData);
            
            const response = await API.put(`/tasks/${taskId}`, taskData);
            
            console.log('Update response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Update task error details:', {
                taskId,
                taskData,
                error: error.response?.data || error.message,
                status: error.response?.status,
                statusText: error.response?.statusText
            });
            
            throw error.response?.data || { message: 'Failed to update task' };
        }
    },
    // Delete task
    deleteTask: async (taskId) => {
        try {
            const response = await API.delete(`/tasks/${taskId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to delete task' };
        }
    },

    getTask: async (taskId) => {
        try {
            const response = await API.get(`/tasks/${taskId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to get task' };
        }
    }
};

export default API;