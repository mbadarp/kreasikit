
import { GoogleGenAI, Type } from '@google/genai';
import { GenerateFormState, Idea, GeminiResponse, IdeaScores, HookGenerateFormState, HookGenerationResult, ScriptFormState, GeneratedScript, ScriptFormula, PromptFormState, YoutubeOptimizerFormState, YoutubeOptimizerResult, GeminiYoutubeResponse, ThumbnailFormState, ThumbnailGenerationResult, ApiConfig } from '../types';

// --- CONFIGURATION HELPER ---

const getApiConfig = (): ApiConfig => {
    try {
        const stored = localStorage.getItem('kreasikit_api_config');
        return stored ? JSON.parse(stored) : { provider: 'app', geminiApiKey: '', groqApiKey: '' };
    } catch {
        return { provider: 'app', geminiApiKey: '', groqApiKey: '' };
    }
};

const getEffectiveGeminiKey = (config: ApiConfig): string => {
    if (config.provider === 'gemini' && config.geminiApiKey) {
        return config.geminiApiKey;
    }
    // Fallback to app key if provider is 'app' OR if provider is 'groq' (for image fallback) OR if custom key is missing
    // CHANGE: Adjusted for Vite environment variables
    return import.meta.env.VITE_API_KEY || '';
};

// --- GROQ API CLIENT ADAPTER ---

