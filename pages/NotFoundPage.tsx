
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center flex-grow flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400">404</h1>
        <h2 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">Halaman Tidak Ditemukan</h2>
        <p className="mt-4 text-gray-600 dark:text-gray-300">Maaf, kami tidak dapat menemukan halaman yang Anda cari.</p>
        <div className="mt-6">
          <Link to="/app">
            <Button>Kembali ke Dashboard</Button>
          </Link>
        </div>
      </div>
      <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400 pb-6">
          &copy; 2026. Kreasikit v1.2 by Badar Cara Pamungkas
      </div>
    </div>
  );
};

export default NotFoundPage;
