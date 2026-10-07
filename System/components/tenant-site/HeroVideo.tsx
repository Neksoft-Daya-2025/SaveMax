'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import s from './site.module.css';

export default function HeroVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const update = () => setEnabled(!motion.matches && !connection?.saveData);
    update(); motion.addEventListener('change', update);
    return () => motion.removeEventListener('change', update);
  }, []);
  return <>
    <img className={s.heroImage} src="/site-assets/amsterdam-hero-poster.webp" alt="Canal-side homes in Amsterdam" fetchPriority="high" />
    {enabled && !failed && <>
      <video ref={video} className={`${s.heroImage} ${s.heroVideo}`} autoPlay muted loop playsInline preload="none"
        poster="/site-assets/amsterdam-hero-poster.webp" aria-hidden="true" onError={() => setFailed(true)} onPause={() => setPaused(true)} onPlaying={() => setPaused(false)}>
        <source src="/site-assets/amsterdam-hero.mp4" type="video/mp4" />
      </video>
      <button type="button" className={s.videoControl} aria-label={paused ? 'Play background video' : 'Pause background video'} onClick={() => {
        if (!video.current) return;
        if (video.current.paused) video.current.play().catch(() => setFailed(true)); else video.current.pause();
      }}>{paused ? <Play size={16} /> : <Pause size={16} />}<span>{paused ? 'Play' : 'Pause'}</span></button>
    </>}
  </>;
}
