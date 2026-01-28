
import { GenerateFormState, Industry, ContentFormat, AudienceLevel, ContentGoal, ProductionEffort, DepthLevel, RiskLevel, HookGenerateFormState, ScriptFormula, ScriptContentGoal, ScriptCTA, AudienceAwareness, ScriptFormState, UserType, YoutubeOptimizerFormState, YoutubeLanguage, ThumbnailFormState, ThumbnailOrientation, ThumbnailStyle } from './types';

export const INDUSTRIES: { value: Industry, label: string }[] = [
    { value: 'finance', label: 'Keuangan' },
    { value: 'beauty', label: 'Kecantikan' },
    { value: 'education', label: 'Pendidikan' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'fnb', label: 'Makanan & Minuman' },
    { value: 'property', label: 'Properti' },
    { value: 'automotive', label: 'Otomotif' },
    { value: 'health', label: 'Kesehatan & Kebugaran' },
    { value: 'parenting', label: 'Parenting' },
    { value: 'travel', label: 'Travel' },
    { value: 'tech', label: 'Teknologi' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'b2b_saas', label: 'B2B SaaS' },
    { value: 'others', label: 'Lainnya' },
];

export const CONTENT_FORMATS: { value: ContentFormat, label: string }[] = [
    { value: 'tutorial', label: 'Tutorial/Cara Melakukan' },
    { value: 'debunking', label: 'Membantah Mitos' },
    { value: 'storytelling', label: 'Storytelling' },
    { value: 'case_study', label: 'Studi Kasus' },
    { value: 'review', label: 'Ulasan Produk/Layanan' },
    { value: 'before_after', label: 'Sebelum & Sesudah' },
    { value: 'qna', label: 'Tanya Jawab / AMA' },
    { value: 'listicle', label: 'Listicle' },
    { value: 'reaction', label: 'Reaksi/Komentar' },
    { value: 'skit', label: 'Skit/Komedi' },
    { value: 'carousel', label: 'Carousel' },
    { value: 'thread', label: 'Thread' },
    { value: 'others', label: 'Lainnya' },
];

export const AUDIENCE_LEVELS: { value: AudienceLevel, label: string }[] = [
    { value: 'beginner', label: 'Pemula' },
    { value: 'intermediate', label: 'Menengah' },
    { value: 'advanced', label: 'Mahir' },
];

export const CONTENT_GOALS: { value: ContentGoal, label: string }[] = [
    { value: 'awareness', label: 'Brand Awareness' },
    { value: 'education', label: 'Edukasi Audiens' },
    { value: 'engagement', label: 'Meningkatkan Engagement' },
    { value: 'leads', label: 'Mendapatkan Leads' },
    { value: 'sales', label: 'Meningkatkan Penjualan' },
    { value: 'authority', label: 'Membangun Otoritas' },
    { value: 'retention', label: 'Retensi Pelanggan' },
    { value: 'others', label: 'Lainnya' },
];

export const DEPTH_LEVELS: { value: DepthLevel, label: string }[] = [
    { value: 'surface', label: 'Dasar (Surface Level)' },
    { value: 'practical', label: 'Praktis & Dapat Diterapkan' },
    { value: 'technical', label: 'Mendalam & Teknis' },
    { value: 'data_case', label: 'Berbasis Data/Studi Kasus' },
];

export const RISK_LEVELS: { value: RiskLevel, label: string }[] = [
    { value: 'safe', label: 'Aman & Terbukti' },
    { value: 'balanced', label: 'Seimbang' },
    { value: 'bold', label: 'Berani & Eksperimental' },
];

// Fix: Export PRODUCTION_EFFORTS constant to be used in filters.
export const PRODUCTION_EFFORTS: { value: ProductionEffort, label: string }[] = [
    { value: 'low', label: 'Rendah' },
    { value: 'medium', label: 'Sedang' },
    { value: 'high', label: 'Tinggi' },
];

export const DEFAULT_FORM_STATE: GenerateFormState = {
    industry: 'tech',
    sub_niche: '',
    content_format: 'tutorial',
    audience_segment: '',
    audience_level: 'beginner',
    audience_geo: '',
    content_goal: 'education',
    brand_voice_tags: ['bersahabat', 'to-the-point'],
    depth_level: 'practical',
    blacklist_topics: ['motivasi umum', 'tips sukses generik'],
    idea_count: 10,
    risk_level: 'balanced',
    include_cta: true,
    include_hashtags: true,
};

// --- HOOK GENERATOR CONSTANTS ---

export const DEFAULT_HOOK_FORM_STATE: HookGenerateFormState = {
    script: '',
    tone: '', // Empty string implies default behavior in logic
    outputLanguage: 'indonesia',
};

// --- SCRIPT GENERATOR CONSTANTS ---

