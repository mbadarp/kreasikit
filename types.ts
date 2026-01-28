
export type Industry = 'finance' | 'beauty' | 'education' | 'gaming' | 'fnb' | 'property' | 'automotive' | 'health' | 'parenting' | 'travel' | 'tech' | 'fashion' | 'b2b_saas' | 'others';
export type Platform = 'tiktok' | 'instagram_reels' | 'youtube_shorts' | 'youtube_long' | 'x' | 'linkedin' | 'podcast' | 'blog' | 'newsletter' | 'others';
export type ContentFormat = 'tutorial' | 'debunking' | 'storytelling' | 'case_study' | 'review' | 'before_after' | 'qna' | 'listicle' | 'reaction' | 'skit' | 'carousel' | 'thread' | 'others';
export type AudienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type LanguageStyle = 'id_formal' | 'id_santai' | 'english' | 'others';
export type ContentGoal = 'awareness' | 'education' | 'engagement' | 'leads' | 'sales' | 'authority' | 'retention' | 'others';
export type PresentationStyle = 'oncam' | 'faceless' | 'voiceover' | 'screenrecord';
export type AssetType = 'broll' | 'screen_record' | 'captions_only' | 'stock_footage';
export type ProductionEffort = 'low' | 'medium' | 'high';
export type DepthLevel = 'surface' | 'practical' | 'technical' | 'data_case';
export type RiskLevel = 'safe' | 'balanced' | 'bold';

export interface GenerateFormState {
    // MVP
    industry: Industry;
    industry_other?: string;
    sub_niche: string;
    content_format: ContentFormat;
    content_format_other?: string;
    audience_segment: string;
    audience_level: AudienceLevel;
    audience_geo: string;
    content_goal: ContentGoal;
    content_goal_other?: string;
    brand_voice_tags: string[];
    depth_level: DepthLevel;
    blacklist_topics: string[];
    // Generation settings
    idea_count: number;
    risk_level: RiskLevel;
    include_cta: boolean;
    include_hashtags: boolean;
}

export interface IdeaScores {
    relevance: number; // 0-10
    novelty: number; // 0-10
    engagement_potential: number; // 0-10
    production_fit: number; // 0-10
}

export interface Idea {
    id: string;
    hooks: string[];
    summary: string;
    unique_angle: string;
    outline: string[];
    cta: string;
    keywords: string[];
    hashtags: string[];
    effort: ProductionEffort;
    scores: IdeaScores;
    total_score: number; // 0-100
    warnings: string[];
}

export interface GeminiResponse {
    ideas: Omit<Idea, 'total_score'>[];
}

export interface IdeaRequest {
    id: string;
    input: GenerateFormState;
    ideas: Idea[];
    createdAt: Date;
}


// --- HOOK GENERATOR TYPES ---

export interface HookGenerateFormState {
    script: string;
    tone: string; // Changed from Enum to string for manual input
    outputLanguage: YoutubeLanguage;
}

export interface GeneratedHook {
    framework: string;
    visual_hook: string;
    voice_over_hook: string;
}

export interface HookGenerationResult {
    hooks: GeneratedHook[];
}


// --- SCRIPT GENERATOR TYPES ---

export type ScriptFormula = 'PAS' | 'AIDA' | 'PASTOR' | 'BAB' | 'STAR' | 'ObjectionHandling' | 'BFAC' | 'HPR' | 'FPO' | 'HerosJourney' | 'ComparisonContrast' | 'FourP';
export type ScriptContentGoal = 'edukasi' | 'hiburan' | 'jualan_soft' | 'jualan_hard' | 'personal_branding' | 'engagement' | 'others';
export type ScriptCTA = 'follow' | 'save' | 'comment' | 'dm' | 'klik_link' | 'beli_sekarang';
export type AudienceAwareness = 'unaware' | 'problem_aware' | 'solution_aware' | 'product_aware';
export type UserType = 'creator_pemula' | 'umkm' | 'marketer' | 'personal_brand' | 'others';


export interface ScriptFormState {
    formula: ScriptFormula;
    user_type: UserType;
    user_type_other?: string;
    goal: ScriptContentGoal;
    goal_other?: string;
    duration: number;
    audience: string;
    topic_and_points: string;
    offer: string;
    cta: ScriptCTA;
    style_and_persona: string;
    awareness: AudienceAwareness;
}

export interface ScriptBodyPart {
    stage: string;
    content: string;
}

export interface HookVariation {
    type: string;
    hook: string;
    usage: string;
}

export interface GeneratedScript {
    title: string;
    hook: string;
    hook_variations?: HookVariation[]; // Added property
    body: ScriptBodyPart[];
    cta: string;
    delivery_notes: string;
}

export interface ScriptHistoryItem {
    id: string;
    formula: ScriptFormula;
    title: string;
    date: string;
    script: GeneratedScript;
    formState: ScriptFormState;
}

// --- PROMPT GENERATOR TYPES ---

export interface PromptFormState {
    userInput: string;
}

// --- YOUTUBE OPTIMIZER TYPES ---

export type YoutubeLanguage = 'english' | 'indonesia';

export interface YoutubeOptimizerFormState {
    contentInput: string;
    outputLanguage: YoutubeLanguage;
}

export interface YoutubeHashtags {
    tier1: string[];
    tier2: string[];
    tier3: string[];
}

export interface YoutubeOptimizerResult {
    analysis: string;
    titles: string[];
    titleStrategy: string;
    description: string;
    hashtags: YoutubeHashtags;
    tags: string; // Combined into a single string
}

export interface GeminiYoutubeResponse {
    analysis: string;
    titles: string[];
    title_strategy: string;
    description: string;
    hashtags: YoutubeHashtags;
    tags: string[];
}

// --- THUMBNAIL GENERATOR TYPES ---

export type ThumbnailOrientation = 'horizontal' | 'vertical';
export type ThumbnailStyle = 'minimalist' | 'mrbeast' | 'cinematic' | 'futuristic' | 'vlog' | 'horror' | 'anime' | 'cartoon' | 'luxury' | 'documentary' | 'gaming' | 'others';

export interface ThumbnailFormState {
    orientation: ThumbnailOrientation;
    style: ThumbnailStyle;
    style_other?: string;
    description: string;
    referenceImage?: string; // Base64 string of uploaded character/reference
    include_text: boolean;
    language: YoutubeLanguage;
}

export interface ThumbnailGenerationResult {
    images: string[]; // List of Base64 image strings (3 options)
}

// --- API CONFIGURATION TYPES ---

export type ApiProvider = 'app' | 'gemini' | 'groq';

export interface ApiConfig {
    provider: ApiProvider;
    geminiApiKey?: string;
    groqApiKey?: string;
}

// --- AUTH TYPES ---

export interface AuthContextType {
    isAuthenticated: boolean;
    login: (code: string) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
}
