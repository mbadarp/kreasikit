
import React, { useState, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { IdeaRequest, ProductionEffort } from '../types';
import { PRODUCTION_EFFORTS } from '../constants';
import IdeaCard from '../components/IdeaCard';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { DownloadIcon } from '../components/icons/DownloadIcon';
import { DocumentIcon } from '../components/icons/DocumentIcon';

interface ResultsPageProps {
    ideaRequests: Record<string, IdeaRequest>;
}

type SortKey = 'total_score' | 'relevance' | 'novelty' | 'effort';

const ResultsPage: React.FC<ResultsPageProps> = ({ ideaRequests }) => {
    const { requestId } = useParams();
    const [sortKey, setSortKey] = useState<SortKey>('total_score');
    const [effortFilter, setEffortFilter] = useState<ProductionEffort | 'all'>('all');

    const request = requestId ? ideaRequests[requestId] : undefined;

    const sortedAndFilteredIdeas = useMemo(() => {
        if (!request) return [];
        
        let ideas = [...request.ideas];

        if (effortFilter !== 'all') {
            ideas = ideas.filter(idea => idea.effort === effortFilter);
        }

        ideas.sort((a, b) => {
            switch (sortKey) {
                case 'relevance': return b.scores.relevance - a.scores.relevance;
                case 'novelty': return b.scores.novelty - a.scores.novelty;
                case 'effort': 
                    const effortOrder = { 'low': 1, 'medium': 2, 'high': 3 };
                    return effortOrder[a.effort] - effortOrder[b.effort];
                case 'total_score':
                default:
                    return b.total_score - a.total_score;
            }
        });

        return ideas;
    }, [request, sortKey, effortFilter]);

    const downloadAllAsCSV = () => {
        if (sortedAndFilteredIdeas.length === 0) {
            toast.error("Tidak ada ide untuk diunduh.");
            return;
        }

        const headers = "id,skor_total,upaya,hook_1,ringkasan,sudut_pandang_unik,outline,cta,keywords,hashtags";
        
        const escapeCSV = (val: string | number) => `"${String(val || '').replace(/"/g, '""')}"`;

        const csvRows = sortedAndFilteredIdeas.map(idea => {
            const row = [
                idea.id,
                idea.total_score,
                idea.effort,
                idea.hooks[0],
                idea.summary,
                idea.unique_angle,
                idea.outline.join('\n'),
                idea.cta,
                idea.keywords.join(', '),
                idea.hashtags.join(' ')
            ].map(escapeCSV).join(',');
            return row;
        });

        const csvContent = [headers, ...csvRows].join('\n');
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ide_konten_${requestId}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Berhasil mengunduh CSV!");
    };

    const downloadAllAsDoc = () => {
        if (sortedAndFilteredIdeas.length === 0) {
            toast.error("Tidak ada ide untuk diunduh.");
            return;
        }

        const escapeHTML = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&#039;');

        let htmlContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>Ide Konten</title></head>
            <body>
            <h1>Hasil Ide Konten</h1>
            <p>Dihasilkan pada: ${new Date().toLocaleString()}</p>
        `;

        sortedAndFilteredIdeas.forEach(idea => {
            htmlContent += `
                <hr />
                <h2>${escapeHTML(idea.hooks[0])} (Skor: ${idea.total_score})</h2>
                <p><strong>Ringkasan:</strong> ${escapeHTML(idea.summary)}</p>
                <p><strong>Sudut Pandang Unik:</strong> ${escapeHTML(idea.unique_angle)}</p>
                <h3>Outline:</h3>
                <ol>
                    ${idea.outline.map(step => `<li>${escapeHTML(step)}</li>`).join('')}
                </ol>
                <p><strong>Hook Alternatif:</strong></p>
                <ul>
                    ${idea.hooks.slice(1).map(hook => `<li>${escapeHTML(hook)}</li>`).join('')}
                </ul>
                <p><strong>Call to Action:</strong> ${escapeHTML(idea.cta)}</p>
                <p><strong>Keywords:</strong> ${escapeHTML(idea.keywords.join(', '))}</p>
                <p><strong>Hashtags:</strong> ${escapeHTML(idea.hashtags.join(' '))}</p>
                <br />
            `;
        });

        htmlContent += "</body></html>";
        
        const blob = new Blob(['\ufeff', htmlContent], {
            type: 'application/msword'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ide_konten_${requestId}.doc`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Berhasil mengunduh dokumen Word!");
    };
    
    if (!requestId || !request) {
        return <Navigate to="/app/idea-generator" replace />;
    }

    const { input } = request;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6">
                <div className="mt-2 flex flex-wrap gap-2">
                    <span className="bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-200 text-xs font-medium px-2.5 py-0.5 rounded-full">{input.industry === 'others' ? input.industry_other : input.industry}</span>
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium px-2.5 py-0.5 rounded-full">{input.sub_niche}</span>
                     <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium px-2.5 py-0.5 rounded-full">{input.content_goal === 'others' ? input.content_goal_other : input.content_goal}</span>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                     <div>
                        <Select 
                            label="Urutkan Berdasarkan" 
                            value={sortKey} 
                            onChange={e => setSortKey(e.target.value as SortKey)}
                            options={[
                                { value: 'total_score', label: 'Skor Total (Tertinggi)'},
                                { value: 'relevance', label: 'Relevansi (Tertinggi)'},
                                { value: 'novelty', label: 'Kebaruan (Tertinggi)'},
                                { value: 'effort', label: 'Upaya (Terendah)'},
                            ]}
                        />
                    </div>
                     <div>
                        <Select 
                            label="Filter Upaya" 
                            value={effortFilter} 
                            onChange={e => setEffortFilter(e.target.value as any)}
                            options={[{ value: 'all', label: 'Semua'}, ...PRODUCTION_EFFORTS]}
                        />
                    </div>
                </div>
                 <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                     <Button onClick={downloadAllAsDoc} variant="secondary">
                        <DocumentIcon className="w-4 h-4 mr-2" />
                        Unduh Doc
                    </Button>
                     <Button onClick={downloadAllAsCSV} variant="secondary">
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        Unduh CSV
                    </Button>
                </div>
            </div>

            {sortedAndFilteredIdeas.length > 0 ? (
                <div className="space-y-6">
                    {sortedAndFilteredIdeas.map(idea => (
                        <IdeaCard 
                            key={idea.id} 
                            idea={idea} 
                            formInput={input}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <h3 className="text-xl font-semibold">Ide Tidak Ditemukan</h3>
                    <p className="mt-2 text-gray-500">Filter yang Anda pilih mungkin terlalu spesifik. Coba ubah pengaturan filter atau hasilkan ide baru.</p>
                    <Link to="/app/idea-generator" className="mt-4 inline-block">
                        <Button>Hasilkan Ide Baru</Button>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default ResultsPage;