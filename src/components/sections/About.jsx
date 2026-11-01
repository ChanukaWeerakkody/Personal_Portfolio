import { MapPin, ShieldCheck, Gauge, Layers, Sparkles } from 'lucide-react';
import { profile, stats } from '@/data/profile';
import img480 from '@/assets/profile-480.jpeg';
import img800 from '@/assets/profile-800.jpeg';
import Reveal from '@/components/ui/Reveal';
import CountUp from '@/components/ui/CountUp';
import SectionHeading from '@/components/ui/SectionHeading';
import SpotlightCard from '@/components/ui/SpotlightCard';

const pillars = [
  { icon: ShieldCheck, title: 'Secure by default', text: 'JWT auth, RBAC, and payload encryption designed in from day one — not bolted on.' },
  { icon: Gauge, title: 'Performance-minded', text: 'Query tuning, composite indexing, and Kafka streaming pipelines that stay fast under load.' },
  { icon: Layers, title: 'Architected to evolve', text: 'Clean layering, DTO validation, and microservice boundaries that let products scale.' },
  { icon: Sparkles, title: 'Intelligent & Real-Time', text: 'Grounded AI workflows, WebSocket fanouts, and deterministic local fallbacks.' },
];

export default function About() {
  return (
    <section id="about" className="section">
      <SectionHeading eyebrow="01 — About" title="Engineering with a product mindset." />
      <div className="grid items-start gap-10 lg:grid-cols-[320px_1fr]">
        <Reveal>
            <div className="glass noise relative mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-3xl
                            bg-[radial-gradient(120%_90%_at_50%_0%,#1b2147_0%,#0b0d1a_55%,#05060d_100%)]">
              {/* subtle tech grid */}
              <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(129,140,248,.15)_1px,transparent_1px),linear-gradient(90deg,rgba(129,140,248,.15)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(70%_70%_at_50%_40%,#000,transparent)]" />
              {/* ambient neon glow behind subject */}
              <div className="absolute left-1/2 top-1/3 h-48 w-48 -translate-x-1/2 rounded-full bg-accent/40 blur-3xl" />
              {/* glass accent panel */}
              <div className="glass absolute -right-6 top-10 h-24 w-24 rotate-12 rounded-2xl opacity-60" />

              <img
                src={img480}
                srcSet={`${img480} 480w, ${img800} 800w`}
                sizes="(min-width:1024px) 320px, 80vw"
                width="480" height="480"
                alt={`Portrait of ${profile.name}`}
                loading="lazy" decoding="async"
                className="relative h-full w-full object-cover object-top
                          [filter:contrast(1.08)_saturate(.9)_brightness(.95)_hue-rotate(-6deg)_drop-shadow(0_0_24px_rgba(99,102,241,.35))]"
              />

              {/* cool cinematic tint + rim light */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-indigo-900/30 via-transparent to-cyan-400/10 mix-blend-soft-light" />
              {/* bottom fade so the location chip reads cleanly */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#05060d] to-transparent" />

              <div className="absolute inset-x-3 bottom-3 glass flex items-center gap-2 rounded-xl px-3 py-2 text-xs">
                <MapPin size={14} className="text-accent" />{profile.location}
              </div>
            </div>
          </Reveal>

        <div>
          <Reveal delay={0.05}>
            <p className="text-lg leading-relaxed text-muted">
              I'm a backend-focused software engineer building scalable systems, intelligent applications, and real-time experiences for enterprise SaaS and mobile products.
              Day to day that means designing and shipping <span className="text-foreground font-medium">Spring Boot, NestJS, Node.js, and Apache Kafka</span> pipelines backed by optimized MySQL, PostgreSQL, MongoDB, and Redis —
              secured with strict JWT and RBAC governance and delivered through Docker and automated CI/CD. I'm currently completing a BSc (Hons) in Computing at Wrexham University.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
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
