
import React, { useState } from 'react';
import toast from 'react-hot-toast';

import { YoutubeOptimizerFormState, YoutubeOptimizerResult } from '../types';
import { DEFAULT_YOUTUBE_OPTIMIZER_FORM_STATE, YOUTUBE_LANGUAGES } from '../constants';
import { generateYoutubeOptimization } from '../services/geminiService';

import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { ZapIcon } from '../components/icons/ZapIcon';
import { CopyIcon } from '../components/icons/CopyIcon';
import { YoutubeIcon } from '../components/icons/YoutubeIcon';
import { DownloadIcon } from '../components/icons/DownloadIcon';

const YoutubeOptimizerPage: React.FC = () => {
    const [formState, setFormState] = useState<YoutubeOptimizerFormState>(DEFAULT_YOUTUBE_OPTIMIZER_FORM_STATE);
    const [results, setResults] = useState<YoutubeOptimizerResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.contentInput.trim()) {
            toast.error('Harap masukkan ide, skrip, atau referensi konten Anda.');
            return;
        }
        setIsLoading(true);
        setResults(null);
        const toastId = toast.loading('Mengoptimalkan konten YouTube Anda...');
        
        try {
            const optimizationResults = await generateYoutubeOptimization(formState);
            setResults(optimizationResults);
            toast.success('Optimasi berhasil dibuat!', { id: toastId });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan.', { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${type} disalin!`);
    };

    const handleDownloadTxt = () => {
        if (!results) {
            toast.error("Tidak ada hasil untuk diunduh.");
            return;
        }

        const content = `
YOUTUBE OPTIMIZATION RESULT
===========================

[ANALISIS KONTEN]
${results.analysis}

[STRATEGI JUDUL]
${results.titleStrategy}

[OPSI JUDUL VIDEO (10 Variasi Formula)]
${results.titles.map((t, i) => `${i+1}. ${t}`).join('\n')}

[DESKRIPSI VIDEO]
${results.description}

[REKOMENDASI HASHTAG]
Tier 1 (Specific): ${results.hashtags.tier1.join(' ')}
Tier 2 (Broad): ${results.hashtags.tier2.join(' ')}
Tier 3 (Viral): ${results.hashtags.tier3.join(' ')}

[TAG VIDEO (Maks 500 Karakter)]
${results.tags}
        `.trim();

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `youtube_optimization_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("File .txt berhasil diunduh!");
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div className="text-center">
                <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                    <YoutubeIcon className="w-8 h-8 text-red-600" />
                    YouTube Optimizer
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Hasilkan judul, deskripsi, hashtag, dan tag berperforma tinggi untuk video Anda.
                </p>
            </div>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="contentInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Input Ide, Script, atau Referensi Konten
                        </label>
                        <textarea
                            id="contentInput"
                            name="contentInput"
                            rows={8}
                            className="block w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 text-base"
                            placeholder="Tempelkan ide konten, skrip video, atau artikel referensi Anda di sini..."
                            value={formState.contentInput}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <Select
                        label="Bahasa Output"
                        name="outputLanguage"
                        value={formState.outputLanguage}
                        options={YOUTUBE_LANGUAGES}
                        onChange={handleChange}
                    />

                    <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                        <ZapIcon className="w-5 h-5 mr-2" />
                        {isLoading ? 'Sedang Menganalisis...' : 'Optimalkan Sekarang'}
                    </Button>
                </form>
            </Card>

            {isLoading && (
                 <Card className="text-center py-10">
                    <div className="animate-pulse">
                        <YoutubeIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-gray-500">Menganalisis konten dan menyusun strategi...</p>
                    </div>
                </Card>
            )}

            {results && (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <Button variant="secondary" onClick={handleDownloadTxt}>
                            <DownloadIcon className="w-4 h-4 mr-2" />
                            Download Hasil (.txt)
                        </Button>
                    </div>

                    <ResultCard title="Analisis Konten" onCopy={() => copyToClipboard(results.analysis, 'Analisis')}>
                        <p className="text-gray-700 dark:text-gray-300">{results.analysis}</p>
                    </ResultCard>

                    <ResultCard title="10 Opsi Judul Video" onCopy={() => copyToClipboard(results.titles.join('\n'), 'Semua judul')}>
                        <ol className="list-decimal list-inside space-y-2 text-gray-800 dark:text-gray-200">
                            {results.titles.map((title, index) => <li key={index}>{title}</li>)}
                        </ol>
                         <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <h4 className="font-semibold text-blue-800 dark:text-blue-200">Strategi Judul</h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{results.titleStrategy}</p>
                        </div>
                    </ResultCard>

                    <ResultCard title="Deskripsi Video Optimal" onCopy={() => copyToClipboard(results.description, 'Deskripsi')}>
                        <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded-md border border-gray-200 dark:border-gray-700 leading-relaxed">
                            {results.description}
                        </pre>
                    </ResultCard>
                    
                     <ResultCard title="Rekomendasi Hashtag" onCopy={() => {
                         const allHashtags = [
                             ...results.hashtags.tier1,
                             ...results.hashtags.tier2,
                             ...results.hashtags.tier3
                         ].join(' ');
                         copyToClipboard(allHashtags, 'Semua Hashtag');
                     }}>
                         <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 mb-1">TIER 1: Specific / Niche</h4>
                                <div className="flex flex-wrap gap-2">
                                    {results.hashtags.tier1.map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md">{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 mb-1">TIER 2: Broad / Category</h4>
                                <div className="flex flex-wrap gap-2">
                                    {results.hashtags.tier2.map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-md">{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 mb-1">TIER 3: Viral / Trending</h4>
                                <div className="flex flex-wrap gap-2">
                                    {results.hashtags.tier3.map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded-md">{tag}</span>
                                    ))}
                                </div>
                            </div>
                         </div>
                    </ResultCard>

                    <ResultCard title="Tag Video (Mendekati 500 Karakter)" onCopy={() => copyToClipboard(results.tags, 'Tag')}>
                         <textarea
                            readOnly
                            rows={5}
                            className="block w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded-md text-sm font-mono"
                            value={results.tags}
                        />
                        <p className="text-xs text-right mt-1 text-gray-500">{results.tags.length} / 500 karakter</p>
                    </ResultCard>
                </div>
            )}
        </div>
    );
};

const ResultCard: React.FC<{title: string; onCopy: () => void; children: React.ReactNode}> = ({ title, onCopy, children }) => (
    <Card>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <Button variant="secondary" size="sm" onClick={onCopy}>
                <CopyIcon className="w-4 h-4 mr-2" />
                Salin
            </Button>
        </div>
        <div>{children}</div>
    </Card>
);

export default YoutubeOptimizerPage;
