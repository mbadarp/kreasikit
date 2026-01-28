
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import LoginModal from './auth/LoginModal';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const navigate = useNavigate();

    const handleAction = () => {
        if (isAuthenticated) {
            navigate('/app/idea-generator');
        } else {
            setIsLoginOpen(true);
        }
    };

    return (
        <>
            <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <NavLink to="/" className="flex items-center space-x-2 text-xl font-bold text-primary-600 dark:text-primary-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/><path d="M10 16s.8-1.4 2-2c1.2-1.2 2.5-2.2 2.5-3.5a2.5 2.5 0 0 0-5 0c0 1.3 1.3 2.3 2.5 3.5 1.2.6 2 2 2 2"/></svg>
                            <span>KreasiKit</span>
                        </NavLink>
                        <nav className="flex items-center">
                            <Button onClick={handleAction}>
                                {isAuthenticated ? 'Dashboard' : 'Login KreasiKit'}
                            </Button>
                        </nav>
                    </div>
                </div>
            </header>
            
            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        </>
    );
};

export default Header;
