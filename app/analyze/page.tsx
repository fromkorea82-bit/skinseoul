'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CameraCapture from '@/components/analyze/CameraCapture';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AnalyzePage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleImageCapture = async (imageBase64: string) => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/analyze-skin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageBase64,
          language: 'en',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Analysis failed');
      }

      // Store result and navigate
      sessionStorage.setItem('analysisResult', JSON.stringify(data.data));
      router.push('/results');
    } catch (error: unknown) {
      console.error('Analysis failed:', error);
      const message = error instanceof Error ? error.message : 'Analysis failed. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center text-neutral-600 hover:text-primary-500 transition-colors mb-8"
      >
        <ArrowLeft size={18} className="mr-2" />
        Back to Home
      </Link>

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-h1 font-heading mb-4">
          Analyze Your Skin
        </h1>
        <p className="text-neutral-600 max-w-xl mx-auto">
          Take or upload a clear photo of your face for AI-powered skin analysis
        </p>
      </div>

      {/* Tips */}
      <div className="mb-10">
        <div className="card bg-primary-50 border-primary-100">
          <h3 className="font-semibold text-neutral-800 mb-3">
            📸 Tips for Best Results:
          </h3>
          <ul className="space-y-2">
            {[
              'Use good lighting (natural light is best)',
              'Face the camera directly',
              'Remove glasses and keep hair away from face',
              'Use a neutral expression',
              'Ensure photo is clear and not blurry',
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-sm text-neutral-700">
                <span className="text-secondary-500 font-bold shrink-0">✓</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
          {errorMessage}
        </div>
      )}

      {/* Camera Component */}
      {!isAnalyzing && <CameraCapture onImageCapture={handleImageCapture} />}

      {/* Loading State */}
      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <Loader2 size={48} className="text-primary-500 animate-spin" />
          </div>
          <h3 className="text-h3 mt-6 mb-2">Analyzing Your Skin...</h3>
          <p className="text-neutral-500">
            This will take just a few seconds
          </p>
        </div>
      )}
    </div>
  );
}
