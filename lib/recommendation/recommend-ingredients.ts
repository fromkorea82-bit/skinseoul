import { INGREDIENT_RULES, COMBINATION_BONUSES, IngredientRule } from './ingredient-rules';

export interface RecommendedIngredient {
  name: string;
  name_ko: string;
  priority: number;
  score: number;
  why_needed: string;
  concerns_addressed: string[];
}

interface ConcernInput {
  type: string;
  score: number;
}

interface RecommendationOptions {
  language?: 'en' | 'ko' | 'ja' | 'zh';
  maxIngredients?: number;
}

export function recommendIngredients(
  concerns: ConcernInput[],
  options: RecommendationOptions = {}
): RecommendedIngredient[] {
  const { language = 'en', maxIngredients = 5 } = options;

  // Filter concerns with score >= 0.3 (mild or higher)
  const significantConcerns = concerns
    .filter(c => c.score >= 0.3)
    .sort((a, b) => b.score - a.score);

  if (significantConcerns.length === 0) {
    return getMaintenanceIngredients(language);
  }

  // Calculate ingredient scores
  const ingredientScores = new Map<string, {
    rule: IngredientRule;
    score: number;
    concerns: string[];
  }>();

  // Process each concern
  significantConcerns.forEach(concern => {
    const rules = INGREDIENT_RULES[concern.type] || [];

    rules.forEach(rule => {
      const existing = ingredientScores.get(rule.name);
      // Higher priority (lower number) = higher weight
      const concernScore = concern.score * (6 - rule.priority) / 5;

      if (existing) {
        existing.score += concernScore;
        if (!existing.concerns.includes(concern.type)) {
          existing.concerns.push(concern.type);
        }
      } else {
        ingredientScores.set(rule.name, {
          rule,
          score: concernScore,
          concerns: [concern.type],
        });
      }
    });
  });

  // Apply combination bonuses
  const concernTypes = significantConcerns.map(c => c.type).sort();
  for (let i = 0; i < concernTypes.length; i++) {
    for (let j = i + 1; j < concernTypes.length; j++) {
      const combo = `${concernTypes[i]}+${concernTypes[j]}`;
      const bonusIngredients = COMBINATION_BONUSES[combo];

      if (bonusIngredients) {
        bonusIngredients.forEach(name => {
          const ing = ingredientScores.get(name);
          if (ing) {
            ing.score *= 1.3; // 30% bonus for synergy
          }
        });
      }
    }
  }

  // Sort by score and take top N
  const sortedIngredients = Array.from(ingredientScores.entries())
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, maxIngredients);

  // Format results
  return sortedIngredients.map(([, data], index) => ({
    name: data.rule.name,
    name_ko: data.rule.name_ko,
    priority: index + 1,
    score: Math.round(Math.min(data.score, 1.0) * 100) / 100,
    why_needed: getWhyNeeded(data.rule, language),
    concerns_addressed: Array.from(new Set(data.concerns)),
  }));
}

function getWhyNeeded(rule: IngredientRule, language: string): string {
  const whyNeeded = rule.why_needed[language as keyof typeof rule.why_needed];
  return whyNeeded || rule.why_needed.en;
}

function getMaintenanceIngredients(language: string): RecommendedIngredient[] {
  return [
    {
      name: 'Hyaluronic Acid',
      name_ko: '히알루론산',
      priority: 1,
      score: 0.8,
      why_needed: language === 'ko'
        ? '건강한 피부 유지를 위한 기본 보습'
        : 'Essential hydration for maintaining healthy skin',
      concerns_addressed: ['maintenance'],
    },
    {
      name: 'Niacinamide',
      name_ko: '나이아신아마이드',
      priority: 2,
      score: 0.75,
      why_needed: language === 'ko'
        ? '전반적인 피부 건강 및 예방 케어'
        : 'All-around skin health and preventative care',
      concerns_addressed: ['maintenance'],
    },
    {
      name: 'Vitamin C',
      name_ko: '비타민C',
      priority: 3,
      score: 0.7,
      why_needed: language === 'ko'
        ? '항산화 보호 및 피부 광채 유지'
        : 'Antioxidant protection and radiance maintenance',
      concerns_addressed: ['maintenance'],
    },
  ];
}
