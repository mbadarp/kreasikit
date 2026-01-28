
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoginModal from '../components/auth/LoginModal';
import { useAuth } from '../contexts/AuthContext';

const LandingPage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const navigate = useNavigate();

    const handleCTAClick = () => {
        if (isAuthenticated) {
            navigate('/app/idea-generator');
        } else {
            setIsLoginOpen(true);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Header />
            <main className="flex-grow container mx-auto px-4">
                <div className="text-center py-16 md:py-24">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        Wujudkan Ide Konten Terbaikmu. <br />
                        <span className="text-primary-600 dark:text-primary-400">Dengan Bantuan AI.</span>
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
                        KreasiKit adalah toolkit AI untuk kreator. Mulai dari menghasilkan ide, menulis skrip, hingga merencanakan konten, semua jadi lebih cepat dan cerdas.
                    </p>
                    <div className="mt-10">
                        <Button size="lg" onClick={handleCTAClick}>
                            {isAuthenticated ? 'Masuk ke Dashboard' : 'Login KreasiKit'}
                        </Button>
                    </div>
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-left">
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Generator Ide Cerdas</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Dapatkan ide super spesifik yang menjawab masalah audiens Anda, bukan cuma topik umum.</p>
                        </div>
                         <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Penulis Skrip Otomatis</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Ubah ide menjadi skrip video atau artikel lengkap dengan satu klik. Hemat waktu riset dan penulisan.</p>
                        </div>
                         <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analisis & Skor</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Setiap ide diberi skor potensi agar Anda bisa fokus pada konten yang paling menjanjikan.</p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        </div>
    );
};

export default LandingPage;