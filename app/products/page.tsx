'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Star,
  ExternalLink,
  Filter,
  Loader2,
  ShoppingBag,
  ChevronDown,
} from 'lucide-react';

interface ProductData {
  id: string;
  name: string;
  name_ko?: string;
  brand: string;
  category: string;
  ingredients: {
    primary: string[];
    full_list: string[];
  };
  price_usd?: number;
  price_krw?: number;
  rating?: number;
  review_count?: number;
  image_url?: string;
  affiliate_links?: {
    amazon?: string;
    coupang?: string;
    yesstyle?: string;
  };
  description?: {
    en?: string;
    ko?: string;
  };
}

const CATEGORIES = [
  { value: 'all', label: 'All Products' },
  { value: 'cleanser', label: 'Cleansers' },
  { value: 'toner', label: 'Toners' },
  { value: 'serum', label: 'Serums' },
  { value: 'moisturizer', label: 'Moisturizers' },
  { value: 'sunscreen', label: 'Sunscreens' },
  { value: 'mask', label: 'Masks' },
];

const SORT_OPTIONS = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
];

export default function ProductsPageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={40} className="text-primary-500 animate-spin" />
      </div>
    }>
      <ProductsPage />
    </Suspense>
  );
}

function ProductsPage() {
  const searchParams = useSearchParams();
  const ingredientFilter = searchParams.get('ingredient');

  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('rating');
  const [total, setTotal] = useState(0);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (ingredientFilter) params.set('ingredient', ingredientFilter);
      if (category !== 'all') params.set('category', category);
      params.set('sort', sort);

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
        setTotal(data.meta.total);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [ingredientFilter, category, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <Link
        href="/results"
        className="inline-flex items-center text-neutral-600 hover:text-primary-500 transition-colors mb-8"
      >
        <ArrowLeft size={18} className="mr-2" />
        Back to Results
      </Link>

      <div className="mb-8">
        <h1 className="text-h1 font-heading mb-3">
          <ShoppingBag className="inline-block mr-3 text-primary-500" size={32} />
          K-Beauty Products
        </h1>
        {ingredientFilter && (
          <p className="text-neutral-500">
            Showing products with <span className="font-semibold text-primary-500">{ingredientFilter}</span>
            {' '}&middot;{' '}
            <Link href="/products" className="underline hover:text-primary-500">
              Clear filter
            </Link>
          </p>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        {/* Category Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={16} className="text-neutral-400" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === cat.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="ml-auto relative">
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none bg-white border border-neutral-200 rounded-lg px-4 py-2 pr-8 text-sm text-neutral-700 cursor-pointer hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Results Count */}
      {!loading && (
        <p className="text-sm text-neutral-500 mb-6">
          {total} product{total !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={40} className="text-primary-500 animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="card text-center py-16">
          <ShoppingBag className="mx-auto mb-4 text-neutral-300" size={48} />
          <h3 className="text-h3 mb-2">No Products Found</h3>
          <p className="text-neutral-500 mb-4">
            Try adjusting your filters or browse all products.
          </p>
          <button
            onClick={() => {
              setCategory('all');
              setSort('rating');
            }}
            className="btn-primary"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Product Card ----------

function ProductCard({ product }: { product: ProductData }) {
  const trackClick = async (source: string, url: string) => {
    try {
      await fetch('/api/track-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'affiliate_click',
          product_id: product.id,
          affiliate_source: source,
          url,
        }),
      });
    } catch {
      // Non-blocking tracking
    }
  };

  const affiliateLinks = product.affiliate_links || {};
  const primaryLink =
    affiliateLinks.amazon || affiliateLinks.yesstyle || affiliateLinks.coupang;

  return (
    <div className="card flex flex-col h-full">
      {/* Image */}
      {product.image_url && (
        <div className="w-full h-48 bg-neutral-100 rounded-lg mb-4 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1">
        <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">
          {product.brand}
        </p>
        <h3 className="font-semibold text-neutral-900 mb-1 leading-snug">
          {product.name}
        </h3>
        {product.name_ko && (
          <p className="text-xs text-neutral-400 mb-2">{product.name_ko}</p>
        )}

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1.5 mb-2">
            <Star size={14} className="text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium text-neutral-700">
              {product.rating.toFixed(1)}
            </span>
            {product.review_count && (
              <span className="text-xs text-neutral-400">
                ({product.review_count.toLocaleString()})
              </span>
            )}
          </div>
        )}

        {/* Primary Ingredients */}
        <div className="flex flex-wrap gap-1 mb-3">
          {product.ingredients.primary.slice(0, 3).map((ing) => (
            <span
              key={ing}
              className="text-xs bg-secondary-50 text-secondary-700 px-2 py-0.5 rounded-full"
            >
              {ing}
            </span>
          ))}
        </div>

        {/* Description */}
        {product.description?.en && (
          <p className="text-sm text-neutral-500 line-clamp-2 mb-3">
            {product.description.en}
          </p>
        )}
      </div>

      {/* Price & Links */}
      <div className="mt-auto pt-4 border-t border-neutral-100">
        <div className="flex items-center justify-between mb-3">
          {product.price_usd && (
            <span className="text-lg font-bold text-neutral-900">
              ${product.price_usd.toFixed(2)}
            </span>
          )}
          {product.price_krw && (
            <span className="text-sm text-neutral-400">
              {product.price_krw.toLocaleString()}
            </span>
          )}
        </div>

        {/* Affiliate Buttons */}
        <div className="flex gap-2">
          {affiliateLinks.amazon && (
            <a
              href={affiliateLinks.amazon}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick('amazon', affiliateLinks.amazon!)}
              className="flex-1 btn-primary text-center text-sm py-2 flex items-center justify-center gap-1.5"
            >
              Amazon
              <ExternalLink size={12} />
            </a>
          )}
          {affiliateLinks.yesstyle && (
            <a
              href={affiliateLinks.yesstyle}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick('yesstyle', affiliateLinks.yesstyle!)}
              className="flex-1 btn-outline text-center text-sm py-2 flex items-center justify-center gap-1.5"
            >
              YesStyle
              <ExternalLink size={12} />
            </a>
          )}
          {!affiliateLinks.amazon && !affiliateLinks.yesstyle && primaryLink && (
            <a
              href={primaryLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick('other', primaryLink)}
              className="flex-1 btn-primary text-center text-sm py-2 flex items-center justify-center gap-1.5"
            >
              Buy Now
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
