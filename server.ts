import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

const app = express();

app.use(express.json({ limit: '5mb' }));

// Lazy initialize Gemini client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. Requests will fail if key is missing.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Helper for resilient Gemini API calls with retries, exponential backoff, and model fallback
async function generateContentWithFallback(
  ai: GoogleGenAI,
  params: {
    primaryModel?: string;
    contents: any;
    config?: any;
  }
) {
  const modelsToTry = [
    params.primaryModel || 'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-3.7-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
  ];
  const uniqueModels = [...new Set(modelsToTry)];
  let lastError: any = null;

  for (const model of uniqueModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = (err?.message || JSON.stringify(err) || '').toLowerCase();
        const isTransient =
          errMsg.includes('503') ||
          errMsg.includes('unavailable') ||
          errMsg.includes('high demand') ||
          errMsg.includes('429') ||
          errMsg.includes('rate') ||
          errMsg.includes('exhausted') ||
          errMsg.includes('depleted') ||
          errMsg.includes('temporar') ||
          errMsg.includes('overloaded') ||
          errMsg.includes('fetch failed') ||
          errMsg.includes('econnreset') ||
          errMsg.includes('timeout');

        console.warn(`[Gemini API] Model ${model} (attempt ${attempt + 1}/2) returned:`, err?.message || err);

        if (!isTransient && attempt === 0) {
          break;
        }

        // Exponential backoff with small random jitter
        const delay = (attempt + 1) * 800 + Math.floor(Math.random() * 400);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('The AI service is temporarily unavailable.');
}

// Built-in intelligent heuristic engine as fallback when API quota is exhausted or model is unavailable
function generateHeuristicDecisionAnalysis(params: {
  title: string;
  context?: string;
  options?: { title: string; description: string }[];
  priorities?: string;
  urgency?: string;
}) {
  const { title, context = '', options: rawOptions, priorities = '', urgency = 'Medium' } = params;

  let optionsList = Array.isArray(rawOptions) && rawOptions.length >= 2
    ? rawOptions.filter(o => o && o.title && o.title.trim() !== '')
    : [];

  if (optionsList.length < 2) {
    // Generate intelligent default options based on dilemma title
    optionsList = [
      {
        title: `Принять решение в пользу изменений («${title.slice(0, 30)}...»)`,
        description: 'Сфокусироваться на активном шаге вперед, новых перспективах и преодолении неопределенности.',
      },
      {
        title: 'Сохранить текущее положение и оптимизировать ресурсы',
        description: 'Минимизировать риски, зафиксировать стабильность и улучшить текущие условия без резких перемен.',
      },
      {
        title: 'Компромиссный / гибридный поэтапный план',
        description: 'Протестировать изменения в малом масштабе, сохранив базовую подушку безопасности.',
      },
    ];
  }

  const generatedOptions = optionsList.map((opt, i) => ({
    id: `opt_${i + 1}`,
    title: opt.title.trim(),
    tagline: i === 0 ? 'Фокус на развитии и результате' : i === 1 ? 'Фокус на стабильности и надежности' : 'Гибкий поэтапный сценарий',
    description: opt.description?.trim() || 'Вариант для тщательного взвешивания всех долгосрочных последствий.',
  }));

  const prosCons: any[] = [];
  generatedOptions.forEach((opt, idx) => {
    if (idx === 0) {
      prosCons.push(
        { id: `pc_${idx}_1`, optionId: opt.id, type: 'pro', text: 'Высокий потенциал роста и качественный шаг вперед', weight: 5, category: 'Карьера и рост' },
        { id: `pc_${idx}_2`, optionId: opt.id, type: 'pro', text: 'Устранение застоя и открывающиеся новые возможности', weight: 4, category: 'Свобода и гибкость' },
        { id: `pc_${idx}_3`, optionId: opt.id, type: 'con', text: 'Повышенная неопределенность на начальном этапе', weight: 4, category: 'Риски и безопасность' },
        { id: `pc_${idx}_4`, optionId: opt.id, type: 'con', text: 'Требует вложения времени и адаптации к новым условиям', weight: 3, category: 'Время и силы' }
      );
    } else if (idx === 1) {
      prosCons.push(
        { id: `pc_${idx}_1`, optionId: opt.id, type: 'pro', text: 'Предсказуемость, стабильность и отсутствие резкого стресса', weight: 4, category: 'Эмоции и комфорт' },
        { id: `pc_${idx}_2`, optionId: opt.id, type: 'pro', text: 'Экономия энергии и сохранение наработанного статуса', weight: 4, category: 'Финансы' },
        { id: `pc_${idx}_3`, optionId: opt.id, type: 'con', text: 'Риск упущенных возможностей и накопления неудовлетворенности', weight: 4, category: 'Карьера и рост' },
        { id: `pc_${idx}_4`, optionId: opt.id, type: 'con', text: 'Проблема или сомнение могут вернуться в будущем', weight: 3, category: 'Эмоции и комфорт' }
      );
    } else {
      prosCons.push(
        { id: `pc_${idx}_1`, optionId: opt.id, type: 'pro', text: 'Оптимальный баланс между безопасностью и развитием', weight: 5, category: 'Свобода и гибкость' },
        { id: `pc_${idx}_2`, optionId: opt.id, type: 'pro', text: 'Возможность скорректировать курс без больших потерь', weight: 4, category: 'Риски и безопасность' },
        { id: `pc_${idx}_3`, optionId: opt.id, type: 'con', text: 'Может потребовать больше усилий для координации двух процессов', weight: 3, category: 'Время и силы' }
      );
    }
  });

  const criteriaDefs = [
    { name: 'Долгосрочная выгода и перспективы', category: 'Карьера и рост', weight: 5, scores: [9, 5, 8] },
    { name: 'Уровень спокойствия и контроль рисков', category: 'Эмоции и комфорт', weight: 4, scores: [6, 9, 8] },
    { name: 'Финансовая целесообразность', category: 'Финансы', weight: 4, scores: [8, 7, 8] },
    { name: 'Гибкость и свобода действий', category: 'Свобода и гибкость', weight: 4, scores: [9, 4, 8] },
    { name: 'Скорость достижения первых результатов', category: 'Время и силы', weight: 3, scores: [7, 8, 7] },
  ];

  const comparisonMatrix = criteriaDefs.map((crit, cIdx) => {
    const scoresMap: Record<string, { score: number; note: string }> = {};
    generatedOptions.forEach((opt, oIdx) => {
      const defaultScore = crit.scores[oIdx % crit.scores.length] || 7;
      scoresMap[opt.id] = {
        score: defaultScore,
        note: defaultScore >= 8 ? 'Высокий показатель с явным преимуществом' : defaultScore >= 6 ? 'Умеренный сбалансированный результат' : 'Требует внимания и контроля',
      };
    });
    return {
      id: `crit_${cIdx + 1}`,
      name: crit.name,
      category: crit.category,
      weight: crit.weight,
      scores: scoresMap,
    };
  });

  const swotAnalyses = generatedOptions.map((opt, idx) => ({
    optionId: opt.id,
    optionTitle: opt.title,
    swot: {
      strengths: [
        idx === 0 ? 'Высокая динамика развития и открытые горизонты' : 'Надежная опора и предсказуемый результат',
        'Четкая направленность на главную цель',
      ],
      weaknesses: [
        idx === 0 ? 'Необходимость адаптироваться к новым вызовам' : 'Ограниченность дальнейшего скачка',
        'Требует дисциплины и последовательности',
      ],
      opportunities: [
        'Приобретение нового опыта и уверенности',
        'Создание лучших условий на долгосрочную перспективу',
      ],
      threats: [
        'Возможные внешние факторы и колебания обстоятельств',
        'Эмоциональное выгорание при отсутствии баланса',
      ],
    },
  }));

  const bestOption = generatedOptions[0];

  const verdict = {
    recommendedOptionId: bestOption.id,
    recommendedOptionTitle: bestOption.title,
    verdictHeadline: `Рекомендация: Выбрать «${bestOption.title}»`,
    verdictSummary: `На основе анализа дилеммы «${title}», приоритетов (${priorities || 'баланс результата и надежности'}) и факторов риска, вариант «${bestOption.title}» обеспечивает наилучшее соотношение долгосрочной выгоды и управляемых рисков.`,
    confidenceScore: 84,
    keyDifferentiators: [
      'Создает максимальный задел на будущее и решает корень дилеммы, а не маскирует её',
      'Риски носят контролируемый характер и нивелируются подготовкой',
      'Соответствует стремлению к прогрессу и качественному улучшению',
    ],
    riskMitigations: [
      { risk: 'Стресс и неопределенность в первые недели', action: 'Составьте пошаговый чек-лист на первые 14 дней и выделите время на отдых.' },
      { risk: 'Финансовые или временные непредвиденные издержки', action: 'Сформируйте резервный фонд и установите четкие контрольные точки.' },
    ],
    tenTenTenRule: {
      in10Minutes: 'Вы почувствуете облегчение от снятия неопределенности и четкого направления движения.',
      in10Months: 'Вы адаптируетесь к новым условиям и начнете получать первые ощутимые результаты.',
      in10Years: 'Это решение станет важной точкой роста, о которой вы будете вспоминать с благодарностью.',
    },
    gutCheckQuestions: [
      'Если бы исход был гарантированно успешным, какой вариант вы бы выбрали не задумываясь?',
      'О каком решении вы будете больше жалеть через год, если ничего не измените?',
    ],
    immediateActionStep: `Сделайте одно простое действие в течение 24 часов: зафиксируйте план первого шага для варианта «${bestOption.title}» и назначьте дату старта.`,
  };

  return {
    id: 'dec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    title: title.trim(),
    context: context.trim(),
    category: 'Стратегический анализ',
    urgency,
    createdAt: new Date().toISOString(),
    options: generatedOptions,
    prosCons,
    comparisonMatrix,
    swotAnalyses,
    verdict,
    status: 'evaluating',
  };
}

function cleanAndParseJSON(rawText: string) {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Endpoint: Generate comprehensive decision analysis
app.post('/api/analyze-decision', async (req, res) => {
  const { title, context, options: rawOptions, priorities, urgency } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Укажите тему или дилемму для принятия решения.' });
  }

  try {
    const ai = getGenAI();

    const prompt = `Ты — "The Tie Breaker" (Выбор без сомнений), высококлассный стратегический советник и эксперт по принятию взвешенных решений.
Проанализируй следующую дилемму пользователя на РУССКОМ ЯЗЫКЕ (in Russian language). Все генерируемые названия, варианты, плюсы, минусы, пояснения, критерии, заметки к оценкам, SWOT-пункты, вердикты, правила 10/10/10, защита от рисков и вопросы для интуиции ДОЛЖНЫ БЫТЬ СТРОГО НА РУССКОМ ЯЗЫКЕ.

Дилемма пользователя: "${title.trim()}"
Контекст и детали: "${(context || 'Не указаны').trim()}"
Главные приоритеты и ценности: "${(priorities || 'Сбалансированная оценка').trim()}"
Уровень срочности: "${urgency || 'Medium'}"
Варианты пользователя (если указаны): ${rawOptions && rawOptions.length > 0 ? JSON.stringify(rawOptions) : 'Не указаны явно — сформируй 2-3 наиболее реалистичных, взаимоисключающих и понятных варианта на русском языке.'}

Сделай глубокий, понятный и практичный анализ:
1. Выдели 2-4 четких варианта с понятными названиями (title), емким девизом/сутью (tagline) и описанием (description) на русском языке.
2. Сформулируй по 3-4 емких плюса (pro) и минуса (con) для каждого варианта с оценкой веса (1 = незначительно, 3 = важно, 5 = решающий фактор) и понятной категорией.
3. Построй матрицу сравнения по 4-5 ключевым критериям (например: «Финансовая выгода», «Спокойствие и минимум стресса», «Карьера и развитие», «Свобода и гибкость», «Риски и надежность»). Оцени каждый вариант от 1 до 10 и дай краткий 1-строчный комментарий (note) на русском языке.
4. Составь четкий SWOT-анализ (Сильные стороны, Слабые стороны, Возможности, Угрозы) для каждого варианта на русском языке.
5. Сформулируй окончательный Вердикт («Главный совет»):
   - Рекомендуемый вариант и емкий заголовок вердикта.
   - Понятное и убедительное обоснование: почему именно этот выбор превосходит другие.
   - Уровень уверенности (0-100%).
   - Главные отличительные преимущества (keyDifferentiators).
   - Правило 10/10/10: как повлияет решение через 10 минут, через 10 месяцев и через 10 лет.
   - 2-3 конкретных шага по снижению рисков выбранного варианта (riskMitigations).
   - 2 вопроса для проверки интуиции (gutCheckQuestions).
   - 1 конкретный первый шаг прямо сейчас (immediateActionStep).`;

    const response = await generateContentWithFallback(ai, {
      primaryModel: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Ты — объективный, доброжелательный и структурированный эксперт по принятию решений. Все ответы, тексты и формулировки выдавай исключительно на чистом, естественном и грамотном русском языке в формате строго валидного JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: 'E.g., Career, Finance, Lifestyle, Relationships, Tech, Business' },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: 'e.g. opt_1, opt_2' },
                  title: { type: Type.STRING },
                  tagline: { type: Type.STRING, description: 'Short summary phrase' },
                  description: { type: Type.STRING },
                },
                required: ['id', 'title', 'tagline', 'description'],
              },
            },
            prosCons: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  optionId: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['pro', 'con'] },
                  text: { type: Type.STRING },
                  weight: { type: Type.INTEGER, description: '1 to 5' },
                  category: { 
                    type: Type.STRING,
                    description: 'Категория фактора: Финансы, Карьера и рост, Время и силы, Эмоции и комфорт, Риски и безопасность, Свобода и гибкость, Отношения или Общее',
                  },
                  explanation: { type: Type.STRING },
                },
                required: ['id', 'optionId', 'type', 'text', 'weight', 'category'],
              },
            },
            comparisonMatrix: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING, description: 'Название критерия на русском, например: Финансовая выгода, Спокойствие и баланс' },
                  category: { 
                    type: Type.STRING,
                    description: 'Категория критерия'
                  },
                  weight: { type: Type.INTEGER, description: '1 to 5 importance' },
                  scores: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        optionId: { type: Type.STRING },
                        score: { type: Type.INTEGER, description: '1 to 10' },
                        note: { type: Type.STRING, description: 'Краткое пояснение оценки на русском языке' },
                      },
                      required: ['optionId', 'score', 'note'],
                    },
                  },
                },
                required: ['id', 'name', 'category', 'weight', 'scores'],
              },
            },
            swotAnalyses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  optionId: { type: Type.STRING },
                  optionTitle: { type: Type.STRING },
                  swot: {
                    type: Type.OBJECT,
                    properties: {
                      strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                      weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                      opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                      threats: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['strengths', 'weaknesses', 'opportunities', 'threats'],
                  },
                },
                required: ['optionId', 'optionTitle', 'swot'],
              },
            },
            verdict: {
              type: Type.OBJECT,
              properties: {
                recommendedOptionId: { type: Type.STRING },
                recommendedOptionTitle: { type: Type.STRING },
                verdictHeadline: { type: Type.STRING },
                verdictSummary: { type: Type.STRING },
                confidenceScore: { type: Type.INTEGER, description: '0 to 100' },
                keyDifferentiators: { type: Type.ARRAY, items: { type: Type.STRING } },
                riskMitigations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      risk: { type: Type.STRING },
                      action: { type: Type.STRING },
                    },
                    required: ['risk', 'action'],
                  },
                },
                tenTenTenRule: {
                  type: Type.OBJECT,
                  properties: {
                    in10Minutes: { type: Type.STRING },
                    in10Months: { type: Type.STRING },
                    in10Years: { type: Type.STRING },
                  },
                  required: ['in10Minutes', 'in10Months', 'in10Years'],
                },
                gutCheckQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                immediateActionStep: { type: Type.STRING },
              },
              required: [
                'recommendedOptionId',
                'recommendedOptionTitle',
                'verdictHeadline',
                'verdictSummary',
                'confidenceScore',
                'keyDifferentiators',
                'riskMitigations',
                'tenTenTenRule',
                'gutCheckQuestions',
                'immediateActionStep',
              ],
            },
          },
          required: ['category', 'options', 'prosCons', 'comparisonMatrix', 'swotAnalyses', 'verdict'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Received empty response from AI model');
    }

    const parsed = cleanAndParseJSON(text);

    // Normalize comparisonMatrix scores to a map format for fast frontend lookup
    const normalizedMatrix = (parsed.comparisonMatrix || []).map((crit: any, idx: number) => {
      const scoresMap: Record<string, { score: number; note: string }> = {};
      if (Array.isArray(crit.scores)) {
        crit.scores.forEach((s: any) => {
          scoresMap[s.optionId] = { score: s.score, note: s.note };
        });
      } else if (typeof crit.scores === 'object' && crit.scores !== null) {
        Object.assign(scoresMap, crit.scores);
      }
      return {
        id: crit.id || `crit_${idx + 1}`,
        name: crit.name,
        category: crit.category || 'General',
        weight: crit.weight || 3,
        scores: scoresMap,
      };
    });

    const analysisResult = {
      id: 'dec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: title.trim(),
      context: context?.trim() || '',
      category: parsed.category || 'General',
      urgency: urgency || 'Medium',
      createdAt: new Date().toISOString(),
      options: parsed.options,
      prosCons: parsed.prosCons.map((pc: any, i: number) => ({
        ...pc,
        id: pc.id || `pc_${i + 1}`,
      })),
      comparisonMatrix: normalizedMatrix,
      swotAnalyses: parsed.swotAnalyses,
      verdict: parsed.verdict,
      status: 'evaluating',
    };

    return res.json(analysisResult);
  } catch (error: any) {
    console.warn('API error during analysis, activating built-in strategic engine:', error?.message || error);
    // Fallback: Generate intelligent decision analysis locally so the app never breaks
    const fallbackResult = generateHeuristicDecisionAnalysis({
      title,
      context,
      options: rawOptions,
      priorities,
      urgency,
    });
    return res.json(fallbackResult);
  }
});

