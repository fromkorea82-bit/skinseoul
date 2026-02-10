export interface IngredientRule {
  name: string;
  name_ko: string;
  name_ja?: string;
  name_zh?: string;
  priority: number;
  addresses_concerns: string[];
  why_needed: {
    en: string;
    ko?: string;
    ja?: string;
    zh?: string;
  };
}

export const INGREDIENT_RULES: Record<string, IngredientRule[]> = {
  dehydration: [
    {
      name: 'Hyaluronic Acid',
      name_ko: '히알루론산',
      name_ja: 'ヒアルロン酸',
      name_zh: '透明质酸',
      priority: 1,
      addresses_concerns: ['dehydration', 'fine_lines'],
      why_needed: {
        en: 'Holds up to 1000x its weight in water, providing intense hydration and plumping dehydrated skin',
        ko: '자체 무게의 1000배까지 수분을 보유하여 강력한 보습 효과 제공',
      },
    },
    {
      name: 'Glycerin',
      name_ko: '글리세린',
      priority: 2,
      addresses_concerns: ['dehydration'],
      why_needed: {
        en: 'Attracts moisture from the air and deeper skin layers, maintaining long-lasting hydration',
        ko: '공기와 피부 깊은 층에서 수분을 끌어당겨 지속적인 보습 유지',
      },
    },
    {
      name: 'Ceramide',
      name_ko: '세라마이드',
      priority: 3,
      addresses_concerns: ['dehydration', 'redness_sensitivity'],
      why_needed: {
        en: 'Strengthens skin barrier to prevent moisture loss and protect against irritation',
        ko: '피부 장벽 강화로 수분 손실 방지 및 자극으로부터 보호',
      },
    },
  ],

  fine_lines: [
    {
      name: 'Retinol',
      name_ko: '레티놀',
      priority: 1,
      addresses_concerns: ['fine_lines', 'hyperpigmentation'],
      why_needed: {
        en: 'Boosts collagen production and accelerates cell turnover to reduce wrinkles',
        ko: '콜라겐 생성 촉진 및 세포 재생 가속화로 주름 개선',
      },
    },
    {
      name: 'Peptides',
      name_ko: '펩타이드',
      priority: 2,
      addresses_concerns: ['fine_lines'],
      why_needed: {
        en: 'Signals skin to produce more collagen, improving firmness and elasticity',
        ko: '콜라겐 생성 신호 전달로 탄력과 유연성 개선',
      },
    },
    {
      name: 'Adenosine',
      name_ko: '아데노신',
      priority: 3,
      addresses_concerns: ['fine_lines'],
      why_needed: {
        en: 'Korean anti-aging powerhouse that smooths fine lines and boosts skin energy',
        ko: 'K-뷰티 안티에이징 성분으로 잔주름 완화 및 피부 에너지 증진',
      },
    },
  ],

  hyperpigmentation: [
    {
      name: 'Vitamin C',
      name_ko: '비타민C',
      priority: 1,
      addresses_concerns: ['hyperpigmentation', 'dullness'],
      why_needed: {
        en: 'Fades dark spots, brightens skin tone, and provides antioxidant protection',
        ko: '다크 스팟 완화, 피부 톤 개선, 항산화 보호 제공',
      },
    },
    {
      name: 'Niacinamide',
      name_ko: '나이아신아마이드',
      priority: 2,
      addresses_concerns: ['hyperpigmentation', 'enlarged_pores', 'oily_skin'],
      why_needed: {
        en: 'Multi-tasking ingredient that brightens, minimizes pores, and controls oil',
        ko: '미백, 모공 축소, 피지 조절의 다기능 성분',
      },
    },
    {
      name: 'Alpha Arbutin',
      name_ko: '알파 알부틴',
      priority: 3,
      addresses_concerns: ['hyperpigmentation'],
      why_needed: {
        en: 'Gentle brightening agent that inhibits melanin production without irritation',
        ko: '자극 없이 멜라닌 생성을 억제하는 순한 미백 성분',
      },
    },
  ],

  enlarged_pores: [
    {
      name: 'Niacinamide',
      name_ko: '나이아신아마이드',
      priority: 1,
      addresses_concerns: ['enlarged_pores', 'oily_skin', 'hyperpigmentation'],
      why_needed: {
        en: 'Regulates sebum and refines pore appearance for smoother texture',
        ko: '피지 조절 및 모공 축소로 매끈한 피부 결 개선',
      },
    },
    {
      name: 'BHA (Salicylic Acid)',
      name_ko: 'BHA (살리실산)',
      priority: 2,
      addresses_concerns: ['enlarged_pores', 'acne_prone', 'oily_skin'],
      why_needed: {
        en: 'Oil-soluble exfoliant that unclogs pores and prevents blackheads',
        ko: '유용성 각질 제거제로 모공 청소 및 블랙헤드 예방',
      },
    },
  ],

  acne_prone: [
    {
      name: 'Tea Tree Oil',
      name_ko: '티트리 오일',
      priority: 1,
      addresses_concerns: ['acne_prone'],
      why_needed: {
        en: 'Natural antibacterial that fights acne-causing bacteria and reduces inflammation',
        ko: '천연 항균 성분으로 여드름균 억제 및 염증 완화',
      },
    },
    {
      name: 'Centella Asiatica',
      name_ko: '병풀 (시카)',
      priority: 2,
      addresses_concerns: ['acne_prone', 'redness_sensitivity'],
      why_needed: {
        en: 'Korean healing herb that soothes breakouts and repairs damaged skin',
        ko: 'K-뷰티 대표 진정 성분으로 여드름 진정 및 손상 피부 회복',
      },
    },
    {
      name: 'BHA (Salicylic Acid)',
      name_ko: 'BHA (살리실산)',
      priority: 3,
      addresses_concerns: ['acne_prone', 'enlarged_pores'],
      why_needed: {
        en: 'Penetrates pores to dissolve buildup and prevent new breakouts',
        ko: '모공 깊숙이 침투하여 각질 용해 및 여드름 예방',
      },
    },
  ],

  redness_sensitivity: [
    {
      name: 'Centella Asiatica',
      name_ko: '병풀 (시카)',
      priority: 1,
      addresses_concerns: ['redness_sensitivity', 'acne_prone'],
      why_needed: {
        en: 'Calms irritation, reduces redness, and strengthens sensitive skin barrier',
        ko: '자극 진정, 붉은기 완화, 민감 피부 장벽 강화',
      },
    },
    {
      name: 'Panthenol (Pro-Vitamin B5)',
      name_ko: '판테놀',
      priority: 2,
      addresses_concerns: ['redness_sensitivity', 'dehydration'],
      why_needed: {
        en: 'Deeply moisturizes and soothes irritated, reactive skin',
        ko: '깊은 보습 제공 및 자극받은 피부 진정',
      },
    },
    {
      name: 'Madecassoside',
      name_ko: '마데카소사이드',
      priority: 3,
      addresses_concerns: ['redness_sensitivity'],
      why_needed: {
        en: 'Centella derivative with enhanced calming and healing properties',
        ko: '병풀 유래 성분으로 강화된 진정 및 회복 효과',
      },
    },
  ],

  dullness: [
    {
      name: 'Vitamin C',
      name_ko: '비타민C',
      priority: 1,
      addresses_concerns: ['dullness', 'hyperpigmentation'],
      why_needed: {
        en: 'Brightens complexion and boosts radiance with powerful antioxidants',
        ko: '강력한 항산화 효과로 피부 톤 개선 및 광채 부여',
      },
    },
    {
      name: 'AHA (Glycolic Acid)',
      name_ko: 'AHA (글리콜산)',
      priority: 2,
      addresses_concerns: ['dullness'],
      why_needed: {
        en: 'Exfoliates dead skin cells to reveal fresh, glowing skin underneath',
        ko: '각질 제거로 맑고 빛나는 피부 노출',
      },
    },
    {
      name: 'Niacinamide',
      name_ko: '나이아신아마이드',
      priority: 3,
      addresses_concerns: ['dullness', 'hyperpigmentation'],
      why_needed: {
        en: 'Evens skin tone and enhances natural radiance',
        ko: '피부 톤 균일화 및 자연스러운 광채 강화',
      },
    },
  ],

  oily_skin: [
    {
      name: 'Niacinamide',
      name_ko: '나이아신아마이드',
      priority: 1,
      addresses_concerns: ['oily_skin', 'enlarged_pores'],
      why_needed: {
        en: 'Regulates sebum production without stripping skin',
        ko: '피부를 건조하게 만들지 않으면서 피지 분비 조절',
      },
    },
    {
      name: 'BHA (Salicylic Acid)',
      name_ko: 'BHA (살리실산)',
      priority: 2,
      addresses_concerns: ['oily_skin', 'acne_prone', 'enlarged_pores'],
      why_needed: {
        en: 'Controls oil, unclogs pores, and prevents shine',
        ko: '유분 조절, 모공 청소, 번들거림 방지',
      },
    },
    {
      name: 'Tea Tree Oil',
      name_ko: '티트리 오일',
      priority: 3,
      addresses_concerns: ['oily_skin', 'acne_prone'],
      why_needed: {
        en: 'Balances oil production with natural astringent properties',
        ko: '천연 수렴 효과로 피지 분비 균형 조절',
      },
    },
  ],
};

// Combination rules for multiple concerns
export const COMBINATION_BONUSES: Record<string, string[]> = {
  'dehydration+fine_lines': ['Hyaluronic Acid', 'Peptides'],
  'acne_prone+hyperpigmentation': ['Niacinamide', 'Centella Asiatica'],
  'oily_skin+enlarged_pores': ['Niacinamide', 'BHA (Salicylic Acid)'],
  'redness_sensitivity+dehydration': ['Centella Asiatica', 'Panthenol (Pro-Vitamin B5)', 'Ceramide'],
};
