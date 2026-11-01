import { lazy, Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Download, Github, Linkedin, Sparkles } from 'lucide-react';
import { profile } from '@/data/profile';
import { useTheme } from '@/lib/theme';
import { scrollToId } from '@/lib/utils';
import Magnetic from '@/components/ui/Magnetic';

const Scene3D = lazy(() => import('@/components/Scene3D'));

function Typewriter({ words }) {
  const [i, setI] = useState(0);
  const [text, setText] = useState('');
  const [del, setDel] = useState(false);
  useEffect(() => {
    const word = words[i];
    const t = setTimeout(() => {
      if (!del) { setText(word.slice(0, text.length + 1)); if (text.length + 1 === word.length) setTimeout(() => setDel(true), 1400); }
      else { setText(word.slice(0, text.length - 1)); if (text.length - 1 === 0) { setDel(false); setI((i + 1) % words.length); } }
    }, del ? 28 : 55);
    return () => clearTimeout(t);
  }, [text, del, i, words]);
  return <span>{text}<span className="ml-0.5 inline-block w-[2px] animate-blink bg-accent align-middle" style={{ height: '1em' }} /></span>;
}

export default function Hero() {
  const { accent } = useTheme();
  const [show3D, setShow3D] = useState(false);

  // Only load WebGL on capable, non-reduced-motion desktop viewports, after the page is interactive.
  useEffect(() => {
    const ok = matchMedia('(min-width: 1024px)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!ok) return;
    const id = ('requestIdleCallback' in window) ? requestIdleCallback(() => setShow3D(true), { timeout: 2500 }) : setTimeout(() => setShow3D(true), 1200);
    return () => ('cancelIdleCallback' in window ? cancelIdleCallback(id) : clearTimeout(id));
  }, []);

  return (
    <section id="home" className="relative flex min-h-[100svh] items-center overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 [background:radial-gradient(60%_50%_at_70%_30%,rgb(var(--accent)/.14),transparent_70%),radial-gradient(40%_40%_at_10%_90%,rgb(var(--accent)/.08),transparent_70%)]" />
      <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.35] [background-image:linear-gradient(rgb(var(--line)/.08)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--line)/.08)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000,transparent)]" />
      {show3D && (
        <div className="absolute right-[-8%] top-1/2 -z-10 hidden h-[640px] w-[640px] -translate-y-1/2 lg:block">
          <Suspense fallback={null}><Scene3D accent={accent} /></Suspense>
        </div>
      )}

      <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-32">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="glass mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-xs">
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" /></span>
          {profile.available ? 'Open to opportunities' : 'Currently booked'} · {profile.location}
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
          className="max-w-4xl text-4xl min-[440px]:text-5xl sm:text-6xl md:text-7xl font-semibold leading-[1.08] sm:leading-[1.05]">
          Building <span className="gradient-text">scalable systems</span>, intelligent apps &amp; real-time experiences.
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-6 flex items-center gap-2 font-mono text-sm text-accent md:text-base">
          <Sparkles size={16} /> <Typewriter words={profile.roles} />
        </motion.p>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-5 max-w-2xl text-lg text-muted">
          Hi, I'm <span className="text-foreground font-medium">{profile.name}</span>. {profile.tagline}
        </motion.p>

        {/* Core engineering pillars quick bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.58 }} className="mt-5 flex flex-wrap gap-2 max-w-2xl">
          {['Backend Engineering', 'Microservices & REST', 'Kafka & Real-Time', 'Database Optimization', 'JWT & RBAC', 'AI Integration'].map((tag) => (
            <span key={tag} className="chip bg-background/50 border-line/10 text-muted">
              {tag}
            </span>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="mt-9 flex flex-wrap items-center gap-3">
          <Magnetic><button onClick={() => scrollToId('projects')} className="btn btn-primary">View projects <ArrowUpRight size={16} /></button></Magnetic>
          <Magnetic><button onClick={() => scrollToId('contact')} className="btn btn-ghost">Get in touch</button></Magnetic>
          <a href={profile.cv} download className="btn btn-ghost"><Download size={15} /> CV</a>
          <div className="ml-1 flex items-center gap-1">
            <a href={profile.githubUrl} target="_blank" rel="noreferrer noopener" aria-label="GitHub" className="grid h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:text-accent"><Github size={18} /></a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer noopener" aria-label="LinkedIn" className="grid h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:text-accent"><Linkedin size={18} /></a>
          </div>
        </motion.div>
      </div>

      <button onClick={() => scrollToId('about')} aria-label="Scroll to about" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-muted md:block">
        <ArrowDown size={20} className="animate-bounce" />
      </button>
    </section>
  );
}
