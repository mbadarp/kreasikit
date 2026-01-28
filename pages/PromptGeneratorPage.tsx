
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { PromptFormState } from '../types';
import { generateDetailedPrompt } from '../services/geminiService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ZapIcon } from '../components/icons/ZapIcon';
import { CopyIcon } from '../components/icons/CopyIcon';
import { TerminalIcon } from '../components/icons/TerminalIcon';

const PromptGeneratorPage: React.FC = () => {
    const [formState, setFormState] = useState<PromptFormState>({
        userInput: '',
    });
    const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.userInput.trim()) {
            toast.error('Harap isi kebutuhan prompt Anda.');
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading('Arsitek prompt sedang bekerja...');

        try {
            const prompt = await generateDetailedPrompt(formState);
            setGeneratedPrompt(prompt);
            toast.success('Prompt berhasil dihasilkan!', { id: toastId });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Gagal menghasilkan prompt.', { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!generatedPrompt) return;
        navigator.clipboard.writeText(generatedPrompt);
        toast.success('Prompt disalin ke clipboard!');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div className="text-center">
                <h1 className="text-3xl font-bold flex items-center justify-center gap-2 text-gray-900 dark:text-white">
                    <TerminalIcon className="w-8 h-8 text-primary-600" />
                    Prompt Generator
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Ubah ide sederhana menjadi instruksi AI yang detail, terstruktur, dan minim halusinasi.
                </p>
            </div>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="userInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Deskripsikan kebutuhan prompt Anda
                        </label>
                        <textarea
                            id="userInput"
                            rows={4}
                            className="block w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Contoh: Saya butuh prompt untuk menganalisis laporan keuangan perusahaan startup dan memberikan insight investasi."
                            value={formState.userInput}
                            onChange={(e) => setFormState({ userInput: e.target.value })}
                        />
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Semakin detail deskripsi Anda, semakin akurat prompt yang dihasilkan.
                        </p>
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                        <ZapIcon className="w-5 h-5 mr-2" />
                        {isLoading ? 'Sedang Memproses...' : 'Hasilkan Prompt'}
                    </Button>
                </form>
            </Card>

            {generatedPrompt && (
                <Card className="border-2 border-primary-500/20">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Hasil Prompt</h2>
                        <Button variant="secondary" size="sm" onClick={copyToClipboard}>
                            <CopyIcon className="w-4 h-4 mr-2" />
                            Salin Prompt
                        </Button>
                    </div>
                    <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200 leading-relaxed">
                                {generatedPrompt}
                            </pre>
                        </div>
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start gap-3">
                        <div className="text-blue-500 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            <strong>Tip:</strong> Anda bisa langsung menyalin output di atas dan menempelkannya ke aplikasi LLM seperti ChatGPT, Gemini, atau Claude.
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default PromptGeneratorPage;