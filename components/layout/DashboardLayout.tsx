
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';

const DashboardLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
            {/* Static sidebar for desktop */}
            <Sidebar className="hidden md:flex" />

            {/* Mobile sidebar overlay */}
            {isSidebarOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black/50 z-30" 
                    onClick={() => setIsSidebarOpen(false)}
                    aria-hidden="true"
                ></div>
            )}
            <div className={`md:hidden fixed inset-y-0 left-0 z-40 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
               <Sidebar className="flex" />
            </div>

            <div className="flex flex-col flex-1">
                <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
                    <Outlet />
                    <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
                        &copy; 2026. Kreasikit v1.2 by Badar Cara Pamungkas
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
