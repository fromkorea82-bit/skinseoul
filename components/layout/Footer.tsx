import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-white font-heading">
              SkinSEOUL
            </h3>
            <p className="mt-2 text-sm text-neutral-400">
              Seoul&apos;s Secret to Your Best Skin
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#how-it-works" className="text-sm hover:text-primary-400 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#ingredients" className="text-sm hover:text-primary-400 transition-colors">
                  Ingredients
                </Link>
              </li>
              <li>
                <Link href="/analyze" className="text-sm hover:text-primary-400 transition-colors">
                  Analyze
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm hover:text-primary-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm hover:text-primary-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="text-sm hover:text-primary-400 transition-colors">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Connect</h4>
            <p className="text-sm text-neutral-400">
              For educational purposes only.
              Consult a dermatologist for medical advice.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-neutral-800 text-center text-sm text-neutral-500">
          &copy; {new Date().getFullYear()} SkinSEOUL. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
