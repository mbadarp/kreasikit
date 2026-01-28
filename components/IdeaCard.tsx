
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Idea, GenerateFormState } from '../types';
import { generateScriptForIdea } from '../services/geminiService';
import Card from './ui/Card';
import Button from './ui/Button';
import { CopyIcon } from './icons/CopyIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ZapIcon } from './icons/ZapIcon';

interface IdeaCardProps {
    idea: Idea;
    formInput: GenerateFormState;
}

const ScoreBar: React.FC<{ score: number; label: string }> = ({ score, label }) => {
    const percentage = score * 10;
    let colorClass = 'bg-red-500';
    if (percentage > 75) colorClass = 'bg-green-500';
    else if (percentage > 40) colorClass = 'bg-yellow-500';

    return (
        <div className="w-full">
            <div className="flex justify-between mb-1 text-xs">
                <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
                <span className="font-semibold text-primary-600 dark:text-primary-400">{score}/10</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                <div className={`${colorClass} h-1.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

const IdeaCard: React.FC<IdeaCardProps> = ({ idea, formInput }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [script, setScript] = useState<string | null>(null);
    const [isGeneratingScript, setIsGeneratingScript] = useState(false);

    const copyToClipboard = (text: string, message: string) => {
        navigator.clipboard.writeText(text);
        toast.success(message);
    };
    
    const handleGenerateScript = async () => {
        setIsGeneratingScript(true);
        const toastId = toast.loading('Menghasilkan skrip...');
        try {
            const generatedScript = await generateScriptForIdea(formInput, idea);
            setScript(generatedScript);
            toast.success('Skrip berhasil dibuat!', { id: toastId });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Gagal membuat skrip.', { id: toastId });
        } finally {
            setIsGeneratingScript(false);
        }
    };

    return (
        <Card className="w-full transition-all duration-300">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{idea.hooks[0]}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{idea.summary}</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                     <div className="text-center">
                        <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{idea.total_score}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Skor Total</div>
                    </div>
                </div>
            </div>

            {idea.warnings.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200">
                    {idea.warnings.map((warning, index) => <p key={index} className="text-sm">{warning}</p>)}
                </div>
            )}

            <div className="mt-4 space-y-2">
                <div className="text-sm">
                    <strong className="text-gray-600 dark:text-gray-300">Hook Alternatif:</strong>
                    <ul className="list-disc list-inside ml-4 text-gray-500 dark:text-gray-400">
                        {idea.hooks.slice(1).map((hook, index) => <li key={index}>{hook}</li>)}
                    </ul>
                </div>
                <div className="text-sm">
                    <strong className="text-gray-600 dark:text-gray-300">Sudut Pandang Unik:</strong>
                    <p className="text-gray-500 dark:text-gray-400">{idea.unique_angle}</p>
                </div>
            </div>

            {isExpanded && (
                 <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                    <div>
                        <h4 className="font-semibold mb-2">Outline</h4>
                        <ol className="list-decimal list-inside space-y-1 text-gray-600 dark:text-gray-400">
                            {idea.outline.map((step, index) => <li key={index}>{step}</li>)}
                        </ol>
                    </div>
                    {idea.cta && (
                        <div>
                            <h4 className="font-semibold">Call to Action</h4>
                            <p className="text-gray-600 dark:text-gray-400">{idea.cta}</p>
                        </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                        {idea.keywords.map(kw => <span key={kw} className="bg-gray-200 dark:bg-gray-700 text-xs px-2 py-1 rounded-md">{kw}</span>)}
                    </div>
                     <div className="flex flex-wrap gap-2">
                        {idea.hashtags.map(ht => <span key={ht} className="text-primary-600 dark:text-primary-400 text-xs">{ht}</span>)}
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">Rincian Skor</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ScoreBar score={idea.scores.relevance} label="Relevansi" />
                            <ScoreBar score={idea.scores.novelty} label="Kebaruan" />
                            <ScoreBar score={idea.scores.engagement_potential} label="Potensi Engagement" />
                            <ScoreBar score={idea.scores.production_fit} label="Kemudahan Produksi" />
                        </div>
                    </div>
                    <div className="pt-4 space-y-3">
                        {!script && (
                             <Button variant="primary" size="sm" onClick={handleGenerateScript} disabled={isGeneratingScript}>
                                <ZapIcon className="w-4 h-4 mr-2" />
                                {isGeneratingScript ? 'Menghasilkan...' : 'Hasilkan Skrip'}
                            </Button>
                        )}
                        {script && (
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold">Skrip yang Dihasilkan</h4>
                                    <Button variant="secondary" size="sm" onClick={() => copyToClipboard(script, 'Skrip disalin!')}>
                                        <CopyIcon className="w-4 h-4 mr-2" /> Salin Skrip
                                    </Button>
                                </div>
                                <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-md max-h-60 overflow-y-auto">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">{script}</p>
                                </div>
                            </div>
                        )}
                    </div>
                 </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2 justify-between items-center">
                 <Button variant="secondary" size="sm" onClick={() => copyToClipboard(idea.summary, 'Ringkasan ide disalin!')}>
                     <CopyIcon className="w-4 h-4 mr-2" /> Salin Ringkasan
                 </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? 'Tutup Detail' : 'Lihat Detail'}
                    <ChevronDownIcon className={`w-4 h-4 ml-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </Button>
            </div>
        </Card>
    );
};

export default IdeaCard;
