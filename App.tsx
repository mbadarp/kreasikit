
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { Idea, GenerateFormState, IdeaRequest, ScriptHistoryItem } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import LandingPage from './pages/LandingPage';
import GeneratePage from './pages/GeneratePage';
import HookGeneratorPage from './pages/HookGeneratorPage';
import ScriptGeneratorPage from './pages/ScriptGeneratorPage';
import PromptGeneratorPage from './pages/PromptGeneratorPage';
import YoutubeOptimizerPage from './pages/YoutubeOptimizerPage';
import ThumbnailGeneratorPage from './pages/ThumbnailGeneratorPage';
import SettingsPage from './pages/SettingsPage';
import ResultsPage from './pages/ResultsPage';
import NotFoundPage from './pages/NotFoundPage';
import DashboardLayout from './components/layout/DashboardLayout';

// Komponen untuk memproteksi rute
const ProtectedRoute = () => {
    const { isAuthenticated } = useAuth();
    
    // Jika tidak authenticated, redirect ke Landing Page
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

const AppContent: React.FC = () => {
    const [ideaRequests, setIdeaRequests] = useState<Record<string, IdeaRequest>>({});
    const [scriptHistory, setScriptHistory] = useLocalStorage<ScriptHistoryItem[]>('kreasikit_script_history', []);

    const handleNewIdeas = (requestId: string, input: GenerateFormState, ideas: Idea[]) => {
        setIdeaRequests(prev => ({
            ...prev,
            [requestId]: { id: requestId, input, ideas, createdAt: new Date() }
        }));
    };

    const handleNewScript = (newItem: ScriptHistoryItem) => {
        setScriptHistory(prev => [newItem, ...prev].slice(0, 10)); // Keep last 10
    };

    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            
            {/* Protected Dashboard routes */}
            <Route element={<ProtectedRoute />}>
                <Route path="/app" element={<DashboardLayout />}>
                    <Route index element={<Navigate to="/app/idea-generator" replace />} />
                    <Route path="idea-generator" element={<GeneratePage onIdeasGenerated={handleNewIdeas} />} />
                    <Route path="hook-generator" element={<HookGeneratorPage />} />
                    <Route 
                        path="script-generator" 
                        element={<ScriptGeneratorPage scriptHistory={scriptHistory} onNewScript={handleNewScript} />} 
                    />
                    <Route path="youtube-optimizer" element={<YoutubeOptimizerPage />} />
                    <Route path="prompt-generator" element={<PromptGeneratorPage />} />
                    <Route path="thumbnail-generator" element={<ThumbnailGeneratorPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="results/:requestId" element={<ResultsPage ideaRequests={ideaRequests} />} />
                </Route>
            </Route>
            
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <HashRouter>
                <AppContent />
                <Toaster position="bottom-right" toastOptions={{
                    className: 'dark:bg-gray-700 dark:text-white',
                }}/>
            </HashRouter>
        </AuthProvider>
    );
};

export default App;
