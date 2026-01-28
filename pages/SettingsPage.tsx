
import React from 'react';
import toast from 'react-hot-toast';
import useLocalStorage from '../hooks/useLocalStorage';
import { ApiConfig, ApiProvider } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { SettingsIcon } from '../components/icons/SettingsIcon';

const SettingsPage: React.FC = () => {
    const [config, setConfig] = useLocalStorage<ApiConfig>('kreasikit_api_config', {
        provider: 'app',
        geminiApiKey: '',
        groqApiKey: ''
    });

    const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setConfig(prev => ({ ...prev, provider: e.target.value as ApiProvider }));
    };

    const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (config.provider === 'gemini' && !config.geminiApiKey) {
            toast.error("API Key Gemini wajib diisi jika memilih provider Gemini.");
            return;
        }
        if (config.provider === 'groq' && !config.groqApiKey) {
            toast.error("API Key Groq wajib diisi jika memilih provider Groq.");
            return;
        }

        // Trigger save to local storage (handled by hook, but we can simulate a save action UI)
        // Note: useLocalStorage updates immediately, but we add a toast for feedback.
        toast.success("Pengaturan API berhasil disimpan!");
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold flex items-center justify-center gap-2 text-gray-900 dark:text-white">
                    <SettingsIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
                    Pengaturan API
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Atur koneksi AI yang digunakan aplikasi. Gunakan API Key pribadi Anda jika limit aplikasi tercapai.
                </p>
            </div>

            <Card className="space-y-6">
                <div>
                    <Select
                        label="Pilih Provider AI"
                        name="provider"
                        value={config.provider}
                        options={[
                            { value: 'app', label: 'App API (Default - Gratis)' },
                            { value: 'gemini', label: 'Google Gemini API (Key Pribadi)' },
                            { value: 'groq', label: 'Groq AI (Key Pribadi - Sangat Cepat)' }
                        ]}
                        onChange={handleProviderChange}
                        helperText="Jika 'App API' sering gagal karena limit, gunakan 'Gemini API' dengan key Anda sendiri."
                    />
                </div>

                {config.provider === 'gemini' && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 animate-fade-in">
                        <Input
                            label="Gemini API Key"
                            name="geminiApiKey"
                            type="password"
                            placeholder="AIzaSy..."
                            value={config.geminiApiKey || ''}
                            onChange={handleKeyChange}
                            helperText="Dapatkan key gratis di aistudio.google.com"
                        />
                         <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
                            Provider ini mendukung semua fitur termasuk <strong>Thumbnail Generator (Gambar)</strong>.
                        </p>
                    </div>
                )}

                {config.provider === 'groq' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-800">
                            <Input
                                label="Groq API Key (Untuk Teks)"
                                name="groqApiKey"
                                type="password"
                                placeholder="gsk_..."
                                value={config.groqApiKey || ''}
                                onChange={handleKeyChange}
                                helperText="Dapatkan key di console.groq.com"
                            />
                            <p className="text-xs text-orange-600 dark:text-orange-300 mt-2">
                                <strong>Info:</strong> Groq sangat cepat untuk teks (Script, Ide, Hook, dll).
                            </p>
                        </div>
                        
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
                             <Input
                                label="Gemini API Key (Opsional: Fallback untuk Gambar)"
                                name="geminiApiKey"
                                type="password"
                                placeholder="AIzaSy..."
                                value={config.geminiApiKey || ''}
                                onChange={handleKeyChange}
                                helperText="Diperlukan karena Groq TIDAK BISA membuat gambar (Thumbnail)."
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Jika kosong, Thumbnail Generator akan mencoba menggunakan kuota Gratis Aplikasi (mungkin terbatas).
                            </p>
                        </div>
                    </div>
                )}

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <Button onClick={handleSave}>
                        Simpan Pengaturan
                    </Button>
                </div>
            </Card>

            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                <h3 className="font-bold mb-2 text-gray-900 dark:text-white">Info Privasi:</h3>
                <ul className="list-disc list-inside space-y-1">
                    <li>API Key Anda disimpan secara lokal di browser (Local Storage).</li>
                    <li>Key tidak pernah dikirim ke server kami, melainkan langsung ke Google/Groq.</li>
                    <li>Jika Anda menghapus cache browser, pengaturan ini akan hilang.</li>
                </ul>
            </div>
        </div>
    );
};

export default SettingsPage;