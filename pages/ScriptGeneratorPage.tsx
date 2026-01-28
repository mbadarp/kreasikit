
import React, { useState } from 'react';
import toast from 'react-hot-toast';

import { ScriptFormState, GeneratedScript, ScriptHistoryItem } from '../types';
import { DEFAULT_SCRIPT_FORM_STATE, SCRIPT_FORMULAS, SCRIPT_CONTENT_GOALS, SCRIPT_CTA_OPTIONS, AUDIENCE_AWARENESS_LEVELS } from '../constants';
import { generateScriptFromFormula } from '../services/geminiService';

import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import { ZapIcon } from '../components/icons/ZapIcon';
import { CopyIcon } from '../components/icons/CopyIcon';
import { HistoryIcon } from '../components/icons/HistoryIcon';
import { ScriptIcon } from '../components/icons/ScriptIcon';

interface ScriptGeneratorPageProps {
    scriptHistory: ScriptHistoryItem[];
    onNewScript: (item: ScriptHistoryItem) => void;
}

const ScriptGeneratorPage: React.FC<ScriptGeneratorPageProps> = ({ scriptHistory, onNewScript }) => {
    const [formState, setFormState] = useState<ScriptFormState>(DEFAULT_SCRIPT_FORM_STATE);
    const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRevisionLoading, setIsRevisionLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: name === 'duration' ? Number(value) : value }));
    };

    const handleSubmit = async (e?: React.FormEvent, tweak?: string) => {
        e?.preventDefault();
        if (!formState.topic_and_points.trim() || !formState.audience.trim()) {
            toast.error("Harap isi Target Audiens dan Topik & Poin Penting.");
            return;
        }

        const loadingSetter = tweak ? setIsRevisionLoading : setIsLoading;
        loadingSetter(true);
        const toastId = toast.loading(tweak ? `Merevisi script...` : `Membuat script dengan formula ${formState.formula}...`);
        
        try {
            const script = await generateScriptFromFormula(formState, tweak);
            setGeneratedScript(script);
            toast.success('Script berhasil dibuat!', { id: toastId });
            
            if (!tweak) { // Only add to history on initial generation
                onNewScript({
                    id: `script_${Date.now()}`,
                    formula: formState.formula,
                    title: script.title,
                    date: new Date().toISOString(),
                    script: script,
                    formState: formState,
                });
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan.', { id: toastId });
        } finally {
            loadingSetter(false);
        }
    };
    
    const handleQuickEdit = (tweak: string) => {
        if (!generatedScript) {
            toast.error("Generate script terlebih dahulu sebelum revisi.");
            return;
        }
        handleSubmit(undefined, tweak);
    };

    const copyScriptToClipboard = () => {
        if (!generatedScript) return;
        const scriptText = `
Judul: ${generatedScript.title}

Hook: ${generatedScript.hook}

--- SCRIPT BODY ---
${generatedScript.body.map(part => `[${part.stage}]\n${part.content}`).join('\n\n')}

--- CTA ---
${generatedScript.cta}

--- CATATAN DELIVERY ---
${generatedScript.delivery_notes}
        `.trim();
        navigator.clipboard.writeText(scriptText);
        toast.success("Script berhasil disalin!");
    };
    
    const loadFromHistory = (item: ScriptHistoryItem) => {
        setFormState(item.formState);
        setGeneratedScript(item.script);
        toast.success(`Memuat script "${item.title}" dari riwayat.`);
    };

    return (
        <div className="space-y-8">
            {/* Bagian Atas: Form Input Full Width */}
            <form onSubmit={handleSubmit} className="w-full space-y-4">
                <Card>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="md:col-span-2 lg:col-span-3">
                            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">1. Tentukan Pondasi Script</h2>
                        </div>
                        <div>
                            <Select 
                                label="Formula Storytelling"
                                name="formula"
                                value={formState.formula}
                                onChange={handleChange}
                                options={SCRIPT_FORMULAS.map(f => ({ value: f.value, label: f.label }))}
                            />
                             <p className="text-xs text-gray-500 mt-1">{SCRIPT_FORMULAS.find(f => f.value === formState.formula)?.description}</p>
                        </div>
                        <div className="space-y-2">
                             <Select label="Tujuan Konten" name="goal" value={formState.goal} options={SCRIPT_CONTENT_GOALS} onChange={handleChange} />
                             {formState.goal === 'others' && (
                                <Input label="Tujuan Kustom" name="goal_other" value={formState.goal_other || ''} onChange={handleChange} placeholder="cth: Membangun komunitas" required />
                            )}
                        </div>
                         <Input label="Durasi Target (detik)" name="duration" type="number" value={formState.duration} onChange={handleChange} />
                    </div>
                </Card>

                <Card>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">2. Isi Materi Konten</h2>
                            <div className="space-y-4">
                                <Input label="Target Audiens" name="audience" value={formState.audience} onChange={handleChange} placeholder="cth: Ibu bekerja usia 25-35..." helperText="Jelaskan siapa yang Anda ajak bicara."/>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Topik & Poin Penting</label>
                                    <textarea name="topic_and_points" value={formState.topic_and_points} onChange={handleChange} rows={5} className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" placeholder="Topik: Cara konsisten bikin konten&#10;Poin:&#10;- Susah mulai&#10;- Takut jelek&#10;- Tidak punya sistem"/>
                                </div>
                            </div>
                        </div>
                         <div>
                            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">3. Atur Gaya & Penawaran</h2>
                            <div className="space-y-4">
                                <Select label="Kesadaran Audiens" name="awareness" value={formState.awareness} options={AUDIENCE_AWARENESS_LEVELS} onChange={handleChange} />
                                <Input label="Gaya & Persona" name="style_and_persona" value={formState.style_and_persona} onChange={handleChange} placeholder="cth: Santai - Mentor" />
                                <Input label="Produk / Solusi (Opsional)" name="offer" value={formState.offer} onChange={handleChange} placeholder="cth: Kelas online content planning" />
                                <Select label="Call to Action" name="cta" value={formState.cta} options={SCRIPT_CTA_OPTIONS} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                </Card>
                
                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                    <ZapIcon className="w-5 h-5 mr-2" />
                    {isLoading ? 'Menyiapkan Script...' : 'Generate Script'}
                </Button>
            </form>

            {/* Bagian Bawah: Riwayat & Hasil */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                {/* Kiri: Riwayat */}
                <div className="lg:col-span-2">
                    <Card>
                        <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-900 dark:text-white"><HistoryIcon className="w-5 h-5 mr-2" /> Riwayat (10 Terakhir)</h3>
                        {scriptHistory.length > 0 ? (
                            <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
                            {scriptHistory.map(item => (
                                <li key={item.id} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={() => loadFromHistory(item)}>
                                    <p className="font-semibold truncate text-gray-900 dark:text-gray-200">{item.title}</p>
                                    <p className="text-xs text-gray-500">{item.formula} - {new Date(item.date).toLocaleString()}</p>
                                </li>
                            ))}
                            </ul>
                        ) : <p className="text-sm text-gray-500">Belum ada riwayat.</p>}
                    </Card>
                </div>
                
                {/* Kanan: Hasil Script */}
                <div className="lg:col-span-3">
                    {generatedScript ? (
                        <Card>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{generatedScript.title}</h2>
                                    <p className="text-sm text-gray-500">Formula: {formState.formula}</p>
                                </div>
                                <Button onClick={copyScriptToClipboard} variant="secondary">
                                    <CopyIcon className="w-4 h-4 mr-2" />
                                    Salin
                                </Button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-primary-600">Hook Utama</h3>
                                    <p className="mt-1 pl-4 border-l-4 border-primary-200 text-lg font-medium text-gray-800 dark:text-gray-200">{generatedScript.hook}</p>
                                </div>
                                
                                {/* Menampilkan Variasi Hook jika ada */}
                                {generatedScript.hook_variations && generatedScript.hook_variations.length > 0 && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                                        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">Alternatif Hook (A/B Test)</h4>
                                        <ul className="space-y-2">
                                            {generatedScript.hook_variations.map((v, idx) => (
                                                <li key={idx} className="text-sm">
                                                    <span className="font-bold text-gray-700 dark:text-gray-200 block">{v.type}:</span>
                                                    <span className="text-gray-600 dark:text-gray-300">"{v.hook}"</span>
                                                    <span className="text-xs text-gray-500 ml-2 italic">({v.usage})</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div>
                                    {generatedScript.body.map((part, index) => (
                                        <div key={index} className="mb-3">
                                            <h3 className="font-semibold text-gray-800 dark:text-gray-200">[{part.stage}]</h3>
                                            <p className="mt-1 text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{part.content}</p>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-green-600">Call to Action</h3>
                                    <p className="mt-1 pl-4 border-l-4 border-green-200 text-gray-600 dark:text-gray-300">{generatedScript.cta}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-yellow-600">Catatan Delivery</h3>
                                    <p className="mt-1 pl-4 border-l-4 border-yellow-200 text-gray-600 dark:text-gray-300">{generatedScript.delivery_notes}</p>
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t dark:border-gray-700">
                                <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-300">Revisi Cepat</h3>
                                <div className="flex flex-wrap gap-2">
                                    <Button size="sm" variant="secondary" onClick={() => handleQuickEdit('lebih lucu')} disabled={isRevisionLoading}>Lebih Lucu</Button>
                                    <Button size="sm" variant="secondary" onClick={() => handleQuickEdit('lebih singkat')} disabled={isRevisionLoading}>Lebih Singkat</Button>
                                    <Button size="sm" variant="secondary" onClick={() => handleQuickEdit('lebih hard-selling')} disabled={isRevisionLoading}>Lebih Hard-Selling</Button>
                                    <Button size="sm" variant="secondary" onClick={() => handleQuickEdit('lebih emosional')} disabled={isRevisionLoading}>Lebih Emosional</Button>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <Card className="text-center py-20 sticky top-24">
                            <ScriptIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Output Script Anda Akan Muncul di Sini</h3>
                            <p className="mt-1 text-sm text-gray-500">Pilih formula dan isi detail untuk memulai.</p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScriptGeneratorPage;