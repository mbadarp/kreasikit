
import React from 'react';
import { useLocation } from 'react-router-dom';
import { MenuIcon } from '../icons/MenuIcon';

const getTitle = (pathname: string): string => {
    if (pathname.includes('/idea-generator')) return 'Generator Ide';
    if (pathname.includes('/results')) return 'Hasil Ide';
    if (pathname.includes('/hook-generator')) return 'Hook Generator';
    if (pathname.includes('/script-generator')) return 'Script Generator';
    if (pathname.includes('/youtube-optimizer')) return 'YouTube Optimizer';
    if (pathname.includes('/prompt-generator')) return 'Prompt Generator';
    if (pathname.includes('/thumbnail-generator')) return 'Thumbnail Generator';
    if (pathname.includes('/settings')) return 'Pengaturan API';
    return 'Generator Ide';
};

interface DashboardHeaderProps {
    onMenuClick: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onMenuClick }) => {
    const location = useLocation();
    const title = getTitle(location.pathname);

    return (
        <header className="h-16 flex-shrink-0 bg-white dark:bg-gray-800/50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-6 md:px-8">
            <div className="flex items-center">
                 <button 
                    onClick={onMenuClick}
                    className="md:hidden mr-4 p-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    aria-label="Buka menu"
                >
                    <MenuIcon className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>
            </div>
        </header>
    );
};

export default DashboardHeader;
