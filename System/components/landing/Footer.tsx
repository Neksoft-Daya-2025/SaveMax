"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Facebook, Twitter, Instagram, Linkedin, Github, Shield, Heart, ArrowUp } from 'lucide-react';

export default function Footer() {
  const [footerData, setFooterData] = useState<any>(null);
  const [showFloatingTop, setShowFloatingTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowFloatingTop(true);
      } else {
        setShowFloatingTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    async function fetchFooter() {
      try {
        const res = await fetch('/api/public/website-settings');
        const data = await res.json();
        if (data.success && data.data) {
          const lp = data.data.landingPage || {};
          setFooterData({
            logoUrl: lp.logoUrl,
            platformName: lp.brandTitle || data.data.platformName || "PropSaaS",
            badge: lp.brandBadge || "Cloud",
            description: lp.footerDescription,
            copyright: lp.footerCopyright,
          });
        }
      } catch (err) {
        // silent fallback
      }
    }
    fetchFooter();
  }, []);

  return (
    <footer className="bg-slate-950 text-white pt-20 pb-12 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand & Description */}
          <div className="md:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-3">
              {footerData?.logoUrl ? (
                <img 
                  src={footerData.logoUrl} 
                  alt={footerData.platformName} 
                  className="w-10 h-10 object-contain rounded-xl shadow-lg shadow-indigo-500/25" 
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold text-white tracking-tight">{footerData?.platformName || "PropSaaS"}</span>
                  {footerData?.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      {footerData.badge}
                    </span>
                  )}
                </div>
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              {footerData?.description || "The next-generation multi-tenant cloud operating system for real estate enterprises, property managers, agents, and landlords worldwide."}
            </p>
            <div className="flex gap-3">
              {[
                { icon: Twitter, href: '#' },
                { icon: Linkedin, href: '#' },
                { icon: Facebook, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Github, href: '#' }
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <Link 
                    key={i} 
                    href={item.href}
                    className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500/50 hover:bg-slate-800 transition-all duration-200"
                  >
                    <Icon className="w-4 h-4" />
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Platform Columns */}
          <div className="md:col-span-2 space-y-4">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Product</h5>
            <ul className="space-y-2.5 text-sm text-slate-400 font-medium">
              <li><Link href="#features" className="hover:text-white transition-colors">Core Features</Link></li>
              <li><Link href="#modules" className="hover:text-white transition-colors">Property Modules</Link></li>
              <li><Link href="#pricing" className="hover:text-white transition-colors">Subscription Plans</Link></li>
              <li><Link href="#solutions" className="hover:text-white transition-colors">Multi-Tenancy</Link></li>
              <li><Link href="#faq" className="hover:text-white transition-colors">SaaS FAQ</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Features</h5>
            <ul className="space-y-2.5 text-sm text-slate-400 font-medium">
              <li><Link href="#features" className="hover:text-white transition-colors">Lease Lifecycle</Link></li>
              <li><Link href="#features" className="hover:text-white transition-colors">Rent Automation</Link></li>
              <li><Link href="#features" className="hover:text-white transition-colors">Maintenance Hub</Link></li>
              <li><Link href="#features" className="hover:text-white transition-colors">AI Intelligence</Link></li>
              <li><Link href="#features" className="hover:text-white transition-colors">Role Delegation</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Portals</h5>
            <ul className="space-y-2.5 text-sm text-slate-400 font-medium">
              <li><Link href="/login" className="hover:text-white transition-colors">Admin Login</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Agent Portal</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Customer Portal</Link></li>
              <li><Link href="/superadmin" className="hover:text-white transition-colors">SuperAdmin Desk</Link></li>
              <li><Link href="/setup" className="hover:text-white transition-colors">System Setup</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Security & SLA</h5>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Shield className="w-3.5 h-3.5" />
                <span>99.99% Uptime</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Bank-grade 256-bit SSL encryption & isolated multi-tenant databases.
              </p>
            </div>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800/60 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {footerData?.copyright || "PropSaaS Platform. All rights reserved."}</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-slate-400 transition-colors">Security Center</Link>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-indigo-500/50 hover:bg-slate-800 transition-all duration-200 font-medium group cursor-pointer shadow-sm"
              title="Scroll to top of page"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform duration-200 text-indigo-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Scroll to Top button */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className={`fixed bottom-6 right-6 z-40 p-3 rounded-full bg-slate-900/90 hover:bg-indigo-600 text-white shadow-xl shadow-indigo-500/10 backdrop-blur-md border border-slate-700/60 hover:border-indigo-500/50 transition-all duration-300 hover:scale-110 active:scale-95 group flex items-center justify-center cursor-pointer ${
          showFloatingTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        title="Scroll to top"
      >
        <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform duration-200 text-slate-300 group-hover:text-white" />
      </button>
    </footer>
  );
}