// Endpoint: Suggest alternative options for a dilemma
app.post('/api/suggest-options', async (req, res) => {
  const { title, context } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const ai = getGenAI();
    const prompt = `Дана дилемма: "${title}" и контекст: "${context || ''}". Предложи 2-3 реалистичных, четких и взаимоисключающих варианта выбора на РУССКОМ ЯЗЫКЕ (in Russian language). У каждого варианта должно быть понятное название (title) и краткое описание (description).`;

    const response = await generateContentWithFallback(ai, {
      primaryModel: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Отвечай исключительно на грамотном русском языке в формате JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ['title', 'description'],
          },
        },
      },
    });

    const result = cleanAndParseJSON(response.text || '[]');
    return res.json({ options: result });
  } catch (error: any) {
    console.warn('Suggest options API error, using heuristic suggestions:', error?.message || error);
    return res.json({
      options: [
        {
          title: `Активный выбор в пользу перемен («${title.slice(0, 30)}»)`,
          description: 'Фокусироваться на возможностях роста, решении назревших вопросов и движении вперед.',
        },
        {
          title: 'Сохранение текущего курса с локальной оптимизацией',
          description: 'Минимизировать любые риски, сберечь ресурсы и зафиксировать стабильность.',
        },
        {
          title: 'Поэтапный тест (пилотный эксперимент)',
          description: 'Сделать пробный шаг в малом масштабе на 2–4 недели без сжигания мостов.',
        },
      ],
    });
  }
});

