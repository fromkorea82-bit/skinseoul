import Link from 'next/link';
import { Camera, Sparkles, Globe, CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-secondary-50 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-display font-heading mb-6 text-neutral-900 animate-slide-up">
              Seoul&apos;s Secret to <br />
              <span className="text-primary-500">Your Best Skin</span>
            </h1>
            <p className="text-xl md:text-2xl text-neutral-600 mb-8 animate-fade-in">
              AI-powered skin analysis meets K-Beauty expertise.<br />
              Get personalized Korean skincare recommendations in seconds.
            </p>
            <Link
              href="/analyze"
              className="inline-flex items-center btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-shadow"
            >
              <Camera className="mr-2" size={24} />
              Analyze My Skin Now
            </Link>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6 text-sm text-neutral-500">
              <div className="flex items-center">
                <CheckCircle2 className="mr-2 text-secondary-500" size={16} />
                Free Forever
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="mr-2 text-secondary-500" size={16} />
                No Sign Up Required
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="mr-2 text-secondary-500" size={16} />
                Results in 10 Seconds
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-h1 font-heading text-center mb-16">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="text-primary-500" size={32} />
              </div>
              <h3 className="text-h3 mb-3">1. Take a Selfie</h3>
              <p className="text-neutral-600">
                Snap a quick photo or upload an existing one.
                No fancy equipment needed.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-secondary-500" size={32} />
              </div>
              <h3 className="text-h3 mb-3">2. AI Analysis</h3>
              <p className="text-neutral-600">
                Our AI analyzes your skin for hydration, texture,
                fine lines, and more in seconds.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="text-primary-500" size={32} />
              </div>
              <h3 className="text-h3 mb-3">3. Get Recommendations</h3>
              <p className="text-neutral-600">
                Receive personalized K-Beauty product suggestions
                tailored to your skin&apos;s needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-neutral-50">
        <div className="container mx-auto px-4">
          <h2 className="text-h1 font-heading text-center mb-4">
            Why SkinSEOUL?
          </h2>
          <p className="text-center text-neutral-600 mb-16 max-w-2xl mx-auto">
            Bridging Korean beauty expertise with AI technology to help you
            discover your perfect skincare routine.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              title="AI-Powered Analysis"
              description="Advanced computer vision analyzes 8 key skin concerns with dermatologist-level accuracy."
              icon="🤖"
            />
            <FeatureCard
              title="K-Beauty Expertise"
              description="Curated recommendations from Seoul's best skincare brands and ingredients."
              icon="🇰🇷"
            />
            <FeatureCard
              title="Personalized Results"
              description="Get ingredient recommendations tailored specifically to your skin's unique needs."
              icon="✨"
            />
            <FeatureCard
              title="Privacy First"
              description="Your photos are never stored. Analysis happens instantly and securely."
              icon="🔒"
            />
            <FeatureCard
              title="Multi-Language"
              description="Available in English, Japanese, and Chinese for global K-Beauty lovers."
              icon="🌏"
            />
            <FeatureCard
              title="Always Free"
              description="No subscriptions, no hidden fees. Just honest skincare guidance."
              icon="💝"
            />
          </div>
        </div>
      </section>

      {/* Ingredients Preview */}
      <section id="ingredients" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-h1 font-heading text-center mb-4">
            Popular K-Beauty Ingredients
          </h2>
          <p className="text-center text-neutral-600 mb-16 max-w-2xl mx-auto">
            Discover the power of Korean skincare science
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <IngredientCard
              name="Hyaluronic Acid"
              nameKo="히알루론산"
              benefit="Deep Hydration"
            />
            <IngredientCard
              name="Niacinamide"
              nameKo="나이아신아마이드"
              benefit="Brightening & Pores"
            />
            <IngredientCard
              name="Centella Asiatica"
              nameKo="병풀"
              benefit="Soothing & Repair"
            />
            <IngredientCard
              name="Snail Mucin"
              nameKo="달팽이 점액"
              benefit="Healing & Glow"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-h1 font-heading mb-6">
            Ready to Discover Your Perfect Routine?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands discovering their best skin with K-Beauty
          </p>
          <Link
            href="/analyze"
            className="inline-flex items-center bg-white text-primary-500 hover:bg-neutral-100 font-medium text-lg px-8 py-4 rounded-lg transition-colors shadow-lg"
          >
            <Camera className="mr-2" size={24} />
            Start Free Analysis
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, description, icon }: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-h3 mb-2">{title}</h3>
      <p className="text-neutral-600 text-small">{description}</p>
    </div>
  );
}

function IngredientCard({ name, nameKo, benefit }: {
  name: string;
  nameKo: string;
  benefit: string;
}) {
  return (
    <div className="card text-center hover:shadow-md transition-shadow">
      <h4 className="font-semibold text-neutral-900 mb-1">{name}</h4>
      <p className="text-sm text-neutral-500 mb-3">{nameKo}</p>
      <span className="inline-block bg-secondary-100 text-secondary-700 text-xs px-3 py-1 rounded-full">
        {benefit}
      </span>
    </div>
  );
}
