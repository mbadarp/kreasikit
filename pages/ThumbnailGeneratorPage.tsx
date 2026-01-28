
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { ThumbnailFormState, ThumbnailGenerationResult } from '../types';
import { DEFAULT_THUMBNAIL_FORM_STATE, THUMBNAIL_ORIENTATIONS, THUMBNAIL_STYLES, YOUTUBE_LANGUAGES } from '../constants';
import { generateThumbnails } from '../services/geminiService';

import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import Toggle from '../components/ui/Toggle';
import { ImageIcon } from '../components/icons/ImageIcon';
import { DownloadIcon } from '../components/icons/DownloadIcon';
import { ZapIcon } from '../components/icons/ZapIcon';

const ThumbnailGeneratorPage: React.FC = () => {
    const [formState, setFormState] = useState<ThumbnailFormState>(DEFAULT_THUMBNAIL_FORM_STATE);
    const [results, setResults] = useState<ThumbnailGenerationResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error("Ukuran gambar maksimal 5MB");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setFormState(prev => ({ ...prev, referenceImage: base64String }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setFormState(prev => ({ ...prev, referenceImage: undefined }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.description.trim()) {
            toast.error('Deskripsi thumbnail wajib diisi.');
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading('Sedang menggambar 3 opsi thumbnail...');

        try {
            const data = await generateThumbnails(formState);
            setResults(data);
            toast.success('Thumbnail berhasil dibuat!', { id: toastId });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Gagal membuat thumbnail.', { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    const downloadImage = (base64Data: string, index: number) => {
        const link = document.createElement('a');
        link.href = base64Data;
        link.download = `thumbnail_option_${index + 1}_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
            <div className="text-center">
                <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                    <ImageIcon className="w-8 h-8 text-indigo-600" />
                    Thumbnail Generator Pro
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Hasilkan gambar thumbnail nyata dengan AI. Upload foto Anda untuk personalisasi karakter.
                </p>
            </div>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                            label="Format / Orientasi"
                            name="orientation"
                            value={formState.orientation}
                            options={THUMBNAIL_ORIENTATIONS}
                            onChange={handleChange}
                        />
                        <div className="space-y-2">
                            <Select
                                label="Gaya Visual"
                                name="style"
                                value={formState.style}
                                options={THUMBNAIL_STYLES}
                                onChange={handleChange}
                            />
                            {formState.style === 'others' && (
                                <Input
                                    label="Gaya Kustom"
                                    name="style_other"
                                    value={formState.style_other || ''}
                                    onChange={handleChange}
                                    placeholder="cth: Cyberpunk Neon"
                                />
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Deskripsi Visual Thumbnail
                        </label>
                        <textarea
                            name="description"
                            rows={4}
                            className="block w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"
                            placeholder="Jelaskan suasana, objek utama, latar belakang, dan ekspresi yang diinginkan..."
                            value={formState.description}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Character Upload Section */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-4 border border-dashed border-gray-300 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Foto Karakter / Wajah (Opsional)
                            </label>
                            {formState.referenceImage && (
                                <button 
                                    type="button" 
                                    onClick={removeImage}
                                    className="text-xs text-red-600 hover:text-red-800"
                                >
                                    Hapus Foto
                                </button>
                            )}
                        </div>
                        
                        {!formState.referenceImage ? (
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                        ) : (
                            <div className="flex items-center gap-4">
                                <img 
                                    src={formState.referenceImage} 
                                    alt="Preview" 
                                    className="h-20 w-20 object-cover rounded-md border border-gray-200"
                                />
                                <span className="text-sm text-green-600 font-medium">Foto berhasil diunggah. AI akan menggunakan wajah ini.</span>
                            </div>
                        )}
                        <p className="text-xs text-gray-500">
                            Upload foto selfie atau karakter untuk dimasukkan ke dalam thumbnail. (Max 5MB)
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                         <Select
                            label="Bahasa Teks (Jika ada)"
                            name="language"
                            value={formState.language}
                            options={YOUTUBE_LANGUAGES}
                            onChange={handleChange}
                        />
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-3 rounded-lg mt-6 md:mt-0">
                             <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tambahkan Teks di Gambar?</span>
                             <Toggle
                                label=""
                                enabled={formState.include_text}
                                setEnabled={(val) => setFormState(prev => ({ ...prev, include_text: val }))}
                            />
                        </div>
                    </div>

                    <Button type="submit" size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
                        <ZapIcon className="w-5 h-5 mr-2" />
                        {isLoading ? 'Sedang Menggambar (Proses ~10-20 detik)...' : 'Buat 3 Opsi Thumbnail'}
                    </Button>
                </form>
            </Card>

            {results && results.images.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.images.map((imgSrc, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
                            <div className="bg-gray-100 dark:bg-gray-900 aspect-video flex items-center justify-center overflow-hidden">
                                <img src={imgSrc} alt={`Thumbnail Option ${idx + 1}`} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-4 flex flex-col gap-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white">Opsi {idx + 1}</h3>
                                <Button size="sm" variant="secondary" onClick={() => downloadImage(imgSrc, idx)}>
                                    <DownloadIcon className="w-4 h-4 mr-2" /> Download Gambar
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ThumbnailGeneratorPage;
