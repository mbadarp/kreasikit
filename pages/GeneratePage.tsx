
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { GenerateFormState, Idea } from '../types';
import { DEFAULT_FORM_STATE, INDUSTRIES, CONTENT_FORMATS, AUDIENCE_LEVELS, CONTENT_GOALS, DEPTH_LEVELS, RISK_LEVELS } from '../constants';
import { generateIdeas } from '../services/geminiService';

import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TagInput from '../components/ui/TagInput';
import Toggle from '../components/ui/Toggle';
import { ZapIcon } from '../components/icons/ZapIcon';

interface GeneratePageProps {
  onIdeasGenerated: (requestId: string, input: GenerateFormState, ideas: Idea[]) => void;
}

const GeneratePage: React.FC<GeneratePageProps> = ({ onIdeasGenerated }) => {
    const [formState, setFormState] = useState<GenerateFormState>(DEFAULT_FORM_STATE);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const toastId = toast.loading('Sedang menghasilkan ide-ide cemerlang...');
        
        try {
            const ideas = await generateIdeas(formState);
            const requestId = `req_${Date.now()}`;
            onIdeasGenerated(requestId, formState, ideas);
            toast.success('Ide berhasil dibuat!', { id: toastId });
            navigate(`/app/results/${requestId}`);
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.', { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit}>
                <div className="space-y-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold">Generator Ide Konten</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Isi detail di bawah ini untuk mendapatkan ide super spesifik dari AI.</p>
                    </div>

                    <Card>
                        <h2 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-gray-700">Konteks Utama</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <Select label="Industri / Niche" name="industry" value={formState.industry} options={INDUSTRIES} onChange={handleChange} />
                               {formState.industry === 'others' && (
                                   <Input label="Industri Kustom" name="industry_other" value={formState.industry_other || ''} onChange={handleChange} placeholder="cth: Edukasi hewan peliharaan" required />
                               )}
                            </div>
                            <Input label="Sub-niche" name="sub_niche" value={formState.sub_niche} onChange={handleChange} placeholder="cth: Perawatan anjing ras kecil" required />
                            <div className="space-y-2">
                                <Select label="Format Konten" name="content_format" value={formState.content_format} options={CONTENT_FORMATS} onChange={handleChange} />
                                {formState.content_format === 'others' && (
                                    <Input label="Format Kustom" name="content_format_other" value={formState.content_format_other || ''} onChange={handleChange} placeholder="cth: Video monolog" required />
                                )}
                            </div>
                             <div className="space-y-2">
                                <Select label="Tujuan Konten" name="content_goal" value={formState.content_goal} options={CONTENT_GOALS} onChange={handleChange} />
                                 {formState.content_goal === 'others' && (
                                    <Input label="Tujuan Kustom" name="content_goal_other" value={formState.content_goal_other || ''} onChange={handleChange} placeholder="cth: Membangun komunitas" required />
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h2 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-gray-700">Detail Audiens</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Segmen Audiens" name="audience_segment" value={formState.audience_segment} onChange={handleChange} placeholder="cth: Pemilik anjing pemula" required />
                            <Select label="Level Audiens" name="audience_level" value={formState.audience_level} options={AUDIENCE_LEVELS} onChange={handleChange} />
                            <Input label="Geografis Audiens (Opsional)" name="audience_geo" value={formState.audience_geo} onChange={handleChange} placeholder="cth: Jabodetabek" />
                            <TagInput label="Tag Brand Voice" tags={formState.brand_voice_tags} setTags={(tags) => setFormState(p => ({ ...p, brand_voice_tags: tags }))} placeholder="Tambah tag & tekan Enter" />
                        </div>
                    </Card>
                    
                    <Card>
                        <h2 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-gray-700">Strategi Konten</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <Select label="Tingkat Kedalaman" name="depth_level" value={formState.depth_level} options={DEPTH_LEVELS} onChange={handleChange} />
                             <TagInput label="Topik Blacklist" tags={formState.blacklist_topics} setTags={(tags) => setFormState(p => ({...p, blacklist_topics: tags}))} placeholder="Tambah topik yang dihindari..." />
                        </div>
                    </Card>

                    <Card>
                        <h2 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-gray-700">Pengaturan Generator</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <Select label="Jumlah Ide" name="idea_count" value={String(formState.idea_count)} options={[{value: '10', label: '10'}, {value: '20', label: '20'}, {value: '50', label: '50'}]} onChange={e => setFormState(p => ({...p, idea_count: Number(e.target.value)}))} />
                            <Select label="Risiko / Variasi" name="risk_level" value={formState.risk_level} options={RISK_LEVELS} onChange={handleChange} />
                            <Toggle label="Sertakan CTA" enabled={formState.include_cta} setEnabled={val => setFormState(p => ({...p, include_cta: val}))} />
                            <Toggle label="Sertakan Hashtag" enabled={formState.include_hashtags} setEnabled={val => setFormState(p => ({...p, include_hashtags: val}))} />
                        </div>
                    </Card>

                    <div className="py-4">
                        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                            <ZapIcon className="w-5 h-5 mr-2" />
                            {isLoading ? 'Menghasilkan...' : 'Hasilkan Ide'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default GeneratePage;
