'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import LanguageSelector from './LanguageSelector';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary-500 font-heading">
              SkinSEOUL
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-8">
              <Link
                href="#how-it-works"
                className="text-sm text-neutral-600 hover:text-primary-500 transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="#ingredients"
                className="text-sm text-neutral-600 hover:text-primary-500 transition-colors"
              >
                Ingredients
              </Link>
              <Link
                href="/analyze"
                className="btn-primary text-sm !py-2 !px-4"
              >
                Analyze My Skin
              </Link>
            </nav>
            <LanguageSelector />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-neutral-600 hover:text-primary-500 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 border-t border-neutral-100 mt-2 pt-4 animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link
                href="#how-it-works"
                className="text-sm text-neutral-600 hover:text-primary-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="#ingredients"
                className="text-sm text-neutral-600 hover:text-primary-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Ingredients
              </Link>
              <Link
                href="/analyze"
                className="btn-primary text-sm text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Analyze My Skin
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
