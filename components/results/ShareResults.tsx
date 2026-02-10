'use client';

import { Share2 } from 'lucide-react';
import { useState } from 'react';

export default function ShareResults() {
  const [copied, setCopied] = useState(false);

  const shareResults = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My SkinSEOUL Analysis',
          text: 'Check out my K-Beauty skin analysis!',
          url: url,
        });
      } catch {
        // Share cancelled by user
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={shareResults}
      className="btn-outline flex items-center gap-2 text-sm"
    >
      <Share2 size={16} />
      {copied ? 'Link Copied!' : 'Share Results'}
    </button>
  );
}
