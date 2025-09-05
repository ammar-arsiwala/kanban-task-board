import React,
{
useState,
useEffect
}

from 'react';
import Login from './Login';
import Register from './Register';

import {
    authUtils
}

from '../../utils/auth';

const AuthContainer=({
    onAuthenticated

})=> {
    const [isLogin,
    setIsLogin]=useState(true);

    // Check if user is already authenticated when component mounts
    useEffect(()=> {
            if (authUtils.isAuthenticated()) {
                const user=authUtils.getCurrentUser();
                onAuthenticated(user);
            }
        }

        , [onAuthenticated]);

    // Handle successful login
    const handleLogin=(user)=> {
        console.log('Login successful:', user);
        onAuthenticated(user);
    }

    ;

    // Handle successful registration
    const handleRegister=(user)=> {
        console.log('Registration successful:', user);
        onAuthenticated(user);
    }

    ;

    // Switch between login and register forms
    const switchToRegister=()=>setIsLogin(false);
    const switchToLogin=()=>setIsLogin(true);

    return (<div> {
            isLogin ? (<Login onLogin= {
                    handleLogin
                }

                switchToRegister= {
                    switchToRegister
                }

                />) : (<Register onRegister= {
                    handleRegister
                }

                switchToLogin= {
                    switchToLogin
                }

                />)
        }

        </div>);
}

;

export default AuthContainer;