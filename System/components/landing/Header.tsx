"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Building2, Menu, X, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenSignup?: () => void;
}

export default function Header({ onOpenSignup }: HeaderProps) {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [brandData, setBrandData] = useState<{
    logoUrl?: string;
    brandTitle?: string;
    brandBadge?: string;
    brandSubtitle?: string;
  }>({});

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    async function fetchBrand() {
      try {
        const res = await fetch('/api/public/website-settings');
        const data = await res.json();
        if (data.success && data.data) {
          const lp = data.data.landingPage || {};
          setBrandData({
            logoUrl: lp.logoUrl,
            brandTitle: lp.brandTitle || data.data.platformName || 'PropSaaS',
            brandBadge: lp.brandBadge || 'Cloud',
            brandSubtitle: lp.brandSubtitle || 'All-in-One Multi-Tenant PMS',
          });
        }
      } catch (err) {
        // silent fallback
      }
    }
    fetchBrand();
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Modules', href: '#modules' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'FAQ', href: '#faq' },
  ];

  const user = session?.user as any;
  const isSuperAdmin = user?.isSuperAdmin || user?.role === 'Super Admin' || user?.role === 'SuperAdmin';

  const handleSignupClick = (e: React.MouseEvent) => {
    if (onOpenSignup) {
      e.preventDefault();
      onOpenSignup();
      setMenuOpen(false);
      return;
    }
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('open-org-signup', { detail: { plan: 'monthly' } }));
      setMenuOpen(false);
    }
  };

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-900/90 backdrop-blur-md shadow-lg shadow-black/20 border-b border-slate-800 py-3.5' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          {brandData.logoUrl ? (
            <img 
              src={brandData.logoUrl} 
              alt={brandData.brandTitle || "Logo"} 
              className="w-10 h-10 object-contain rounded-xl shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200" 
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
              <Building2 className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold text-white tracking-tight">
                {brandData.brandTitle || "PropSaaS"}
              </span>
              {brandData.brandBadge && (
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  {brandData.brandBadge}
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              {brandData.brandSubtitle || "All-in-One Multi-Tenant PMS"}
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {session?.user ? (
            <div className="flex items-center gap-3">
              {isSuperAdmin ? (
                <Link 
                  href="/superadmin" 
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-md shadow-indigo-600/30 hover:shadow-indigo-500/40"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-200" />
                  SuperAdmin Panel
                </Link>
              ) : (
                <Link 
                  href="/dashboard" 
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-md shadow-indigo-600/30 hover:shadow-indigo-500/40"
                >
                  <span>{user?.name || 'Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                href="/login" 
                className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/#register-organization"
                className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>Start Free Trial</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button 
          className="md:hidden text-slate-300 hover:text-white p-2" 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-6 py-6 space-y-4 shadow-2xl">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              onClick={() => setMenuOpen(false)} 
              className="block text-base font-medium text-slate-300 hover:text-white py-1"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
            {session?.user ? (
              <Link 
                href={isSuperAdmin ? "/superadmin" : "/dashboard"} 
                onClick={() => setMenuOpen(false)} 
                className="w-full py-3 rounded-xl bg-indigo-600 text-white text-center font-semibold"
              >
                {isSuperAdmin ? "Go to SuperAdmin Panel" : "Go to Dashboard"}
              </Link>
            ) : (
              <>
                <Link 
                  href="/login" 
                  onClick={() => setMenuOpen(false)} 
                  className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 text-center font-semibold border border-slate-700"
                >
                  Sign In
                </Link>
                <Link 
                  href="/#register-organization"
                  onClick={() => setMenuOpen(false)} 
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>Start Free Trial</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
