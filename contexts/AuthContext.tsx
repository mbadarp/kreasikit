
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ID Spreadsheet yang diberikan
const SPREADSHEET_ID = '1keypgQEwd_OdW7OLJSRRD-vqFKnQGjpLH8ZNrrn6pY0';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv`;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Cek session saat pertama kali load
    useEffect(() => {
        const session = localStorage.getItem('kreasikit_auth_session');
        if (session === 'active') {
            setIsAuthenticated(true);
        }
    }, []);

    const login = useCallback(async (inputCode: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            // Fetch data dari Google Sheets
            const response = await fetch(CSV_URL);
            if (!response.ok) {
                throw new Error('Gagal menghubungkan ke database kode akses.');
            }
            const csvText = await response.text();
            
            // Parsing CSV sederhana
            // Kita asumsikan ada kolom "kode akses" atau kita cari match di seluruh data
            const rows = csvText.split('\n');
            const validCodes = new Set<string>();

            rows.forEach(row => {
                // Split by comma, remove quotes if exists, trim whitespace
                const cells = row.split(',').map(cell => cell.replace(/^"|"$/g, '').trim());
                cells.forEach(cell => {
                    if (cell) validCodes.add(cell);
                });
            });

            // Validasi Kode (Case sensitive bisa disesuaikan, saat ini exact match)
            if (validCodes.has(inputCode.trim())) {
                localStorage.setItem('kreasikit_auth_session', 'active');
                setIsAuthenticated(true);
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error("Login Error:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('kreasikit_auth_session');
        setIsAuthenticated(false);
    }, []);

    const value = useMemo(() => ({
        isAuthenticated,
        login,
        logout,
        isLoading
    }), [isAuthenticated, login, logout, isLoading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
