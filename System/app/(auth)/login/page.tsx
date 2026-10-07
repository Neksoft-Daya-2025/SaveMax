 'use client';
import { useState, FormEvent } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import s from './login.module.css';
export default function LoginPage() {
 const router = useRouter();
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[visible,setVisible]=useState(false),[error,setError]=useState(''),[loading,setLoading]=useState(false);
 async function submit(event:FormEvent<HTMLFormElement>) {
  event.preventDefault();setError('');setLoading(true);
  try {
   const result=await signIn('credentials',{email:email.trim(),password,redirect:false});
   if(result?.error) {setError('Could not sign in. Check your email and password.');setLoading(false);return;}
   const session=await getSession();
   const user=session?.user as any;
   router.push(user?.role==='Public customer' && user?.organization?.slug ? `/site/${encodeURIComponent(user.organization.slug)}/account` : '/dashboard');router.refresh();
  } catch {setError('Could not sign in. Please try again.');setLoading(false);}
 }
 return <main className={s.page}>
  <section className={s.story}><img src="/site-assets/living-room.webp" alt="A bright, welcoming living room" /><div className={s.shade} />
   <Link href="/" className={s.brand}><Home size={38}/><span>Save Max<small>REAL ESTATE</small></span></Link>
   <div className={s.storyCopy}><p>A PLACE TO BELONG</p><h2>Your next chapter<br/>starts here.</h2><p>Find a home, list your property, or stay connected with your real estate team.</p></div>
   <span className={s.copyright}>© {new Date().getFullYear()} Save Max</span>
  </section>
  <section className={s.formSide}><div className={s.formWrap}>
   <Link href="/" className={s.back}><ArrowLeft size={16}/>Back to website</Link>
   <Link href="/" className={s.mobileBrand}><Home size={28}/>Save Max</Link>
   <p className={s.eyebrow}>YOUR ACCOUNT</p><h1>Welcome back.</h1><p className={s.intro}>Sign in to access your account and manage your property activity.</p>
   {error && <p role="alert" className={s.error}>{error}</p>}
   <form onSubmit={submit}>
    <label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com" />
    <label htmlFor="password">Password</label><div className={s.password}><input id="password" type={visible?'text':'password'} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required /><button type="button" aria-label={visible?'Hide password':'Show password'} aria-pressed={visible} onClick={()=>setVisible(!visible)}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button></div>
    <button className={s.submit} disabled={loading}>{loading?'Signing in…':'Sign in'}<ArrowRight size={17}/></button>
   </form>
   <p className={s.signup}>New to Save Max? <Link href="/site/save-max/account">Create an account</Link></p>
   <p className={s.help}>Need help signing in? <Link href="/#contact">Contact the team</Link></p>
  </div></section>
 </main>;
}