const callGroqApi = async (messages: any[], apiKey: string, jsonMode: boolean = false): Promise<string> => {
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: messages,
                model: 'llama3-70b-8192',
                temperature: 0.7,
                response_format: jsonMode ? { type: "json_object" } : undefined
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(`Groq API Error: ${err.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || '';
    } catch (error) {
        console.error("Groq Call Failed:", error);
        throw error;
    }
};

// --- SCORING HELPER ---

const calculateTotalScore = (scores: IdeaScores): number => {
    const weights = {
        relevance: 0.40,
        engagement_potential: 0.25,
        production_fit: 0.20,
        novelty: 0.15,
    };

    const weightedSum = (scores.relevance * weights.relevance) +
                        (scores.engagement_potential * weights.engagement_potential) +
                        (scores.production_fit * weights.production_fit) +
                        (scores.novelty * weights.novelty);

    return Math.round(weightedSum * 10);
};

// --- IDEA GENERATOR ---

const buildUserPrompt = (formState: GenerateFormState): string => {
    const industry = formState.industry === 'others' ? formState.industry_other : formState.industry;
    const contentFormat = formState.content_format === 'others' ? formState.content_format_other : formState.content_format;
    const contentGoal = formState.content_goal === 'others' ? formState.content_goal_other : formState.content_goal;

    return `
      Berikut adalah konteks untuk ide konten yang saya butuhkan:
      - Industri: ${industry}
      - Sub-niche: ${formState.sub_niche}
      - Format Konten: ${contentFormat}
      - Segmen Audiens: ${formState.audience_segment}
      - Level Audiens: ${formState.audience_level}
      - Geografis Audiens: ${formState.audience_geo}
      - Tujuan Utama Konten: ${contentGoal}
      - Tag Brand Voice: ${formState.brand_voice_tags.join(', ')}
      - Tingkat Kedalaman Konten: ${formState.depth_level}
      - Topik yang Dihindari (Blacklist): ${formState.blacklist_topics.join(', ')}
      - Tingkat Risiko/Variasi Ide: ${formState.risk_level}

      Tolong hasilkan ${formState.idea_count} ide konten berdasarkan konteks ini.

      Aturan Ketat:
      1. Gunakan gaya bahasa Indonesia yang santai dan mudah dimengerti (sehari-hari).
      2. Setiap ide harus berakar pada masalah mikro atau keinginan konkret dalam sub-niche yang ditentukan.
      3. Output harus menyertakan 3 hook yang berbeda, ringkasan, sudut pandang unik, dan outline langkah-demi-langkah untuk setiap ide.
      4. Outline harus realistis dan dapat dieksekusi.
      5. ${formState.include_cta ? 'Hasilkan Call-to-Action (CTA) yang relevan.' : 'Jangan sertakan Call-to-Action (CTA).'}
      6. ${formState.include_hashtags ? 'Hasilkan kata kunci dan hashtag yang relevan.' : 'Jangan sertakan kata kunci atau hashtag.'}
      7. Benar-benar hindari topik dalam daftar hitam dan konten motivasi yang samar dan generik.
      8. Untuk industri 'kesehatan' atau 'keuangan', tambahkan peringatan seperti "Konten ini untuk tujuan edukasi dan bukan merupakan nasihat profesional."
    `;
};

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        ideas: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    hooks: { type: Type.ARRAY, items: { type: Type.STRING } },
                    summary: { type: Type.STRING },
                    unique_angle: { type: Type.STRING },
                    outline: { type: Type.ARRAY, items: { type: Type.STRING } },
                    cta: { type: Type.STRING },
                    keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                    hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    effort: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
                    scores: {
                        type: Type.OBJECT,
                        properties: {
                            relevance: { type: Type.NUMBER },
                            novelty: { type: Type.NUMBER },
                            engagement_potential: { type: Type.NUMBER },
                            production_fit: { type: Type.NUMBER },
                        },
                        required: ['relevance', 'novelty', 'engagement_potential', 'production_fit'],
                    },
                    warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['id', 'hooks', 'summary', 'unique_angle', 'outline', 'cta', 'keywords', 'hashtags', 'effort', 'scores', 'warnings'],
            },
        },
    },
    required: ['ideas'],
};

const systemInstruction = `Anda adalah seorang ahli strategi konten yang menghasilkan ide konten yang spesifik untuk industri dan audiens tertentu.
Jangan pernah mengeluarkan topik generik. Setiap ide harus secara eksplisit terhubung dengan konteks industri + sub-niche + audiens yang dipilih, sesuai dengan format yang dipilih, dan dapat dieksekusi dalam batasan yang ada.
Kembalikan JSON valid yang ketat sesuai dengan skema output. Tanpa markdown, tanpa teks tambahan.`;

export const generateIdeas = async (formState: GenerateFormState): Promise<Idea[]> => {
    const config = getApiConfig();
    const userPrompt = buildUserPrompt(formState);
    let responseText = "";
    
    // GROQ PATH
    if (config.provider === 'groq' && config.groqApiKey) {
        const messages = [
            { role: 'system', content: systemInstruction + " Return valid JSON matching the expected schema with 'ideas' array." },
            { role: 'user', content: userPrompt }
        ];
        responseText = await callGroqApi(messages, config.groqApiKey, true);
    } 
    // GEMINI PATH (App Default or Custom Key)
    else {
        const apiKey = getEffectiveGeminiKey(config);
        if (!apiKey) throw new Error("API Key Gemini tidak ditemukan.");

        const ai = new GoogleGenAI({ apiKey });
        
        // Retry logic for Gemini
        let lastError: any = null;
        for (let i = 0; i < 3; i++) {
            try {
                const result = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: userPrompt,
                    config: {
                        systemInstruction: i > 0 
                            ? `${systemInstruction}\n\nPERCOBAAN SEBELUMNYA GAGAL. Kembalikan HANYA JSON yang valid sesuai skema.`
                            : systemInstruction,
                        responseMimeType: 'application/json',
                        responseSchema: responseSchema,
                    }
                });
                responseText = result.text || "";
                break; // Success
            } catch (error) {
                console.error(`Percobaan ${i + 1} gagal:`, error);
                lastError = error;
            }
        }
        if (!responseText) throw new Error(`Gagal menghasilkan ide dengan Gemini. ${lastError?.message || ''}`);
    }

    // Process Response (Common for both)
    try {
        const parsedJson: GeminiResponse = JSON.parse(responseText.trim());
        if (!parsedJson.ideas || !Array.isArray(parsedJson.ideas)) {
            throw new Error("Struktur JSON tidak valid: array 'ideas' tidak ditemukan.");
        }
        return parsedJson.ideas.map((idea, index) => ({
            ...idea,
            id: `idea_${Date.now()}_${index}`,
            total_score: calculateTotalScore(idea.scores),
        }));
    } catch (e) {
        console.error("JSON Parse Error:", responseText);
        throw new Error("Gagal memproses respons JSON dari AI.");
    }
};

// --- SCRIPT GENERATOR ---

const buildScriptPrompt = (formState: GenerateFormState, idea: Idea): string => {
    return `
    Anda adalah seorang penulis skrip ahli untuk konten media sosial.
    Tugas: Ubah ide konten menjadi skrip terstruktur (4 bagian).

    **KONTEKS:**
    - Audiens: ${formState.audience_segment} (${formState.audience_level})
    - Tone: ${formState.brand_voice_tags.join(', ')}

    **IDE:**
    - Summary: ${idea.summary}
    - Angle: ${idea.unique_angle}
    - Outline: ${idea.outline.join('; ')}

    **FORMAT OUTPUT (WAJIB):**
    **Hook:** [Teks]
    **Foreshadowing:** [Teks]
    **Story/Conflict:** [Teks]
    **Payoff/Resolution:** [Teks + CTA: "${idea.cta}"]
    `;
};

export const generateScriptForIdea = async (formState: GenerateFormState, idea: Idea): Promise<string> => {
    const config = getApiConfig();
    const userPrompt = buildScriptPrompt(formState, idea);

    if (config.provider === 'groq' && config.groqApiKey) {
        return callGroqApi([{ role: 'user', content: userPrompt }], config.groqApiKey, false);
    } else {
        const apiKey = getEffectiveGeminiKey(config);
        const ai = new GoogleGenAI({ apiKey });
        const result = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: userPrompt,
        });
        return result.text ?? '';
    }
};

// --- HOOK GENERATOR ---

const hookSystemInstruction = `You are a Hook Generator Expert specializing in creating scroll-stopping, attention-grabbing hooks for short-form video content (Reels, Shorts, TikTok) and social media posts. Your expertise is based on proven psychological frameworks that capture audience attention within the first 3 seconds. Your core mission is to generate high-converting hooks that stop the scroll, trigger psychological responses, are short and powerful, use strong action verbs, create immediate value, and are authentic. You MUST generate hooks using ALL 12 proven hook types: Fear-Based, Wake-Up Call, Urgency/Time, Curiosity/Mystery, Value/Promise, Relatable/Empathy, Storytelling/Personal Journey, Question, Negativity/Contrarian, Call-Out, List/Numbered, and Trend. For each type, create a distinct Visual Hook (4-6 impactful words for on-screen text) and a Voice Over Hook (a speakable, punchy narration of 15-20 words). Follow all rules regarding filler words, directness, strong verbs, and psychological triggers. Adapt your language and intensity based on the requested tone and output language.`;

const hookResponseSchema = {
    type: Type.OBJECT,
    properties: {
        hooks: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    framework: { type: Type.STRING },
                    visual_hook: { type: Type.STRING },
                    voice_over_hook: { type: Type.STRING },
                },
                required: ['framework', 'visual_hook', 'voice_over_hook'],
            },
        },
    },
    required: ['hooks'],
};

const buildHookPrompt = (formState: HookGenerateFormState): string => {
    const tone = formState.tone.trim() || 'bahasa sehari hari yang informal';

    return `
    Generate hooks based on the following inputs:
    - Content Description: "${formState.script}"
    - Tone: ${tone}
    - Output Language: ${formState.outputLanguage}
    
    Generate one hook for EACH of the 12 frameworks.
    `;
};

export const generateHooks = async (formState: HookGenerateFormState): Promise<HookGenerationResult> => {
    const config = getApiConfig();
    const userPrompt = buildHookPrompt(formState);
    let responseText = "";

    if (config.provider === 'groq' && config.groqApiKey) {
        const messages = [
            { role: 'system', content: hookSystemInstruction + " Return valid JSON output matching schema: {hooks: [{framework: string, visual_hook: string, voice_over_hook: string}, ...]}" },
            { role: 'user', content: userPrompt }
        ];
        responseText = await callGroqApi(messages, config.groqApiKey, true);
    } else {
        const apiKey = getEffectiveGeminiKey(config);
        const ai = new GoogleGenAI({ apiKey });
        const result = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: userPrompt,
            config: {
                systemInstruction: hookSystemInstruction,
                responseMimeType: 'application/json',
                responseSchema: hookResponseSchema,
            }
        });
        responseText = result.text || "";
    }

    try {
        const parsedJson = JSON.parse(responseText.trim());
        return parsedJson;
    } catch (error) {
        console.error("Gagal hook JSON:", error, "Raw response:", responseText);
        throw new Error("Gagal menghasilkan hook. Respons AI tidak valid.");
    }
};

// --- SCRIPT FORMULA GENERATOR ---

const getFormulaInstructions = (formula: ScriptFormula): string => {
    const instructions: Record<ScriptFormula, { stages: string[] }> = {
        'PAS': { stages: ['Problem', 'Agitate', 'Solution'] },
        'AIDA': { stages: ['Attention', 'Interest', 'Desire', 'Action'] },
        'PASTOR': { stages: ['Problem', 'Amplify', 'Story', 'Transformation', 'Offer', 'Response'] },
        'BAB': { stages: ['Before', 'After', 'Bridge'] },
        'STAR': { stages: ['Situation', 'Task', 'Action', 'Result'] },
        'ObjectionHandling': { stages: ['IdentifyObjection', 'ValidateObjection', 'ProvideCounterpoint', 'ShowProof'] },
        'BFAC': { stages: ['BigPromise', 'Feature', 'Advantage', 'CallToAction'] },
        'HPR': { stages: ['Hook', 'Problem', 'Resolution'] },
        'FPO': { stages: ['Feature', 'Proof', 'Outcome'] },
        'HerosJourney': { stages: ['OrdinaryWorld', 'CallToAdventure', 'Struggle', 'Transformation'] },
        'ComparisonContrast': { stages: ['IntroduceOptionA', 'IntroduceOptionB', 'HighlightKeyDifference', 'DeclareWinner'] },
        'FourP': { stages: ['Promise', 'Picture', 'Proof', 'Push'] },
    };
    return `Ikuti formula ${formula}. Struktur skrip harus terdiri dari tahapan berikut secara urut: ${instructions[formula].stages.join(', ')}.`;
};

const scriptFromFormulaSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        hook: { type: Type.STRING, description: "The single best, strongest hook optimized for the script." },
        hook_variations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, description: "Type of hook (e.g., Fear-based, Curiosity)" },
                    hook: { type: Type.STRING, description: "The hook text" },
                    usage: { type: Type.STRING, description: "Visual or Voice-over recommendation" }
                },
                required: ['type', 'hook', 'usage']
            }
        },
        body: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    stage: { type: Type.STRING },
                    content: { type: Type.STRING },
                },
                required: ['stage', 'content'],
            },
        },
        cta: { type: Type.STRING },
        delivery_notes: { type: Type.STRING },
    },
    required: ['title', 'hook', 'body', 'cta', 'delivery_notes'],
};

export const generateScriptFromFormula = async (formState: ScriptFormState, revisionTweak?: string): Promise<GeneratedScript> => {
    const config = getApiConfig();
    const formulaInst = getFormulaInstructions(formState.formula);
    
    const scriptSystemInstruction = `You are a Script Generator Expert and a HOOK OPTIMIZER (storytelling and copywriting expert).

    **YOUR PRIMARY JOB IS HOOK OPTIMIZATION:**
    Saat menerima input untuk script, kamu harus menganalisa dan mengoptimasi bagian "HOOK" secara agresif sehingga:
    1. Memanfaatkan frameworks "3 Detik Penentu" (Fear, Urgency, Curiosity, Value, Relatability, Question, Contrarian, dll).
    2. Menyesuaikan jenis hook dengan formula storytelling yang dipilih user (misal: PAS prefer Problem Hook, BAB prefer Transformation Hook).
    3. Menggunakan kalimat sangat singkat (3-7 kata untuk visual, 1-2 baris padat untuk voice), tanpa filler, to the point, dan memicu emosi/penasaran.
    4. Menyediakan 2-3 variasi hook berbeda (A/B testing) dalam field 'hook_variations'.

    **CORE SCRIPT GENERATION RULES:**
    - Generate complete script based on user inputs and formula frameworks (PAS, AIDA, STAR, etc.).
    - **Integrate product/solution naturally** according to audience awareness and storytelling framework.
    - Adjust tone/voice strictly to user preference.
    - For 'Educational' goals, use product as a case study or tool.
    - For 'Selling' goals, pitch directly but elegantly.
    - Ensure CTA connects personally with the product/solution.

    **BRAINSTORMING STEP:**
    Analyze the topic, audience, goal, and formula. Determine the most effective psychological triggers for the HOOKS. Then construct the full script around these powerful openers.

    Return valid JSON strictly matching the schema.`;

    let userPrompt = `
    DOKUMEN INPUT GENERATOR:
    - Formula: ${formState.formula}
    - Tipe User: ${formState.user_type === 'others' ? formState.user_type_other : formState.user_type}
    - Tujuan Konten: ${formState.goal === 'others' ? formState.goal_other : formState.goal}
    - Target Durasi: ${formState.duration} detik
    - Target Audiens: ${formState.audience}
    - Awareness Audiens: ${formState.awareness}
    - Topik & Poin Utama: ${formState.topic_and_points}
    - Produk / Solusi: ${formState.offer || 'N/A'}
    - Gaya & Persona: ${formState.style_and_persona}
    - Call to Action (CTA): ${formState.cta}

    STRUKTUR FORMULA: ${formulaInst}
    `;
    
    if (revisionTweak) {
        userPrompt += `\n\nPERINTAH REVISI KHUSUS: ${revisionTweak}. Mohon sesuaikan skrip sebelumnya dengan instruksi revisi ini tanpa merusak struktur formula.`;
    }

    let responseText = "";

    if (config.provider === 'groq' && config.groqApiKey) {
        const messages = [
            { role: 'system', content: scriptSystemInstruction + " Return Valid JSON strictly matching the schema." },
            { role: 'user', content: userPrompt }
        ];
        responseText = await callGroqApi(messages, config.groqApiKey, true);
    } else {
        const apiKey = getEffectiveGeminiKey(config);
        const ai = new GoogleGenAI({ apiKey });
        
        // Menggunakan thinking budget untuk Gemini-3 agar "brainstorming" lebih berkualitas
        const result = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: userPrompt,
            config: {
                systemInstruction: scriptSystemInstruction,
                responseMimeType: 'application/json',
                responseSchema: scriptFromFormulaSchema,
                thinkingConfig: { thinkingBudget: 4000 }
            }
        });
        responseText = result.text || "";
    }

    try {
        return JSON.parse(responseText.trim());
    } catch (error) {
        console.error("Gagal script JSON:", error, "Raw response:", responseText);
        throw new Error("Gagal menghasilkan script. Respons AI tidak valid.");
    }
};

// --- PROMPT GENERATOR ---

const promptGeneratorSystemInstruction = `You are an Expert Prompt Generator. Structure: [ROLE], [CONTEXT], [INSTRUCTIONS], [CONSTRAINTS], [OUTPUT FORMAT].`;

export const generateDetailedPrompt = async (formState: PromptFormState): Promise<string> => {
    const config = getApiConfig();
    const content = `Generate prompt for: "${formState.userInput}"`;

    if (config.provider === 'groq' && config.groqApiKey) {
        return callGroqApi([
            { role: 'system', content: promptGeneratorSystemInstruction },
            { role: 'user', content: content }
        ], config.groqApiKey, false);
    } else {
        const apiKey = getEffectiveGeminiKey(config);
        const ai = new GoogleGenAI({ apiKey });
        const result = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: content,
            config: { systemInstruction: promptGeneratorSystemInstruction }
        });
        return result.text ?? '';
    }
};

// --- YOUTUBE OPTIMIZER ---

const youtubeOptimizerSystemInstruction = `You are a YouTube Content Optimization Expert.
GENERATE EXACTLY 10 High-Performing Titles using these 10 specific formulas (one title per formula):
1. **Bold Statement + Supporting Detail**
2. **How-To Transformation**
3. **Time-Bound Promise**
4. **Routine/System Reveal**
5. **Disappear/Transformation**
6. **Identity Transformation**
7. **Contrarian/Death Of**
8. **Metaphor/Unique Framing**
9. **Future-Focused Warning**
10. **Skill/Value Declaration**

GENERATE DESCRIPTION with [HOOK], [MAIN DESCRIPTION], [TIMESTAMPS], etc.
GENERATE HASHTAGS in 3 tiers (Specific, Broad, Viral).
GENERATE TAGS (comma separated, max 500 chars).
Output JSON only.`;

const youtubeOptimizerSchema = {
    type: Type.OBJECT,
    properties: {
        analysis: { type: Type.STRING },
        titles: { type: Type.ARRAY, items: { type: Type.STRING } },
        title_strategy: { type: Type.STRING },
        description: { type: Type.STRING },
        hashtags: {
            type: Type.OBJECT,
            properties: {
                tier1: { type: Type.ARRAY, items: { type: Type.STRING } },
                tier2: { type: Type.ARRAY, items: { type: Type.STRING } },
                tier3: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['tier1', 'tier2', 'tier3'],
        },
        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ['analysis', 'titles', 'title_strategy', 'description', 'hashtags', 'tags'],
};

export const generateYoutubeOptimization = async (formState: YoutubeOptimizerFormState): Promise<YoutubeOptimizerResult> => {
    const config = getApiConfig();
    const prompt = `Content: ${formState.contentInput}\nLanguage: ${formState.outputLanguage}`;
    let responseText = "";

    if (config.provider === 'groq' && config.groqApiKey) {
        const messages = [
            { role: 'system', content: youtubeOptimizerSystemInstruction + " Return Valid JSON." },
            { role: 'user', content: prompt }
        ];
        responseText = await callGroqApi(messages, config.groqApiKey, true);
    } else {
        const apiKey = getEffectiveGeminiKey(config);
        const ai = new GoogleGenAI({ apiKey });
        const result = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                systemInstruction: youtubeOptimizerSystemInstruction,
                responseMimeType: 'application/json',
                responseSchema: youtubeOptimizerSchema,
            }
        });
        responseText = result.text || "";
    }

    try {
        const parsedJson: GeminiYoutubeResponse = JSON.parse(responseText.trim());
        const rawTags = parsedJson.tags || [];
        let compiledTags = "";
        for (const tag of rawTags) {
            const potentialString = compiledTags ? `${compiledTags}, ${tag}` : tag;
            if (potentialString.length > 500) break;
            compiledTags = compiledTags ? `${compiledTags}, ${tag}` : tag;
        }

        return {
            analysis: parsedJson.analysis,
            titles: parsedJson.titles || [],
            titleStrategy: parsedJson.title_strategy,
            description: parsedJson.description,
            hashtags: parsedJson.hashtags || { tier1: [], tier2: [], tier3: [] },
            tags: compiledTags,
        };
    } catch (error) {
        console.error("Gagal youtube:", error);
        throw new Error("Gagal optimasi YouTube.");
    }
};

// --- THUMBNAIL GENERATOR SERVICE ---

// Helper function to generate a single image variation
const generateSingleThumbnail = async (ai: GoogleGenAI, formState: ThumbnailFormState, variationPrompt: string, aspectRatio: string): Promise<string> => {
    const style = formState.style === 'others' ? formState.style_other : formState.style;
    const resolutionText = formState.orientation === 'vertical' ? '1080x1920' : '1280x720';

    let prompt = `Create a high-quality YouTube thumbnail. 
    Format: ${formState.orientation}. 
    Aspect Ratio: ${aspectRatio}.
    Target Resolution: ${resolutionText}.
    Style: ${style}. 
    Description: ${formState.description}. 
    ${formState.include_text ? `Include text (Language: ${formState.language}) that matches the vibe.` : "No text."}
    Variation: ${variationPrompt}.
    Make it high contrast, click-worthy, and professional.`;

    const contents: any[] = [];
    
    if (formState.referenceImage) {
        const base64Data = formState.referenceImage.split(',')[1] || formState.referenceImage;
        contents.push({
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data
            }
        });
        prompt += " IMPORTANT: Use the person/character in the attached image as the main subject of the thumbnail. Maintain their likeness.";
    }

    contents.push({ text: prompt });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: contents },
        config: {
            imageConfig: { aspectRatio: aspectRatio }
        }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    
    throw new Error("No image generated in response.");
};

export const generateThumbnails = async (formState: ThumbnailFormState): Promise<ThumbnailGenerationResult> => {
    const config = getApiConfig();

    // WARNING: Groq does not support Image Generation. Force fallback or Error.
    if (config.provider === 'groq') {
        // Option 1: Error out
        // throw new Error("Groq API tidak mendukung pembuatan gambar. Harap ubah ke 'App API' atau 'Gemini API' di Pengaturan.");
        
        // Option 2: Fallback silently to App Key/Gemini logic (User Experience is better)
        console.warn("Groq selected but does not support images. Falling back to Gemini logic.");
    }

    // Always use Gemini logic for thumbnails
    const apiKey = getEffectiveGeminiKey(config); // This handles 'app' and 'gemini' cases, and 'groq' case falls back to app key.
    
    if (!apiKey) {
         throw new Error("API Key Gemini diperlukan untuk membuat thumbnail (Groq tidak mendukung gambar). Harap atur di Pengaturan.");
    }

    const ai = new GoogleGenAI({ apiKey });

    const aspectRatio = formState.orientation === 'vertical' ? '9:16' : '16:9';
    const variations = [
        "Focus on a close-up, highly emotional expression or focal point.",
        "Focus on an action shot or dynamic composition with strong movement.",
        "Focus on a high-contrast, artistic or minimalist composition."
    ];

    try {
        const imagePromises = variations.map(variation => 
            generateSingleThumbnail(ai, formState, variation, aspectRatio)
                .catch(err => {
                    console.error("Failed to generate one variation:", err);
                    return null;
                })
        );

        const results = await Promise.all(imagePromises);
        const validImages = results.filter((img): img is string => img !== null);

        if (validImages.length === 0) {
            throw new Error("Gagal menghasilkan semua gambar thumbnail.");
        }

        return { images: validImages };
    } catch (error) {
        console.error("Gagal thumbnail:", error);
        throw new Error("Gagal generate thumbnail. Pastikan API Key valid.");
    }
};
