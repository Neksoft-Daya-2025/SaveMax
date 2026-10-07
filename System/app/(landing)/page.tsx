"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Users, 
  Layers, 
  TrendingUp, 
  DollarSign, 
  Wrench, 
  FileText, 
  Bot, 
  Globe2, 
  BarChart3, 
  ChevronRight, 
  Lock, 
  Smartphone, 
  Star,
  HelpCircle,
  Clock,
  Briefcase,
  Activity,
  Search,
  Bell,
  CreditCard,
  ArrowUpRight,
  PieChart
} from 'lucide-react';
import OrganizationSignupSection from '@/components/landing/OrganizationSignupSection';

export default function SaaSPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [websiteData, setWebsiteData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [registerPlan, setRegisterPlan] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    async function fetchWebsiteData() {
      try {
        const res = await fetch('/api/public/website-settings');
        const data = await res.json();
        if (data.success && data.data) {
          setWebsiteData(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch website settings:', err);
      } finally {
        setLoadingData(false);
      }
    }
    fetchWebsiteData();
  }, []);

  const landing = websiteData?.landingPage || {};
  const plansData = websiteData?.plans;
  const trialDays = websiteData?.trialDays || 14;

  const monthlyPlan = plansData?.monthly || {
    name: 'Professional Monthly',
    price: 49,
    currency: 'USD',
    billingInterval: 'month',
    description: 'Complete property & tenant management suite billed on a flexible monthly basis.',
    features: [
      'Up to 100 Properties & Units',
      'Tenant & Lease Management',
      'Automated Rent Collection & Invoicing',
      'Maintenance & Work Order Tracking',
      'Staff & Agent Role Permissions',
      'Standard Financial Reports',
      'Email & SMS Notifications',
      'Standard Support'
    ],
    badge: 'Popular'
  };

  const yearlyPlan = plansData?.yearly || {
    name: 'Enterprise Annual',
    price: 490,
    currency: 'USD',
    billingInterval: 'year',
    description: 'Full-scale enterprise management with maximum savings & priority features.',
    features: [
      'Unlimited Properties & Units',
      'Advanced Tenant & Lease Lifecycle',
      'Automated Rent Collection & Due Reminders',
      'Maintenance & Emergency Dispatch Hub',
      'Multi-Agent & Staff Roles Access',
      'AI Property Analytics & Forecasting',
      'Full Accounting, Expenses & Payroll',
      'Custom Organization Branding & Logo',
      '24/7 Priority Dedicated Support'
    ],
    badge: 'Best Value',
    discountNotice: 'Save ~17% (2 Months Free)'
  };

  const dynamicFaqs = (websiteData?.faqs && websiteData.faqs.length > 0) ? websiteData.faqs : [
    {
      q: "How does multi-tenancy work in PropSaaS?",
      a: "Each organization receives a completely isolated workspace with its own dedicated Admin, Agents, and Customers. Your properties, contracts, financial data, and team members are strictly partitioned and secure."
    },
    {
      q: "Can I switch between Monthly and Yearly billing?",
      a: "Yes! You can upgrade or switch billing cycles anytime from your organization settings or by contacting the platform administrator."
    },
    {
      q: "What roles are included with each organization?",
      a: "When an organization is provisioned, 3 tailored role templates are automatically configured: Admin (full workspace control), Agent (property listings, bookings, inquiries), and Customer (tenant portal, contracts, payments)."
    },
    {
      q: "Is there a free trial available?",
      a: `Yes, new organizations receive a ${trialDays}-day free trial to test all enterprise features with zero commitment.`
    },
    {
      q: "How secure is tenant data and financial records?",
      a: "All data is encrypted in transit and at rest with bank-grade 256-bit SSL protocols. Database access is strictly bound by tenant-isolation middleware filters."
    }
  ];

  const dynamicReviews = (websiteData?.reviews && websiteData.reviews.length > 0) ? websiteData.reviews : [
    {
      quote: "PropSaaS cut our overdue rent collections by 75% within the first two months. The automated reminders and tenant portal are absolute game-changers.",
      author: "Marcus Vance",
      role: "Managing Director",
      company: "Vance & Co Properties",
      units: "320 Units",
      rating: 5,
    },
    {
      quote: "Having dedicated Admin, Agent, and Tenant access in one isolated organization workspace removed our communication bottlenecks completely.",
      author: "Elena Rostova",
      role: "Head of Operations",
      company: "Skyline Real Estate",
      units: "540 Units",
      rating: 5,
    },
    {
      quote: "The SuperAdmin architecture makes managing multi-tenant portfolios effortless. The AI reports give us actionable forecasting in seconds.",
      author: "David Chen",
      role: "Principal Asset Manager",
      company: "Keystone REIT",
      units: "1,200 Units",
      rating: 5,
    }
  ];

  const dynamicMetrics = (landing.metrics && landing.metrics.length > 0) ? landing.metrics : [
    { val: '99.99%', label: 'Cloud SLA & Uptime Guarantee' },
    { val: '500+', label: 'Organizations Powered' },
    { val: '50,000+', label: 'Units & Leases Managed' },
    { val: '$120M+', label: 'Annual Rent Facilitated' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white font-sans overflow-hidden">
      {/* Background ambient lighting & grid pattern */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Subtle grid pattern with radial fade */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b12_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b12_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        {/* Top ambient spotlights */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1200px] h-[650px] bg-gradient-to-b from-indigo-500/20 via-purple-600/10 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-[35%] -left-48 w-[600px] h-[600px] bg-indigo-900/15 blur-[140px] rounded-full" />
        <div className="absolute top-[55%] -right-48 w-[600px] h-[600px] bg-purple-900/15 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* ================= HERO SECTION (2-COLUMN SPLIT LAYOUT) ================= */}
        <section className="pt-32 sm:pt-36 lg:pt-44 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* LEFT COLUMN: Texts, Headings, CTAs & Social Proof */}
            <div className="lg:col-span-6 xl:col-span-5 text-left space-y-7">
              {/* Top Pill / Badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/30 text-indigo-300 text-xs font-semibold backdrop-blur-xl shadow-lg shadow-indigo-950/50 hover:border-indigo-500/50 transition-all duration-300 group cursor-default">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="tracking-wide">{landing.badgeText || "Next-Generation Multi-Tenant SaaS Property Management"}</span>
                <ChevronRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
              </div>

              {/* H1 Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
                {landing.heroTitle ? (
                  <span>{landing.heroTitle}</span>
                ) : (
                  <>
                    Manage Properties, Leases & Teams in{" "}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
                      One Intelligent Cloud Workspace
                    </span>
                  </>
                )}
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                {landing.heroSubtitle || "The all-in-one multi-tenant SaaS operating system built for real estate enterprises, property managers, agents, and landlords. Complete with automated rent collection, lease tracking, maintenance dispatch, and dynamic role delegation."}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <a 
                  href="#register-organization"
                  onClick={() => setRegisterPlan(billingCycle)}
                  className="px-7 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 group cursor-pointer border border-indigo-400/30"
                >
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>{landing.primaryCtaText && !landing.primaryCtaText.toLowerCase().includes('create organization') ? landing.primaryCtaText : "Start Free Trial"}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <Link 
                  href="#pricing"
                  className="px-6 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-600 font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>{landing.secondaryCtaText || "Explore Plans"}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>

              {/* Trust Value Badges Grid */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{trialDays}-Day Free Trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>No Credit Card Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Instant Provisioning</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>256-Bit SSL Security</span>
                </div>
              </div>

              {/* Social Proof Rating */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex -space-x-2 overflow-hidden">
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-950 bg-indigo-600 text-[10px] font-bold text-white flex items-center justify-center">MV</div>
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-950 bg-purple-600 text-[10px] font-bold text-white flex items-center justify-center">ER</div>
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-950 bg-emerald-600 text-[10px] font-bold text-white flex items-center justify-center">DC</div>
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-950 bg-amber-600 text-[10px] font-bold text-white flex items-center justify-center">+5k</div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-white ml-1">4.9/5</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">Trusted by 500+ Property Management Teams</p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Interactive Live Animated Platform Showcase */}
            <div className="lg:col-span-6 xl:col-span-7 relative">
              {/* Background Ambient Glow Behind Mockup */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-500/30 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl opacity-70"></div>

              {/* Floating Animated Badge 1: Top Floating Notification */}
              <div className="hidden sm:flex absolute -top-5 -left-4 z-20 items-center gap-3 p-3 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-xl shadow-black/40 backdrop-blur-xl">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">Rent Collected</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">Auto-Paid</span>
                  </div>
                  <p className="text-[11px] text-emerald-400 font-bold">+$2,400.00 • Unit 402</p>
                </div>
              </div>

              {/* Floating Animated Badge 2: Bottom Floating Notification */}
              <div className="hidden sm:flex absolute -bottom-5 -right-4 z-20 items-center gap-3 p-3 rounded-2xl bg-slate-900/90 border border-indigo-500/30 shadow-xl shadow-black/40 backdrop-blur-xl">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">Digital Lease Signed</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">12 Months</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium">Elena Rostova • Unit 118</p>
                </div>
              </div>

              {/* Main OS Window Mockup */}
              <div className="relative rounded-2xl p-1 bg-gradient-to-b from-slate-700/60 via-slate-800/40 to-slate-900/80 border border-slate-700/60 shadow-2xl shadow-indigo-950/80 backdrop-blur-2xl text-left">
                <div className="rounded-xl bg-slate-950/95 border border-slate-800/90 overflow-hidden">
                  
                  {/* Chrome Header */}
                  <div className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-900/90 border-b border-slate-800/90">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-[11px] font-semibold text-slate-200">
                        <Building2 className="w-3 h-3 text-indigo-400" />
                        <span>Apex Realty</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold">#1042</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live Cloud Sync
                      </span>
                    </div>
                  </div>

                  {/* Navigation Pills */}
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-900/40 border-b border-slate-800/60 text-[11px] font-semibold overflow-x-auto">
                    <span className="px-2.5 py-1 rounded-md bg-indigo-600 text-white flex items-center gap-1">
                      <Activity className="w-3 h-3" /> Overview
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-slate-400 hover:text-white flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> Properties (42)
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-slate-400 hover:text-white flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Leases (184)
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-slate-400 hover:text-white flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> Ledger
                    </span>
                  </div>

                  {/* Inside Workspace Content */}
                  <div className="p-4 sm:p-5 space-y-4">
                    {/* 4 Mini KPI Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
                        <span className="text-[10px] text-slate-400 font-medium block truncate">Valuation</span>
                        <div className="text-base font-black text-white">$48.2M</div>
                        <span className="text-[9px] font-bold text-indigo-400">+14.8% YoY</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
                        <span className="text-[10px] text-slate-400 font-medium block truncate">Collected Rent</span>
                        <div className="text-base font-black text-white">$148.6K</div>
                        <span className="text-[9px] font-bold text-emerald-400">98.4% On-Time</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
                        <span className="text-[10px] text-slate-400 font-medium block truncate">Occupancy</span>
                        <div className="text-base font-black text-white">96.3%</div>
                        <span className="text-[9px] font-bold text-purple-400">184/191 Units</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
                        <span className="text-[10px] text-slate-400 font-medium block truncate">SLA Health</span>
                        <div className="text-base font-black text-white">99.2%</div>
                        <span className="text-[9px] font-bold text-amber-400">0 Critical</span>
                      </div>
                    </div>

                    {/* Mini Rent Collection Bar Chart & Activity Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                      {/* Left: Mini Chart (7 cols) */}
                      <div className="sm:col-span-7 p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-white">Revenue & Rent Trends</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400">+12.4%</span>
                        </div>
                        <div className="h-28 flex items-end gap-1.5 pt-2 px-1 border-b border-slate-800/80 pb-1">
                          {[65, 75, 82, 78, 88, 92, 90, 96, 94, 98, 96, 100].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                              <div
                                className="w-full rounded-t bg-gradient-to-t from-indigo-600 to-purple-500 group-hover:from-indigo-400 group-hover:to-purple-400 transition-all"
                                style={{ height: `${h}%` }}
                              />
                              <span className="text-[8px] text-slate-500 group-hover:text-slate-300 font-medium">
                                {['J','F','M','A','M','J','J','A','S','O','N','D'][i]}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                          <span>Total YTD: <strong className="text-white">$1,420,800</strong></span>
                          <span>NOI: <strong className="text-emerald-400">$1.18M</strong></span>
                        </div>
                      </div>

                      {/* Right: Live Stream Feed (5 cols) */}
                      <div className="sm:col-span-5 p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-white">Live Activity Feed</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        </div>
                        <div className="space-y-1.5">
                          <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/60 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold text-white truncate">Rent Paid ($2,400)</p>
                              <p className="text-[9px] text-slate-400 truncate">Unit 402 • Auto-Stripe</p>
                            </div>
                            <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 shrink-0">Paid</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/60 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold text-white truncate">Lease Executed</p>
                              <p className="text-[9px] text-slate-400 truncate">Elena R. • Unit 118</p>
                            </div>
                            <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 shrink-0">Signed</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/60 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold text-white truncate">Work Order Dispatched</p>
                              <p className="text-[9px] text-slate-400 truncate">Suite 5B • HVAC</p>
                            </div>
                            <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 shrink-0">Active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ================= PLATFORM METRICS ================= */}
        <section className="py-12 border-y border-slate-800/60 bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {dynamicMetrics.map((metric: any, i: number) => (
              <div key={i} className="space-y-1">
                <div className="text-3xl md:text-4xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">
                  {metric.val}
                </div>
                <div className="text-xs md:text-sm font-medium text-slate-400">{metric.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= CORE FEATURES / VALUE PILLARS ================= */}
        <section id="features" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
              <Layers className="w-3.5 h-3.5" />
              <span>{landing.featuresBadge || "Enterprise Grade Architecture"}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              {landing.featuresTitle || "Everything Your Organization Needs to Scale"}
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              {landing.featuresSubtitle || "Engineered with multi-tenant isolation, automated financial ledgers, and intelligent maintenance dispatch."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: "Strict Multi-Tenant Isolation",
                desc: "Complete logical and database-level partitioning. Each organization operates in a siloed workspace with custom branding.",
                badge: "Security"
              },
              {
                icon: DollarSign,
                title: "Automated Rent & Financials",
                desc: "Handle rent collections, track overdue payments, log property expenses, record security deposits, and run monthly staff payroll.",
                badge: "Finance"
              },
              {
                icon: FileText,
                title: "Smart Leases & Contracts",
                desc: "Digitize contracts with unit assignment, payment scheduling, automated renewal notices, and deposit reconciliation.",
                badge: "Operations"
              },
              {
                icon: Wrench,
                title: "Maintenance Dispatch Hub",
                desc: "Tenant repair requests route directly to assigned staff or contractors with photo attachments, priority levels, and work order statuses.",
                badge: "Work Orders"
              },
              {
                icon: Users,
                title: "Dynamic 3-Tier Roles",
                desc: "Auto-provisioned Admin, Agent, and Customer roles per organization. Customize fine-grained permissions for staff and brokers.",
                badge: "Access Control"
              },
              {
                icon: Bot,
                title: "AI Property Intelligence",
                desc: "Built-in AI analytics for rent yield forecasting, occupancy optimization, financial summary generation, and tenant communication.",
                badge: "AI Powered"
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={i} 
                  className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-900/90 transition-all duration-300 group hover:-translate-y-1 shadow-lg shadow-black/40"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================= MODULES SHOWCASE ================= */}
        <section id="modules" className="py-20 px-6 md:px-12 bg-slate-900/30 border-t border-slate-800/60">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-4">
                <Briefcase className="w-3.5 h-3.5" />
                <span>{landing.modulesBadge || "Feature Spectrum"}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                {landing.modulesTitle || "Complete Suite of Real Estate Tools"}
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                {landing.modulesSubtitle || "No third-party plugins needed. Everything you need is integrated directly into your organization dashboard."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { title: 'Properties & Multi-Units', desc: 'Track single units, entire multi-story complexes, amenities, and floor plans.' },
                { title: 'Tenant & Owner CRM', desc: 'Comprehensive profiles for tenants, property owners, and contact histories.' },
                { title: 'Bookings & Site Visits', desc: 'Schedule property tours, assign field agents, and track prospect inquiries.' },
                { title: 'Due Rent Collection', desc: 'Automated overdue ledgers with grace period alerts and penalty calculations.' },
                { title: 'Expense & Cashflow', desc: 'Log property operating expenses, utilities, vendor bills, and calculate net yield.' },
                { title: 'Staff Payroll Ledger', desc: 'Manage salaries, commissions, bonuses, and monthly disbursements.' },
                { title: 'Security Deposits', desc: 'Track refundable client deposits, receipt numbers, and move-out deductions.' },
                { title: 'SuperAdmin Desk', desc: 'Central management of all tenant organizations, subscriptions, and MRR metrics.' },
              ].map((mod, i) => (
                <div key={i} className="p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mb-3" />
                  <h4 className="text-sm font-bold text-white mb-1.5">{mod.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{mod.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= DYNAMIC PRICING SECTION ================= */}
        <section id="pricing" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
              <Zap className="w-3.5 h-3.5" />
              <span>{landing.pricingBadge || "Transparent SaaS Pricing"}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              {landing.pricingTitle || "Simple, Predictable Subscription Plans"}
            </h2>
            <p className="text-slate-400 text-base sm:text-lg mb-8">
              {landing.pricingSubtitle || `Start with a ${trialDays}-day free trial. Scale seamlessly as your property portfolio expands.`}
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                  billingCycle === 'monthly'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  billingCycle === 'yearly'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Save ~17%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Monthly Card */}
            <div className={`p-8 md:p-10 rounded-3xl transition-all duration-300 flex flex-col justify-between ${
              billingCycle === 'monthly'
                ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/20 relative'
                : 'bg-slate-900/50 border border-slate-800 hover:border-slate-700'
            }`}>
              {monthlyPlan.badge && (
                <div className="inline-flex self-start px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-4">
                  {monthlyPlan.badge}
                </div>
              )}
              <div>
                <h3 className="text-2xl font-black text-white mb-2">{monthlyPlan.name}</h3>
                <p className="text-sm text-slate-400 mb-6">{monthlyPlan.description}</p>
                <div className="flex items-baseline gap-2 mb-8 pb-8 border-b border-slate-800">
                  <span className="text-5xl font-black text-white">${monthlyPlan.price}</span>
                  <span className="text-slate-400 text-sm font-medium">/ month</span>
                </div>

                <div className="space-y-3.5 mb-8">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">Included with plan:</h4>
                  {monthlyPlan.features?.map((feat: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <a
                href="#register-organization"
                onClick={() => setRegisterPlan('monthly')}
                className={`w-full py-4 rounded-xl text-center font-bold text-sm transition-all duration-200 cursor-pointer block ${
                  billingCycle === 'monthly'
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                Start Monthly Plan ({trialDays}-Day Free Trial)
              </a>
            </div>

            {/* Yearly Card (Featured) */}
            <div className={`p-8 md:p-10 rounded-3xl transition-all duration-300 flex flex-col justify-between ${
              billingCycle === 'yearly'
                ? 'bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-950 border-2 border-purple-500 shadow-2xl shadow-purple-500/20 relative'
                : 'bg-slate-900/50 border border-slate-800 hover:border-slate-700'
            }`}>
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="inline-flex self-start px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {yearlyPlan.badge || 'Best Value'}
                </div>
                {yearlyPlan.discountNotice && (
                  <span className="text-xs font-bold text-emerald-400">
                    {yearlyPlan.discountNotice}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-2xl font-black text-white mb-2">{yearlyPlan.name}</h3>
                <p className="text-sm text-slate-400 mb-6">{yearlyPlan.description}</p>
                <div className="flex items-baseline gap-2 mb-8 pb-8 border-b border-slate-800">
                  <span className="text-5xl font-black text-white">${yearlyPlan.price}</span>
                  <span className="text-slate-400 text-sm font-medium">/ year</span>
                  <span className="text-xs text-indigo-400 font-semibold ml-2">(${Math.round(yearlyPlan.price / 12)}/mo)</span>
                </div>

                <div className="space-y-3.5 mb-8">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">Everything in Monthly, plus:</h4>
                  {yearlyPlan.features?.map((feat: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <a
                href="#register-organization"
                onClick={() => setRegisterPlan('yearly')}
                className={`w-full py-4 rounded-xl text-center font-bold text-sm transition-all duration-200 cursor-pointer block ${
                  billingCycle === 'yearly'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                Start Enterprise Annual Plan ({trialDays}-Day Free Trial)
              </a>
            </div>
          </div>
        </section>

        {/* ================= EMBEDDED ORGANIZATION REGISTRATION SECTION ================= */}
        <OrganizationSignupSection
          selectedPlan={registerPlan}
          onPlanChange={setRegisterPlan}
          badgeText={landing.registrationBadge}
          title={landing.registrationTitle}
          subtitle={landing.registrationSubtitle}
        />

        {/* ================= TESTIMONIALS ================= */}
        <section id="testimonials" className="py-20 px-6 md:px-12 bg-slate-900/30 border-t border-slate-800/60">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
                <Star className="w-3.5 h-3.5 fill-indigo-400" />
                <span>{landing.testimonialsBadge || "Client Endorsements"}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                {landing.testimonialsTitle || "Trusted by Forward-Thinking Property Leaders"}
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                {landing.testimonialsSubtitle || "See how real estate organizations streamline their daily operations with PropSaaS."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dynamicReviews.map((t: any, i: number) => (
                <div key={i} className="p-8 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between space-y-6">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(t.rating || 5)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed italic">
                    "{t.quote || t.content}"
                  </p>
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{t.author}</h4>
                      <p className="text-xs text-slate-400">{t.role}{t.company ? ` • ${t.company}` : ""}</p>
                    </div>
                    {t.units && (
                      <span className="text-[11px] font-semibold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                        {t.units}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= FAQ SECTION ================= */}
        <section id="faq" className="py-24 px-6 md:px-12 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{landing.faqBadge || "Got Questions?"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              {landing.faqTitle || "Frequently Asked Questions"}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              {landing.faqSubtitle || "Everything you need to know about the platform, onboarding, and multi-tenancy."}
            </p>
          </div>

          <div className="space-y-4">
            {dynamicFaqs.map((faq: any, i: number) => (
              <div 
                key={i} 
                className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-bold text-white text-base hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  <span>{faq.q || faq.question}</span>
                  <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${faqOpen === i ? 'rotate-90 text-indigo-400' : ''}`} />
                </button>
                {faqOpen === i && (
                  <div className="px-6 pb-6 text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-4">
                    {faq.a || faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ================= CLOSING CTA BANNER ================= */}
        <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="rounded-3xl p-10 md:p-16 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 border border-indigo-500/30 text-center relative overflow-hidden shadow-2xl shadow-indigo-950/80">
            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                {landing.ctaBannerTitle || "Ready to Supercharge Your Real Estate Organization?"}
              </h2>
              <p className="text-indigo-200 text-base sm:text-lg">
                {landing.ctaBannerSubtitle || "Join hundreds of property management leaders. Set up your organization in minutes."}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <a
                  href="#register-organization"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-100 text-indigo-950 font-black text-base shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>{landing.ctaBannerButtonText || `Start Free Trial (${trialDays}-Day Free Trial)`}</span>
                </a>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-950/60 hover:bg-indigo-950 text-white border border-indigo-400/40 font-bold text-base transition-all duration-200"
                >
                  Member Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
