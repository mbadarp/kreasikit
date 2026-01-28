
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LightbulbIcon } from '../icons/LightbulbIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { ScriptIcon } from '../icons/ScriptIcon';
import { TerminalIcon } from '../icons/TerminalIcon';
import { YoutubeIcon } from '../icons/YoutubeIcon';
import { ImageIcon } from '../icons/ImageIcon';
import { SettingsIcon } from '../icons/SettingsIcon';
import { LogOutIcon } from '../icons/LogOutIcon';

interface SidebarProps {
    className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const linkClasses = "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors";
    const activeLinkClasses = "bg-primary-100 text-primary-700 dark:bg-gray-800 dark:text-white";
    const inactiveLinkClasses = "text-gray-600 hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white";

    const handleLogout = () => {
        // Langsung logout tanpa konfirmasi untuk UX yang lebih cepat dan menghindari isu blokir browser
        logout();
        navigate('/');
    };

    return (
        <aside className={`w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full ${className}`}>
            <div className="h-16 flex items-center justify-center px-4 border-b border-gray-200 dark:border-gray-700">
                 <NavLink to="/app" className="flex items-center space-x-2 text-xl font-bold text-primary-600 dark:text-primary-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/><path d="M10 16s.8-1.4 2-2c1.2-1.2 2.5-2.2 2.5-3.5a2.5 2.5 0 0 0-5 0c0 1.3 1.3 2.3 2.5 3.5 1.2.6 2 2 2 2"/></svg>
                    <span>KreasiKit</span>
                </NavLink>
            </div>
            <nav className="flex-1 p-4 space-y-2 flex flex-col">
                <NavLink 
                    to="/app/idea-generator" 
                    className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
                >
                    <LightbulbIcon className="w-5 h-5 mr-3" />
                    Generator Ide
                </NavLink>
                <NavLink 
                    to="/app/hook-generator" 
                    className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
                >
                    <SparklesIcon className="w-5 h-5 mr-3" />
                    Hook Generator
                </NavLink>
                <NavLink 
                    to="/app/script-generator" 
                    className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
                >
                    <ScriptIcon className="w-5 h-5 mr-3" />
                    Script Generator
                </NavLink>
                <NavLink 
                    to="/app/thumbnail-generator" 
                    className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
                >
                    <ImageIcon className="w-5 h-5 mr-3" />
                    Thumbnail Generator
                </NavLink>
                <NavLink 
                    to="/app/youtube-optimizer" 
                    className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
                >
                    <YoutubeIcon className="w-5 h-5 mr-3" />
                    YouTube Optimizer
                </NavLink>
                <NavLink 
                    to="/app/prompt-generator" 
                    className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
                >
                    <TerminalIcon className="w-5 h-5 mr-3" />
                    Prompt Generator
                </NavLink>

                <div className="flex-1"></div>
                
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 mt-2 space-y-2">
                     <NavLink 
                        to="/app/settings" 
                        className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
                    >
                        <SettingsIcon className="w-5 h-5 mr-3" />
                        Pengaturan API
                    </NavLink>
                    
                    <button 
                        type="button"
                        onClick={handleLogout}
                        className={`${linkClasses} w-full text-left text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20`}
                    >
                        <LogOutIcon className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;