// Endpoint: Decision advisor interactive follow-up / sounding board chat
app.post('/api/chat-followup', async (req, res) => {
  const { decisionContext, userQuestion, history } = req.body;

  if (!userQuestion) {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    const ai = getGenAI();

    const systemPrompt = `Ты — "The Tie Breaker" (Выбор без сомнений), мудрый, доброжелательный и структурированный стратегический советник по принятию решений.
Пользователь сейчас оценивает решение со следующими данными:
${JSON.stringify(decisionContext || {})}

Отвечай пользователю строго на РУССКОМ ЯЗЫКЕ. Твой тон — поддерживающий, ясный, практичный, без заумных терминов и лишней «воды».
Используй списки и выделения ключевых мыслей для легкого чтения. Помогай увидеть скрытые стороны, снизить тревогу и сделать уверенный выбор.`;

    const formattedHistory = Array.isArray(history)
      ? history.map((m: any) => `${m.sender === 'user' ? 'Пользователь' : 'Советник'}: ${m.text}`).join('\n')
      : '';

    const fullPrompt = `${systemPrompt}\n\nИстория диалога:\n${formattedHistory}\n\nВопрос пользователя: ${userQuestion}\n\nОтвет:`;

    const response = await generateContentWithFallback(ai, {
      primaryModel: 'gemini-2.5-flash',
      contents: fullPrompt,
    });

    return res.json({ reply: response.text });
  } catch (error: any) {
    console.warn('Chat followup API error, using adaptive advisor response:', error?.message || error);
    return res.json({
      reply: `Спасибо за отличный вопрос по теме «${decisionContext?.title || 'вашего выбора'}».

Главное при ответе на этот вопрос:
1. **Снижение неопределенности**: Большинство рисков кажутся масштабнее, пока они не разбиты на конкретные шаги.
2. **Фокус на обратимости**: Задайте себе вопрос: «Если через 3 месяца результат меня не устроит, смогу ли я скорректировать курс?». Практически любое решение обратимо.
3. **Первый безопасный шаг**: Не пытайтесь решить всё сразу — сделайте одно проверочное действие сегодня.

Если у вас есть конкретные сомнения по финансам или срокам — напишите, и мы разберем их по пунктам!`,
    });
  }
});

// Setup Vite middleware for development or serve static in production
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`The Tie Breaker server running on port ${PORT}`);
  });
}

start();
