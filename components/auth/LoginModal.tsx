
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { XIcon } from '../icons/XIcon';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    const [code, setCode] = useState('');
    const { login, isLoading } = useAuth();
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) {
            toast.error("Silakan masukkan kode akses.");
            return;
        }

        try {
            const success = await login(code);
            if (success) {
                toast.success("Login berhasil! Selamat datang.");
                onClose();
                navigate('/app/idea-generator');
            } else {
                toast.error("Kode akses tidak valid atau tidak ditemukan.");
            }
        } catch (error) {
            toast.error("Gagal verifikasi. Periksa koneksi internet Anda.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 relative">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <XIcon className="w-6 h-6" />
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Login KreasiKit</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Masukkan kode akses Anda untuk menggunakan aplikasi.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input 
                        label="Kode Akses"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Masukkan kode unik..."
                        autoFocus
                    />
                    
                    <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isLoading}
                    >
                        {isLoading ? 'Memverifikasi...' : 'Masuk Aplikasi'}
                    </Button>
                </form>

                <div className="mt-4 text-center text-xs text-gray-400">
                    <p>Dapatkan kode melalui admin.</p>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
