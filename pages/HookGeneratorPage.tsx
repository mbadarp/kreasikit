
import React, { useState } from 'react';
import toast from 'react-hot-toast';

import { HookGenerateFormState, HookGenerationResult, GeneratedHook } from '../types';
import { DEFAULT_HOOK_FORM_STATE, YOUTUBE_LANGUAGES } from '../constants';
import { generateHooks } from '../services/geminiService';

import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import { ZapIcon } from '../components/icons/ZapIcon';
import { DownloadIcon } from '../components/icons/DownloadIcon';
import { CopyIcon } from '../components/icons/CopyIcon';

const HookGeneratorPage: React.FC = () => {
    const [formState, setFormState] = useState<HookGenerateFormState>(DEFAULT_HOOK_FORM_STATE);
    const [results, setResults] = useState<HookGenerationResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.script.trim()) {
            toast.error('Deskripsi konten tidak boleh kosong.');
            return;
        }
        setIsLoading(true);
        const toastId = toast.loading('Sedang menghasilkan 12 jenis hook...');
        
        try {
            const generatedHooks = await generateHooks(formState);
            setResults(generatedHooks);
            toast.success('Hook berhasil dibuat!', { id: toastId });
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
    
    const downloadAllHooksAsDoc = () => {
        if (!results) {
            toast.error("Tidak ada hasil untuk diunduh.");
            return;
        }

        const escapeHTML = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
        const guideTitle = "Hasil Generate Hook oleh KreasiKit";

        const toneDisplay = formState.tone.trim() || 'Default (Bahasa sehari-hari)';

        let htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>${guideTitle}</title></head>
        <body>
            <h1>${guideTitle}</h1>
            <p>Dihasilkan untuk deskripsi: <i>"${escapeHTML(formState.script)}"</i></p>
            <p>Tone: ${escapeHTML(toneDisplay)} | Bahasa: ${formState.outputLanguage}</p>
        `;

        results.hooks.forEach(hook => {
            htmlContent += `
                <hr />
                <h2>${escapeHTML(hook.framework)}</h2>
                <p><b>Visual Hook (Teks di Layar):</b> ${escapeHTML(hook.visual_hook)}</p>
                <p><b>Voice Over Hook (Yang Diucapkan):</b> "${escapeHTML(hook.voice_over_hook)}"</p>
                <br />
            `;
        });

        htmlContent += "</body></html>";
        
        const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hasil_hook_kreasikit_${Date.now()}.doc`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Semua hook berhasil diunduh!");
    };


    const downloadHookGuide = () => {
        const guideTitle = "Panduan 12 Framework Hook Psikologis";
        let htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>${guideTitle}</title></head>
        <body>
            <h1>${guideTitle}</h1>
            <p>Gunakan framework ini untuk menciptakan hook yang kuat dan relevan dengan konten Anda.</p>
            
            <h3>1. FEAR-BASED HOOK (Hook Ketakutan)</h3>
            <p><b>Pemicu Psikologis:</b> Menghindari kerugian (Loss Aversion), takut ketinggalan (FOMO), konsekuensi dari tidak bertindak.</p>
            <p><b>Kapan Digunakan:</b> Saat ingin menyoroti risiko atau kesalahan yang bisa dihindari audiens. Sangat efektif untuk konten edukasi di niche kesehatan, keuangan, atau produktivitas.</p>

            <h3>2. WAKE-UP CALL HOOK (Tamparan Realita)</h3>
            <p><b>Pemicu Psikologis:</b> Disonansi kognitif (perbedaan antara keyakinan dan realita), kebenaran yang pahit.</p>
            <p><b>Kapan Digunakan:</b> Saat ingin menantang alasan atau keyakinan umum yang salah di kalangan audiens Anda. Menciptakan momen "Aha!" yang membuat audiens sadar.</p>

            <h3>3. URGENCY/TIME HOOK (Hook Urgensi Waktu)</h3>
            <p><b>Pemicu Psikologis:</b> Kelangkaan (Scarcity), tekanan waktu, FOMO.</p>
            <p><b>Kapan Digunakan:</b> Untuk konten yang relevan dengan waktu tertentu (misal: akhir tahun, tren baru), atau untuk mendorong tindakan segera.</p>
            
            <h3>4. CURIOSITY/MYSTERY HOOK (Hook Penasaran)</h3>
            <p><b>Pemicu Psikologis:</b> Kesenjangan informasi (Information Gap), misteri, kebutuhan untuk mengetahui.</p>
            <p><b>Kapan Digunakan:</b> Hampir di semua jenis konten. Manusia secara alami ingin menutup "lingkaran informasi" yang terbuka. Janjikan informasi rahasia atau sudut pandang yang tidak terduga.</p>

            <h3>5. VALUE/PROMISE HOOK (Hook Janji Nilai)</h3>
            <p><b>Pemicu Psikologis:</b> Orientasi pada manfaat, proposisi nilai yang jelas, imbalan.</p>
            <p><b>Kapan Digunakan:</b> Untuk konten tutorial, tips, atau life-hack. Berikan janji hasil yang jelas dan spesifik di awal.</p>

            <h3>6. RELATABLE/EMPATHY HOOK (Hook Relatable)</h3>
            <p><b>Pemicu Psikologis:</b> Identifikasi, perasaan "ini gue banget", koneksi emosional, validasi.</p>
            <p><b>Kapan Digunakan:</b> Saat ingin membangun komunitas dan koneksi emosional. Tunjukkan bahwa Anda memahami masalah dan perasaan audiens.</p>

            <h3>7. STORYTELLING/PERSONAL JOURNEY HOOK (Hook Cerita)</h3>
            <p><b>Pemicu Psikologis:</b> Rasa penasaran naratif, transformasi, sebelum-sesudah.</p>
            <p><b>Kapan Digunakan:</b> Untuk membangun personal brand dan otoritas. Cerita transformasi (dari gagal menjadi berhasil) sangat menarik.</p>

            <h3>8. QUESTION HOOK (Hook Pertanyaan)</h3>
            <p><b>Pemicu Psikologis:</b> Keterlibatan mental, refleksi diri.</p>
            <p><b>Kapan Digunakan:</b> Untuk memancing interaksi dan membuat audiens secara aktif memikirkan topik Anda. Ajukan pertanyaan yang tidak bisa dijawab dengan "ya/tidak" sederhana.</p>

            <h3>9. NEGATIVITY/CONTRARIAN HOOK (Hook Negatif/Kontra)</h3>
            <p><b>Pemicu Psikologis:</b> Interupsi pola, menantang norma, kontroversi.</p>
            <p><b>Kapan Digunakan:</b> Saat Anda memiliki opini kuat yang berlawanan dengan mayoritas. Ini adalah cara cepat untuk mendapatkan perhatian, tapi pastikan Anda punya argumen yang kuat.</p>

            <h3>10. CALL-OUT HOOK (Hook Panggilan Langsung)</h3>
            <p><b>Pemicu Psikologis:</b> Ansprache langsung, pengakuan personal.</p>
            <p><b>Kapan Digunakan:</b> Saat Anda menargetkan segmen audiens yang sangat spesifik. Membuat mereka merasa konten itu dibuat khusus untuk mereka.</p>

            <h3>11. LIST/NUMBERED HOOK (Hook Daftar/Angka)</h3>
            <p><b>Pemicu Psikologis:</b> Ekspektasi struktur, kelengkapan, kemudahan mencerna informasi.</p>
            <p><b>Kapan Digunakan:</b> Untuk konten listicle (misal: "5 Cara...", "3 Kesalahan..."). Angka memberikan kejelasan dan struktur yang disukai otak.</p>

            <h3>12. TREND HOOK (Hook Tren)</h3>
            <p><b>Pemicu Psikologis:</b> FOMO, bukti sosial (social proof), relevansi.</p>
            <p><b>Kapan Digunakan:</b> Untuk menunggangi topik atau suara yang sedang viral. Ini menunjukkan bahwa konten Anda relevan dan up-to-date.</p>

        </body></html>
        `;

        const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${guideTitle}.doc`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Panduan berhasil diunduh!");
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hook Generator Pro</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Hasilkan 12 jenis hook psikologis untuk menghentikan scroll audiens Anda.</p>
            </div>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="script" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi Konten / Script (Wajib)</label>
                        <textarea
                            id="script" name="script" rows={6}
                            className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-white"
                            placeholder="Contoh: Video ini akan menjelaskan 3 kesalahan umum saat public speaking dan cara mengatasinya."
                            value={formState.script} onChange={handleChange}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input 
                            label="Tone / Gaya Bahasa (Opsional)" 
                            name="tone" 
                            value={formState.tone} 
                            onChange={handleChange} 
                            placeholder="cth: Kasual, Dramatis (Default: Bahasa sehari-hari)" 
                        />
                        <Select label="Bahasa Output" name="outputLanguage" value={formState.outputLanguage} options={YOUTUBE_LANGUAGES} onChange={handleChange} />
                    </div>
                    <div className="mt-6 border-t pt-6 flex flex-col sm:flex-row gap-4">
                        <Button type="submit" size="lg" className="w-full sm:w-auto flex-grow" disabled={isLoading}>
                            <ZapIcon className="w-5 h-5 mr-2" />
                            {isLoading ? 'Menghasilkan...' : 'Generate Hooks'}
                        </Button>
                        <Button type="button" variant="secondary" size="lg" onClick={downloadHookGuide}>
                            <DownloadIcon className="w-5 h-5 mr-2" />
                            Download Panduan Hook
                        </Button>
                    </div>
                </form>
            </Card>

            {results && (
                <div className="space-y-6">
                    <Card>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Hasil Generate</h2>
                            <Button size="sm" variant="secondary" onClick={downloadAllHooksAsDoc}>
                                <DownloadIcon className="w-4 h-4 mr-2" />
                                Download Semua Hook
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {results.hooks.map((hook, idx) => <GeneratedHookCard key={idx} hook={hook} onCopy={copyToClipboard} />)}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

const GeneratedHookCard: React.FC<{ hook: GeneratedHook; onCopy: (text: string, type: string) => void }> = ({ hook, onCopy }) => (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col space-y-4">
        <h3 className="font-bold text-gray-800 dark:text-gray-100">{hook.framework}</h3>
        
        {/* Visual Hook */}
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-xs font-semibold uppercase text-gray-500">VISUAL HOOK</span>
                <Button variant="ghost" size="sm" onClick={() => onCopy(hook.visual_hook, 'Visual hook')} aria-label="Salin visual hook" className="p-1 h-auto">
                    <CopyIcon className="w-4 h-4" />
                </Button>
            </div>
            <p className="font-semibold text-base text-gray-800 dark:text-gray-200 bg-primary-100 dark:bg-primary-900/40 p-2 rounded-md">
                {hook.visual_hook}
            </p>
        </div>

        {/* Voice Over Hook */}
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-xs font-semibold uppercase text-gray-500">VOICE OVER HOOK</span>
                <Button variant="ghost" size="sm" onClick={() => onCopy(hook.voice_over_hook, 'Voice over hook')} aria-label="Salin voice over hook" className="p-1 h-auto">
                    <CopyIcon className="w-4 h-4" />
                </Button>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
                "{hook.voice_over_hook}"
            </p>
        </div>
    </div>
);


export default HookGeneratorPage;