'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Droplets,
  Smile,
  Sun,
  Circle,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Loader2,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';

interface ConcernData {
  type: string;
  score: number;
  location?: string;
  severity?: string;
}

interface IngredientData {
  name: string;
  name_ko: string;
  priority: number;
  score: number;
  why_needed: string;
  concerns_addressed: string[];
}

interface ResultsData {
  analysis_id: string;
  concerns: ConcernData[];
  skin_type: string;
  estimated_age_range: string;
  confidence_score: number;
  photo_quality: string;
  analysis_notes?: string;
  recommended_ingredients?: IngredientData[];
  processing_time_ms: number;
}

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedResults = sessionStorage.getItem('analysisResult');

    if (!storedResults) {
      router.push('/analyze');
      return;
    }

    try {
      const parsed = JSON.parse(storedResults);
      setResults(parsed);
    } catch {
      console.error('Failed to parse results');
      router.push('/analyze');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={48} className="text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!results) {
    return null;
  }

  const { concerns, skin_type, confidence_score, recommended_ingredients, analysis_notes } = results;

  const significantConcerns = concerns
    .filter(c => c.score >= 0.4)
    .sort((a, b) => b.score - a.score);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <Link
        href="/analyze"
        className="inline-flex items-center text-neutral-600 hover:text-primary-500 transition-colors mb-8"
      >
        <ArrowLeft size={18} className="mr-2" />
        Analyze Another Photo
      </Link>

      <div className="text-center mb-10">
        <h1 className="text-h1 font-heading mb-3">
          Your Skin Analysis Results
        </h1>
        <p className="text-neutral-500">
          Analyzed with {(confidence_score * 100).toFixed(0)}% confidence
        </p>
      </div>

      {/* Skin Type Card */}
      <div className="card text-center mb-8 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Sparkles className="text-primary-500" size={32} />
        </div>
        <h2 className="text-h2 capitalize mb-2">
          {skin_type.replace(/_/g, ' ')} Skin
        </h2>
        <p className="text-neutral-600 max-w-md mx-auto">
          {getSkinTypeDescription(skin_type)}
        </p>
      </div>

      {/* Analysis Notes */}
      {analysis_notes && (
        <div className="card mb-8 bg-blue-50 border-blue-100">
          <p className="text-sm text-blue-800">{analysis_notes}</p>
        </div>
      )}

      {/* Concerns Section */}
      <div className="mb-10">
        <h2 className="text-h2 font-heading mb-6">
          {significantConcerns.length > 0 ? 'Areas to Focus On' : 'Great News!'}
        </h2>

        {significantConcerns.length > 0 ? (
          <div className="space-y-4">
            {significantConcerns.map((concern) => (
              <ConcernCard key={concern.type} concern={concern} />
            ))}
          </div>
        ) : (
          <div className="card text-center py-10">
            <CheckCircle2 className="mx-auto mb-4 text-secondary-500" size={48} />
            <h3 className="text-h3 mb-2">Your Skin Looks Healthy!</h3>
            <p className="text-neutral-500">
              No significant concerns detected. Keep up your current routine!
            </p>
          </div>
        )}
      </div>

      {/* Recommended Ingredients */}
      {recommended_ingredients && recommended_ingredients.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="text-secondary-500" size={24} />
            <h2 className="text-h2 font-heading">
              Recommended Ingredients for You
            </h2>
          </div>

          <div className="space-y-4">
            {recommended_ingredients.map((ingredient, index) => (
              <IngredientCard
                key={ingredient.name}
                ingredient={ingredient}
                rank={index + 1}
              />
            ))}
          </div>
        </div>
      )}

      {/* CTA to Products */}
      <div className="card text-center mb-8 bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0">
        <h3 className="text-h3 mb-2">Ready to Shop?</h3>
        <p className="mb-6 opacity-90">
          Discover K-Beauty products with these ingredients
        </p>
        <Link
          href="/products"
          className="inline-block bg-white text-primary-500 hover:bg-neutral-100 font-medium px-8 py-3 rounded-lg transition-colors"
        >
          View Product Recommendations
        </Link>
      </div>

      {/* Disclaimer */}
      <div className="card bg-neutral-50 border-neutral-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-neutral-400 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-semibold text-neutral-700 mb-1">
              For Educational Purposes Only
            </h4>
            <p className="text-sm text-neutral-500">
              This AI analysis is not a substitute for professional medical advice.
              For skin concerns, please consult a licensed dermatologist.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Helper Components ----------

