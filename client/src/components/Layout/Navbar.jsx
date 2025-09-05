// client/src/components/Layout/Navbar.js
import React from 'react';
import { authAPI } from '../../services/api';
import { authUtils } from '../../utils/auth';
import './Navbar.css';

const Navbar = ({ user }) => {
    // Handle logout
    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            authAPI.logout();
        }
    };

    if (!user) return null;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Left side - App title */}
                <div className="navbar-brand">
                    <h1>Kanban Board</h1>
                </div>

                {/* Right side - User info and logout */}
                <div className="navbar-user">
                    <div className="user-info">
                        <span className="username">
                            {authUtils.getUserDisplayName(user)}
                        </span>
                        {user.role === 'admin' && (
                            <span className="user-role admin">Admin</span>
                        )}
                        {user.role === 'user' && (
                            <span className="user-role user">User</span>
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        className="logout-button"
                        title="Logout"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;