export const SCRIPT_FORMULAS: { value: ScriptFormula, label: string, description: string }[] = [
    { value: 'PAS', label: 'PAS (Problem, Agitate, Solution)', description: 'Cocok untuk jualan & konten problem-solving.' },
    { value: 'AIDA', label: 'AIDA (Attention, Interest, Desire, Action)', description: 'Formula copywriting klasik, bagus untuk penjualan.' },
    { value: 'PASTOR', label: 'PASTOR', description: 'Storytelling yang komprehensif, cocok untuk brand.' },
    { value: 'BAB', label: 'BAB (Before, After, Bridge)', description: 'Efektif untuk menunjukkan transformasi.' },
    { value: 'STAR', label: 'STAR (Situation, Task, Action, Result)', description: 'Ideal untuk studi kasus dan storytelling personal.' },
    { value: 'ObjectionHandling', label: 'Objection Handling', description: 'Mengatasi keraguan audiens secara langsung.' },
    { value: 'BFAC', label: 'BFAC (Big Promise, Feature, Advantage, CTA)', description: 'To-the-point, bagus untuk konten singkat.' },
    { value: 'HPR', label: 'HPR (Hook, Problem, Resolution)', description: 'Struktur video pendek yang sangat efektif.' },
    { value: 'FPO', label: 'FPO (Feature, Proof, Outcome)', description: 'Menyoroti fitur produk dengan bukti & hasil.' },
    { value: 'HerosJourney', label: "Hero's Journey", description: 'Struktur cerita epik untuk brand & personal story.' },
    { value: 'ComparisonContrast', label: 'Comparison & Contrast', description: 'Membandingkan dua hal untuk menyoroti keunggulan.' },
    { value: 'FourP', label: '4P (Promise, Picture, Proof, Push)', description: 'Mirip AIDA, membangun gambaran & bukti kuat.' },
];

export const SCRIPT_USER_TYPES: { value: UserType, label: string }[] = [
    { value: 'creator_pemula', label: 'Creator Pemula (TikTok/Reels/Shorts)' },
    { value: 'umkm', label: 'UMKM & Solopreneur' },
    { value: 'marketer', label: 'Marketer & Copywriter' },
    { value: 'personal_brand', label: 'Personal Brand (Coach, Educator)' },
    { value: 'others', label: 'Lainnya' }
];

export const SCRIPT_CONTENT_GOALS: { value: ScriptContentGoal, label: string }[] = [
    { value: 'edukasi', label: 'Edukasi' },
    { value: 'hiburan', label: 'Hiburan' },
    { value: 'jualan_soft', label: 'Jualan (Soft-selling)' },
    { value: 'jualan_hard', label: 'Jualan (Hard-selling)' },
    { value: 'personal_branding', label: 'Personal Branding' },
    { value: 'engagement', label: 'Engagement' },
    { value: 'others', label: 'Lainnya' },
];

export const SCRIPT_CTA_OPTIONS: { value: ScriptCTA, label: string }[] = [
    { value: 'follow', label: 'Follow' },
    { value: 'save', label: 'Save' },
    { value: 'comment', label: 'Comment' },
    { value: 'dm', label: 'DM' },
    { value: 'klik_link', label: 'Klik Link di Bio' },
    { value: 'beli_sekarang', label: 'Beli Sekarang' },
];

export const AUDIENCE_AWARENESS_LEVELS: { value: AudienceAwareness, label: string }[] = [
    { value: 'unaware', label: 'Belum Sadar Masalah' },
    { value: 'problem_aware', label: 'Sadar Masalah, Belum Tahu Solusi' },
    { value: 'solution_aware', label: 'Bandingkan Solusi' },
    { value: 'product_aware', label: 'Siap Beli / Tertarik Produkmu' },
];


export const DEFAULT_SCRIPT_FORM_STATE: ScriptFormState = {
    formula: 'PAS',
    user_type: 'creator_pemula',
    goal: 'edukasi',
    duration: 60,
    audience: '',
    topic_and_points: '',
    offer: '',
    cta: 'save',
    style_and_persona: 'Santai - Teman',
    awareness: 'problem_aware',
};

// --- YOUTUBE OPTIMIZER CONSTANTS ---

export const YOUTUBE_LANGUAGES: { value: YoutubeLanguage, label: string }[] = [
    { value: 'indonesia', label: 'Bahasa Indonesia' },
    { value: 'english', label: 'English' },
];

export const DEFAULT_YOUTUBE_OPTIMIZER_FORM_STATE: YoutubeOptimizerFormState = {
    contentInput: '',
    outputLanguage: 'indonesia',
};

// --- THUMBNAIL GENERATOR CONSTANTS ---

export const THUMBNAIL_ORIENTATIONS: { value: ThumbnailOrientation, label: string }[] = [
    { value: 'horizontal', label: 'Horizontal (16:9) - YouTube Long' },
    { value: 'vertical', label: 'Vertical (9:16) - Shorts/Reels/TikTok' },
];

export const THUMBNAIL_STYLES: { value: ThumbnailStyle, label: string }[] = [
    { value: 'minimalist', label: 'Minimal Clean' },
    { value: 'mrbeast', label: 'MrBeast-Style Bold' },
    { value: 'cinematic', label: 'Cinematic' },
    { value: 'futuristic', label: 'Tech / Futuristic' },
    { value: 'vlog', label: 'Vlog / Lifestyle' },
    { value: 'horror', label: 'Horror / Dark' },
    { value: 'anime', label: 'Anime Style' },
    { value: 'cartoon', label: 'Cartoon / 3D Render' },
    { value: 'luxury', label: 'Luxury / High-End' },
    { value: 'documentary', label: 'Documentary' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'others', label: 'Lainnya' },
];

export const DEFAULT_THUMBNAIL_FORM_STATE: ThumbnailFormState = {
    orientation: 'horizontal',
    style: 'minimalist',
    description: '',
    include_text: true,
    language: 'indonesia',
};