function ConcernCard({ concern }: { concern: ConcernData }) {
  const severity = concern.severity || getSeverityFromScore(concern.score);
  const colors = getSeverityColor(severity);
  const Icon = getConcernIcon(concern.type);

  return (
    <div className="card">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center shrink-0`}>
          <Icon className={colors.text} size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-neutral-900 capitalize">
              {concern.type.replace(/_/g, ' ')}
            </h3>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.badge}`}>
              {severity}
            </span>
          </div>
          {concern.location && (
            <p className="text-sm text-neutral-500 mb-2">
              Location: {concern.location}
            </p>
          )}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-neutral-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${colors.bar} transition-all duration-500`}
                style={{ width: `${concern.score * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-neutral-700 w-10 text-right">
              {(concern.score * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function IngredientCard({ ingredient, rank }: { ingredient: IngredientData; rank: number }) {
  return (
    <div className="card">
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-secondary-700">#{rank}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="font-semibold text-neutral-900">{ingredient.name}</h3>
              <p className="text-xs text-neutral-400">{ingredient.name_ko}</p>
            </div>
            <div className="flex items-center gap-1 text-secondary-600">
              <TrendingUp size={14} />
              <span className="text-sm font-medium">
                {(ingredient.score * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          <p className="text-sm text-neutral-600 mb-2">{ingredient.why_needed}</p>
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {ingredient.concerns_addressed.map((c) => (
                <span
                  key={c}
                  className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full capitalize"
                >
                  {c.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
            <Link
              href={`/products?ingredient=${encodeURIComponent(ingredient.name)}`}
              className="shrink-0 text-xs font-medium text-primary-500 hover:text-primary-600 flex items-center gap-1 transition-colors"
            >
              View Products
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Helper Functions ----------

function getSkinTypeDescription(skinType: string): string {
  const descriptions: Record<string, string> = {
    dry: 'Your skin tends to be tight and may lack moisture. Focus on hydrating products.',
    oily: 'Your skin produces excess sebum. Look for oil-control and pore-refining products.',
    combination: 'Your T-zone is oily while cheeks are normal/dry. Balance is key.',
    normal: 'Lucky you! Your skin is well-balanced. Maintain with gentle care.',
    sensitive: 'Your skin is reactive and needs gentle, soothing products.',
  };
  return descriptions[skinType] || 'Your unique skin type needs a tailored routine.';
}

function getSeverityFromScore(score: number): string {
  if (score >= 0.7) return 'severe';
  if (score >= 0.5) return 'moderate';
  return 'mild';
}

function getSeverityColor(severity: string) {
  const colors = {
    mild: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-700',
      bar: 'bg-blue-500',
    },
    moderate: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-600',
      badge: 'bg-yellow-100 text-yellow-700',
      bar: 'bg-yellow-500',
    },
    severe: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      badge: 'bg-red-100 text-red-700',
      bar: 'bg-red-500',
    },
  };
  return colors[severity as keyof typeof colors] || colors.mild;
}

function getConcernIcon(type: string): LucideIcon {
  const icons: Record<string, LucideIcon> = {
    dehydration: Droplets,
    fine_lines: Smile,
    hyperpigmentation: Sun,
    enlarged_pores: Circle,
    acne_prone: AlertCircle,
    redness_sensitivity: AlertCircle,
    dullness: Sun,
    oily_skin: Droplets,
  };
  return icons[type] || Circle;
}
