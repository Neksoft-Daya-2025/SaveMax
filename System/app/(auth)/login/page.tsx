/* Developed by RUDRA via NEKLLM */
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Building2, 
  ShieldCheck, 
  Layers, 
  DollarSign, 
  Bot, 
  ArrowLeft,
  KeyRound,
  Check
} from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [brandData, setBrandData] = useState<{
        logoUrl?: string;
        brandTitle?: string;
        brandBadge?: string;
        brandSubtitle?: string;
    }>({
        logoUrl: '',
        brandTitle: 'SaveMAX',
        brandBadge: 'CLOUD',
        brandSubtitle: 'Enterprise Multi-Tenant PMS'
    });
    const [showDemo, setShowDemo] = useState(false);
    const [activeDemoTab, setActiveDemoTab] = useState<'superadmin' | 'admin' | 'customer' | 'agent'>('superadmin');

    const demoAccounts = {
        superadmin: {
            title: 'SuperAdmin',
            role: 'Root Platform Desk',
            email: 'demo.superadmin@savemax.example',
            password: 'SaveMAX-Demo2026!',
            badge: 'Global Access',
            textColor: 'text-amber-700',
            activeBg: 'bg-amber-50 border-amber-300 text-amber-900',
            badgeStyle: 'bg-amber-100 text-amber-800 border-amber-200'
        },
        admin: {
            title: 'Admin',
            role: 'Org Administrator',
            email: 'demo.admin@savemax.example',
            password: 'SaveMAX-Demo2026!',
            badge: 'Full Workspace',
            textColor: 'text-indigo-700',
            activeBg: 'bg-indigo-50 border-indigo-300 text-indigo-900',
            badgeStyle: 'bg-indigo-100 text-indigo-800 border-indigo-200'
        },
        customer: {
            title: 'Customer',
            role: 'Tenant Portal',
            email: 'demo.customer@savemax.example',
            password: 'SaveMAX-Demo2026!',
            badge: 'Resident Access',
            textColor: 'text-blue-700',
            activeBg: 'bg-blue-50 border-blue-300 text-blue-900',
            badgeStyle: 'bg-blue-100 text-blue-800 border-blue-200'
        },
        agent: {
            title: 'Agent',
            role: 'Field Operations',
            email: 'demo.agent@savemax.example',
            password: 'SaveMAX-Demo2026!',
            badge: 'Assigned Data',
            textColor: 'text-emerald-700',
            activeBg: 'bg-emerald-50 border-emerald-300 text-emerald-900',
            badgeStyle: 'bg-emerald-100 text-emerald-800 border-emerald-200'
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/public/website-settings');
            const data = await res.json();
            if (data.success && data.data) {
                const lp = data.data.landingPage || {};
                const title = "SaveMAX";
                const badge = lp.brandBadge || "CLOUD";
                const subtitle = lp.brandSubtitle || "Enterprise Multi-Tenant PMS";
                const logoUrl = lp.logoUrl || "";

                setBrandData({
                    logoUrl,
                    brandTitle: title,
                    brandBadge: badge,
                    brandSubtitle: subtitle
                });

                document.title = `${title} - Sign In`;

                if (typeof data.data.isDemo === 'boolean') {
                    setShowDemo(process.env.NODE_ENV === 'development');
                } else if (typeof process.env.NEXT_PUBLIC_DEMO !== 'undefined') {
                    setShowDemo(process.env.NEXT_PUBLIC_DEMO === 'true');
                }
            }
        } catch (error) {
            console.error('Error fetching website settings:', error);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email: email.trim(),
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid credentials. Please verify your email and password.');
                setLoading(false);
                return;
            }

            router.push('/dashboard');
            router.refresh();
        } catch (error) {
            setError('An error occurred during sign in. Please try again.');
            setLoading(false);
        }
    };

    const handleAutofill = (key: 'superadmin' | 'admin' | 'customer' | 'agent') => {
        setActiveDemoTab(key);
        const creds = demoAccounts[key];
        setEmail(creds.email);
        setPassword(creds.password);
        setError('');
    };

    return (
        <div className="min-h-screen flex bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
            {/* Background Ambient Accents */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-gradient-to-br from-indigo-100/60 via-purple-50/40 to-transparent blur-3xl rounded-full" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-blue-100/50 via-indigo-50/40 to-transparent blur-3xl rounded-full" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            <div className="relative z-10 flex w-full min-h-screen">
                {/* ================= LEFT SIDE: BRANDING & VALUE HIGHLIGHTS (DESKTOP) ================= */}
                <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16 border-r border-slate-200/80 bg-gradient-to-b from-slate-100/80 via-slate-50/90 to-indigo-50/40 backdrop-blur-xl relative">
                    {/* Brand Top */}
                    <div>
                        <Link href="/" className="inline-flex items-center gap-3 group">
                            {brandData?.logoUrl ? (
                                <img 
                                    src={brandData.logoUrl} 
                                    alt={brandData.brandTitle || "Brand Logo"} 
                                    className="w-11 h-11 object-contain rounded-xl shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-200 bg-white p-1 border border-slate-200" 
                                />
                            ) : (
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-200">
                                    <Building2 className="w-6 h-6 text-white" />
                                </div>
                            )}
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                                        {brandData?.brandTitle || "SaveMAX"}
                                    </span>
                                    {brandData?.brandBadge && (
                                        <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
                                            {brandData.brandBadge}
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs font-semibold text-slate-500">
                                    {brandData?.brandSubtitle || "Enterprise Multi-Tenant PMS"}
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Main Showcase */}
                    <div className="space-y-8 my-auto max-w-lg">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Complete Real Estate Operating System</span>
                            </div>
                            <h2 className="text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                                One unified cloud workspace for all your properties & tenants.
                            </h2>
                            <p className="text-slate-600 text-sm xl:text-base leading-relaxed">
                                Streamline property management, lease lifecycle tracking, automated rent collection, maintenance dispatch, and staff payroll.
                            </p>
                        </div>

                        {/* Feature Highlights Grid */}
                        <div className="space-y-3.5 pt-2">
                            {[
                                {
                                    icon: Layers,
                                    title: 'Multi-Tenant Data Isolation',
                                    desc: 'Siloed organizational workspaces with custom roles.'
                                },
                                {
                                    icon: DollarSign,
                                    title: 'Automated Rent & Ledgers',
                                    desc: 'Overdue rent tracking, expense logs & security deposits.'
                                },
                                {
                                    icon: Bot,
                                    title: 'AI Intelligence & Forecasting',
                                    desc: 'Smart occupancy insights, yield analytics & reporting.'
                                }
                            ].map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <div key={idx} className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/90 border border-slate-200/80 shadow-xs">
                                        <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                                            <Icon className="w-4.5 h-4.5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                                            <p className="text-xs text-slate-500">{item.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bottom Trust Badge */}
                    <div className="pt-6 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-2 text-slate-600">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>99.99% Uptime SLA • 256-Bit SSL Encrypted</span>
                        </div>
                        <span>© {new Date().getFullYear()} {brandData?.brandTitle || "SaveMAX"}</span>
                    </div>
                </div>

                {/* ================= RIGHT SIDE: AUTHENTICATION FORM ================= */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 xl:p-16 overflow-y-auto">
                    <div className="w-full max-w-md space-y-6">
                        <p className="text-xs text-center text-slate-500">Developed by Neksoft Global Service Pvt. Ltd.</p>
                        {/* Top Back Link & Mobile Logo */}
                        <div className="flex items-center justify-between">
                            <Link 
                                href="/" 
                                className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Back to Home</span>
                            </Link>

                            <div className="lg:hidden flex items-center gap-2">
                                {brandData?.logoUrl ? (
                                    <img 
                                        src={brandData.logoUrl} 
                                        alt={brandData.brandTitle || "Brand Logo"} 
                                        className="w-8 h-8 object-contain rounded-lg shadow-sm bg-white p-0.5 border border-slate-200" 
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                                        <Building2 className="w-4 h-4 text-white" />
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5">
                                    <span className="text-base font-black text-slate-900">
                                        {brandData?.brandTitle || "SaveMAX"}
                                    </span>
                                    {brandData?.brandBadge && (
                                        <span className="text-[9px] uppercase font-bold tracking-widest px-1 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
                                            {brandData.brandBadge}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sign-In Card Container */}
                        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/60">
                            {/* Heading */}
                            <div className="mb-8">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-3">
                                    <KeyRound className="w-3.5 h-3.5 text-indigo-600" /> Workspace Sign In
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                    Welcome Back
                                </h1>
                                <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
                                    Enter your credentials to access your organization workspace.
                                </p>
                            </div>

                            {/* Error Alert */}
                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4.5">
                                {/* Email Field */}
                                <div className="space-y-1.5">
                                    <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                            placeholder="name@organization.com"
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                            Password
                                        </label>
                                        <span className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer transition-colors">
                                            Forgot password?
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                            placeholder="••••••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember Me */}
                                <div className="flex items-center justify-between pt-1">
                                    <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer hover:text-slate-800">
                                        <input
                                            type="checkbox"
                                            defaultChecked
                                            className="w-4 h-4 rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                        />
                                        <span>Stay signed in for 30 days</span>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
                                >
                                    {loading ? (
                                        <>
                                             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Authenticating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Sign In to Workspace</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* 1-Click Fast Autofill Demo Switcher */}
                            {showDemo && (
                                <div className="mt-8 pt-6 border-t border-slate-100 space-y-3.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Quick Demo Access
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                                            1-Click Fill
                                        </span>
                                    </div>

                                    {/* Tabs */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {(['superadmin', 'admin', 'customer', 'agent'] as const).map((key) => {
                                            const acc = demoAccounts[key];
                                            const isActive = activeDemoTab === key;
                                            return (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => handleAutofill(key)}
                                                    className={`p-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                                                        isActive 
                                                            ? `${acc.activeBg} shadow-xs` 
                                                            : 'bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-slate-100/80 text-slate-700'
                                                    }`}
                                                >
                                                    <span className={`text-[11px] font-bold ${isActive ? acc.textColor : 'text-slate-800'}`}>
                                                        {acc.title}
                                                    </span>
                                                    <span className="text-[9px] text-slate-500 truncate mt-0.5">
                                                        {acc.role}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Active Box Info */}
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                                        <div className="space-y-0.5 truncate mr-2">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-slate-800 truncate">
                                                    {demoAccounts[activeDemoTab].email}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-500">
                                                Password: <span className="font-semibold text-slate-700">{demoAccounts[activeDemoTab].password}</span>
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleAutofill(activeDemoTab)}
                                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold border border-indigo-200 transition-colors shrink-0 cursor-pointer"
                                        >
                                            Autofill
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Setup Link Footer */}
                        <div className="text-center space-y-2">
                            <p className="text-xs text-slate-500">
                                Need to initialize a new platform instance?{' '}
                                <Link href="/setup" className="text-indigo-600 hover:text-indigo-700 font-bold underline underline-offset-2">
                                    Setup SuperAdmin
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}