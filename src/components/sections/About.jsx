import { MapPin, ShieldCheck, Gauge, Layers } from 'lucide-react';
import { profile, stats } from '@/data/profile';
import img480 from '@/assets/profile-480.jpeg';
import img800 from '@/assets/profile-800.jpeg';
import Reveal from '@/components/ui/Reveal';
import CountUp from '@/components/ui/CountUp';
import SectionHeading from '@/components/ui/SectionHeading';
import SpotlightCard from '@/components/ui/SpotlightCard';

const pillars = [
  { icon: ShieldCheck, title: 'Secure by default', text: 'JWT auth, RBAC and payload encryption designed in from day one — not bolted on.' },
  { icon: Gauge, title: 'Performance-minded', text: 'Query tuning, caching and event-driven pipelines that stay fast under load.' },
  { icon: Layers, title: 'Architected to evolve', text: 'Clean layering and microservice boundaries that let products grow without rewrites.' },
];

export default function About() {
  return (
    <section id="about" className="section">
      <SectionHeading eyebrow="01 — About" title="Engineering with a product mindset." />
      <div className="grid items-start gap-10 lg:grid-cols-[320px_1fr]">
        <Reveal>
          <div className="glass noise relative mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-3xl">
            <img src={img480} srcSet={`${img480} 480w, ${img800} 800w`} sizes="(min-width:1024px) 320px, 80vw" width="480" height="480"
              alt={`Portrait of ${profile.name}`} loading="lazy" decoding="async" className="h-full w-full object-cover" />
            <div className="absolute inset-x-3 bottom-3 glass flex items-center gap-2 rounded-xl px-3 py-2 text-xs"><MapPin size={14} className="text-accent" />{profile.location}</div>
          </div>
        </Reveal>

        <div>
          <Reveal delay={0.05}>
            <p className="text-lg leading-relaxed text-muted">
              I'm a backend engineer who designs and ships production-grade systems for enterprise SaaS and mobile products.
              Day to day that means <span className="text-foreground">Spring Boot, NestJS, Node.js and PHP</span> APIs backed by MySQL, PostgreSQL, MongoDB and Redis —
              plus the Docker and CI/CD plumbing that keeps them reliable. I'm currently completing a BSc (Hons) in Computing at Wrexham University.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={0.08 * i}>
                <SpotlightCard className="h-full p-5">
                  <p.icon size={20} className="text-accent" />
                  <h3 className="mt-3 text-base font-semibold">{p.title}</h3>
                  <p className="mt-1.5 text-sm text-muted">{p.text}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
          <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="border-l border-line/10 pl-4">
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-3xl font-semibold"><CountUp to={s.value} suffix={s.suffix} /></dd>
                <p className="text-xs text-muted">{s.label}</p>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
