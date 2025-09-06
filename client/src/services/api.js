// client/src/services/api.js
import axios from 'axios';

// Create axios instance with server
const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add JWT token to all requests
API.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem('kanban_token');

        // Make bearer token 
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor 
API.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // If token is expired or invalid, redirect to login
        if (error.response?.status === 401) {
     
            localStorage.removeItem('kanban_token');
            localStorage.removeItem('kanban_user');

            // Redirect to login page 
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

    logout: () => {
        // Remove token and user 
        localStorage.removeItem('kanban_token');
        localStorage.removeItem('kanban_user');

        // Redirect to login page
        window.location.href = '/login';
    },

    getCurrentUser: async () => {
        try {
            const response = await API.get('/auth/me');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to get user info' };
        }
    },


    isAuthenticated: () => {
        const token = localStorage.getItem('kanban_token');
        return !!token; // Returns true if token exists, false otherwise
    },


    getStoredUser: () => {
        const user = localStorage.getItem('kanban_user');
        return user ? JSON.parse(user) : null;
    }
};

// Task API methods 
export const taskAPI = {
 
    getAllTasks: async () => {
        try {
            const response = await API.get('/tasks');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch tasks' };
        }
    },

    createTask: async (taskData) => {
        try {
            const response = await API.post('/tasks', taskData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to create task' };
        }
    },


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