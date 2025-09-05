import React, { useState } from 'react';
import { authAPI } from '../../services/api';
import { validationUtils } from '../../utils/auth';
import './Auth.css';

const Login = ({ onLogin, switchToRegister }) => {
    // Form state
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    // UI state
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Clear API error when user modifies form
        if (apiError) {
            setApiError('');
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        const validationErrors = validationUtils.getLoginErrors(formData);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);
        setErrors({});
        setApiError('');

        try {
            // Attempt login
            const response = await authAPI.login(formData);

            if (response.success) {
                // Login successful - notify parent component
                onLogin(response.user);
            }
        } catch (error) {
            // Handle login error
            setApiError(error.message || 'Login failed. Please try again.');
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Login to Kanban Board</h2>

                {/* API Error Message */}
                {apiError && (
                    <div className="error-message api-error">
                        {apiError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    {/* Username Field */}
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={errors.username ? 'error' : ''}
                            placeholder="Enter your username"
                            disabled={isLoading}
                        />
                        {errors.username && (
                            <span className="error-message">{errors.username}</span>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={errors.password ? 'error' : ''}
                            placeholder="Enter your password"
                            disabled={isLoading}
                        />
                        {errors.password && (
                            <span className="error-message">{errors.password}</span>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="auth-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                {/* Switch to Register */}
                <div className="auth-switch">
                    <p>
                        Don't have an account?{' '}
                        <button
                            type="button"
                            className="switch-button"
                            onClick={switchToRegister}
                            disabled={isLoading}
                        >
                            Register here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;