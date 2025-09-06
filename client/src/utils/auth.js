// client/src/utils/auth.js


export const authUtils = {
    // Check if user is authenticated
    isAuthenticated: () => {
        const token = localStorage.getItem('kanban_token');

        if (!token) return false;

        try {
            // Decode JWT token to check expiration (basic check)
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;

            // If token is expired, remove it and return false
            if (payload.exp < currentTime) {
                localStorage.removeItem('kanban_token');
                localStorage.removeItem('kanban_user');
                return false;
            }

            return true;
        } catch (error) {
         
            localStorage.removeItem('kanban_token');
            localStorage.removeItem('kanban_user');
            return false;
        }
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('kanban_user');
        return user ? JSON.parse(user) : null;
    },

    isAdmin: () => {
        const user = authUtils.getCurrentUser();
        return user && user.role === 'admin';
    },

    canEditTask: (taskCreatorId) => {
        const user = authUtils.getCurrentUser();
        if (!user) return false;

        // Admin can edit any task, users can only edit their own
        return user.role === 'admin' || user.id === taskCreatorId;
    },

    // Get access token
    getToken: () => {
        return localStorage.getItem('kanban_token');
    },

    // Clear auth
    clearAuth: () => {
        localStorage.removeItem('kanban_token');
        localStorage.removeItem('kanban_user');
    },

    // Store auth
    setAuth: (token, user) => {
        localStorage.setItem('kanban_token', token);
        localStorage.setItem('kanban_user', JSON.stringify(user));
    },
    
    getUserDisplayName: (user) => {
        if (!user) return 'Unknown User';
        return user.username || user.email || 'Unknown User';
    }
};

// Form validation utilities
export const validationUtils = {
   
    isValidEmail: (email) => {
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        return emailRegex.test(email);
    },


    isValidUsername: (username) => {
        // Username should be 3-20 characters, alphanumeric and underscores
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        return usernameRegex.test(username);
    },


    isValidPassword: (password) => {
        return password && password.length >= 5;
    },

    // Get validation errors for registration form
    getRegistrationErrors: (formData) => {
        const errors = {};

        if (!formData.username) {
            errors.username = 'Username is required';
        } else if (!validationUtils.isValidUsername(formData.username)) {
            errors.username = 'Username must be 3-20 characters, letters, numbers, and underscores only';
        }

        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!validationUtils.isValidEmail(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (!validationUtils.isValidPassword(formData.password)) {
            errors.password = 'Password must be at least 5 characters long';
        }

        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        return errors;
    },

    // Get validation errors for login form
    getLoginErrors: (formData) => {
        const errors = {};

        if (!formData.username) {
            errors.username = 'Username is required';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        }

        return errors;
    }
};

// Protected Route component helper
export const withAuth = (Component) => {
    return (props) => {
        if (!authUtils.isAuthenticated()) {
            window.location.href = '/login';
            return null;
        }
        return <Component {...props} />;
    };
};

export default authUtils;