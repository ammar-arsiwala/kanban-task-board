// client/src/App.js
import React, { useState, useEffect } from 'react';
import AuthContainer from './components/Auth/AuthContainer';
import Navbar from './components/Layout/Navbar';
import KanbanBoard from './components/Board/KanbanBoard';
import { authUtils } from './utils/auth';
import './App.css';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check authentication status on app load
    useEffect(() => {
        const checkAuth = () => {
            if (authUtils.isAuthenticated()) {
                const storedUser = authUtils.getCurrentUser();
                setUser(storedUser);
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    // Handle successful authentication
    const handleAuthenticated = (userData) => {
        setUser(userData);
    };

    // Handle logout
    const handleLogout = () => {
        setUser(null);
    };

    // Show loading screen while checking authentication
    if (loading) {
        return (
            <div className="app-loading">
                <div className="loading-spinner"></div>
                <p>Loading Kanban Board...</p>
            </div>
        );
    }

    return (
        <div className="App">
            {user ? (
                // Authenticated user view
                <>
                    <Navbar user={user} onLogout={handleLogout} />
                    <main className="main-content">
                        <KanbanBoard />
                    </main>
                </>
            ) : (
                // Unauthenticated user view
                <AuthContainer onAuthenticated={handleAuthenticated} />
            )}
        </div>
    );
}

export default App;