import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Blocks,
  Cpu,
  Database,
  GitBranch,
  Layers,
  Lock,
  Radio,
  Server,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
} from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { cn } from '@/lib/utils';

const PILLARS = [
  {
    id: 'realtime',
    title: 'Event-Driven & Real-Time Pipelines',
    icon: Radio,
    tagline: 'Near-zero latency asynchronous event streaming',
    highlights: ['Apache Kafka', 'KafkaJS Producer/Consumer', 'Socket.io Fan-out', 'Sliding-Window Buffers'],
    details: 'Decoupled asynchronous architectures using persistent commit logs, consumer groups with partition rebalancing, and WebSocket rooms delivering sub-millisecond market ticks.',
    metrics: '< 15ms stream latency',
  },
  {
    id: 'microservices',
    title: 'Enterprise Microservices & REST',
    icon: Server,
    tagline: 'Domain-Driven service boundaries & type-safety',
    highlights: ['NestJS Modules', 'Spring Boot MVC', 'Class-Validator DTOs', 'Database-per-Service'],
    details: 'Clean layered architecture with dependency injection, automated DTO validation pipelines, centralized exception filters, and contract-driven API specifications.',
    metrics: '99.9% API reliability',
  },
  {
    id: 'database',
    title: 'Database Optimization & Storage',
    icon: Database,
    tagline: 'Relational integrity meets high-concurrency caching',
    highlights: ['MySQL & PostgreSQL', 'Redis Layered Cache', 'MongoDB Aggregations', 'ACID Isolation'],
    details: 'Composite indexing on high-frequency query paths, HikariCP connection pooling, pessimistic locking during stock updates, and in-memory Redis caching to eliminate disk bottlenecks.',
    metrics: '70% query latency reduction',
  },
  {
    id: 'security',
    title: 'Defense-in-Depth API Security',
    icon: ShieldCheck,
    tagline: 'Stateless JWT auth with strict Role-Based Access',
    highlights: ['Custom RBAC Guards', 'Spring Security Filters', 'AES-256-CBC Encryption', 'Rate Limiting'],
    details: 'End-to-end access governance via cryptographic token verification, method-level security (@PreAuthorize), payload encryption for sensitive transit, and automated threat mitigations.',
    metrics: 'Zero security breaches',
  },
  {
    id: 'devops',
    title: 'Containerization & CI/CD Delivery',
    icon: Cpu,
    tagline: 'Reproducible environments & automated shipping',
    highlights: ['Docker Multi-stage', 'Docker Compose', 'GitHub Actions', 'Zero-Downtime Builds'],
    details: 'Lean container images optimized via multi-stage Docker builds, automated test verification in CI pipelines, and environment segregation for reliable deployment cycles.',
    metrics: 'Fast reproducible builds',
  },
  {
    id: 'ai-integration',
    title: 'Intelligent Systems & AI Grounding',
    icon: Sparkles,
    tagline: 'Production AI with deterministic local fallbacks',
    highlights: ['Retrieval-Augmented (RAG)', 'BM25 Vector/Term Search', 'Context Grounding', 'LLM Gateways'],
    details: 'Building practical AI features that never hallucinate by constraining LLM generation to verified vector & keyword context, with local offline fallbacks and rate-limited backend proxies.',
    metrics: '100% grounded facts',
  },
];

const BLUEPRINTS = [
  {
    id: 'streaming',
    label: 'Real-Time Kafka Pipeline',
    badge: 'Event Streaming',
    description: 'High-throughput live market ticker ingestion and WebSocket fanout used in production-grade trading terminals.',
    steps: [
      { name: 'Producer Ingestion', tool: 'KafkaJS Node.js Worker', desc: 'Pulls external exchange WebSocket streams, serializes payloads, and writes to partitioned topics.' },
      { name: 'Distributed Log', tool: 'Aiven Cloud Apache Kafka', desc: 'Encrypted persistent commit log with partition replication and configurable retention windows.' },
      { name: 'Consumer Group', tool: 'Stateless Node.js Consumers', desc: 'Horizontally scaled consumer pool with automatic partition rebalancing and backpressure handling.' },
      { name: 'WebSocket Fan-out', tool: 'Socket.io Cluster', desc: 'Rooms fanning out live price ticks to thousands of connected browser charts with minimal overhead.' },
    ],
  },
  {
    id: 'auth',
    label: 'Secure RBAC & Microservice Flow',
    badge: 'Enterprise Security',
    description: 'Multi-tenant authentication and permission pipeline across independent service domains.',
    steps: [
      { name: 'Client Request', tool: 'HTTP / HTTPS TLS 1.3', desc: 'Secure payload transmission with custom headers and client fingerprint verification.' },
      { name: 'API Gateway & Guards', tool: 'NestJS / Spring Filter Chain', desc: 'Extracts Bearer token, validates cryptographic signature, and loads user permission roles.' },
      { name: 'Domain Authorization', tool: 'Method-level @Roles Decorator', desc: 'Enforces least-privilege access rules before request enters domain service logic.' },
      { name: 'Transactional Service', tool: 'TypeORM / Spring Data JPA', desc: 'Executes atomic ACID transactions with rollback guarantees and audit logging.' },
    ],
  },
  {
    id: 'ai-pipeline',
    label: 'Grounded RAG & AI Integration',
    badge: 'Applied AI',
    description: 'Deterministic knowledge retrieval architecture powering verified AI career & technical assistants.',
    steps: [
      { name: 'User Query & Intent', tool: 'Semantic Tokenizer', desc: 'Cleans, tokenizes, and stems queries while filtering conversational pleasantries.' },
      { name: 'Retrieval Engine', tool: 'BM25-Ranked Knowledge Graph', desc: 'Fetches verified candidate documents from structured portfolio data with strict relevance thresholds.' },
      { name: 'Backend Proxy & Rate Limit', tool: 'Vercel Serverless Function', desc: 'Validates origin, enforces IP rate limits, and injects retrieved context as strict ground truth.' },
      { name: 'Safe Output Stream', tool: 'Deterministic Fallback Engine', desc: 'Emits grounded response; instantly drops to high-confidence local engine if upstream is unavailable.' },
    ],
  },
];

export default function Architecture() {
  const reduce = useReducedMotion();
  const [activeBlueprint, setActiveBlueprint] = useState('streaming');
  const currentBlueprint = BLUEPRINTS.find((b) => b.id === activeBlueprint) || BLUEPRINTS[0];

  return (
    <section id="architecture" className="section">
      <SectionHeading
        eyebrow="04 — Architecture & Engineering"
        title="Engineering scalable, reliable systems."
      >
        A deep dive into the architectural principles, data pipelines, and design patterns I use to deliver production-grade software.
      </SectionHeading>

      {/* ── Architecture Pillars Grid ── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PILLARS.map((p, idx) => {
          const Icon = p.icon;
          return (
            <motion.div
              key={p.id}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: idx * 0.06 }}
            >
              <SpotlightCard className="flex h-full flex-col justify-between p-6">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl border border-line/10 bg-accent/10 text-accent">
                      <Icon size={20} />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-accent/80">
                      {p.metrics}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-semibold tracking-tight">{p.title}</h3>
                  <p className="mt-1 font-mono text-xs text-accent">{p.tagline}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{p.details}</p>
                </div>

                <div className="mt-5 border-t border-line/10 pt-4">
                  <div className="flex flex-wrap gap-1.5">
                    {p.highlights.map((h) => (
                      <span key={h} className="chip">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          );
        })}
      </div>

      {/* ── Interactive Architecture Blueprint Visualizer ── */}
      <div className="glass mt-10 overflow-hidden rounded-3xl border border-line/10 p-6 md:p-8">
        <div className="flex flex-col gap-4 border-b border-line/10 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent">
              <Workflow size={14} />
              <span>Interactive System Blueprint</span>
            </div>
            <h3 className="mt-2 text-2xl font-semibold">Production Data Flow &amp; Lifecycle</h3>
            <p className="mt-1 text-sm text-muted">
              Select an architectural blueprint to inspect the step-by-step pipeline guarantees.
            </p>
          </div>

          {/* Blueprint Selector Tabs */}
          <div className="flex flex-wrap gap-1.5 rounded-2xl border border-line/10 bg-background/50 p-1.5">
            {BLUEPRINTS.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setActiveBlueprint(b.id)}
                className={cn(
                  'rounded-xl px-3.5 py-1.5 font-mono text-xs font-medium transition',
                  activeBlueprint === b.id
                    ? 'bg-accent text-[rgb(7_8_12)] shadow-sm'
                    : 'text-muted hover:text-foreground hover:bg-line/5',
                )}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Blueprint Flow Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBlueprint.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="mt-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[11px] text-accent">
                {currentBlueprint.badge}
              </span>
              <p className="text-sm text-muted">{currentBlueprint.description}</p>
            </div>

            {/* Stepper Flow Cards */}
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {currentBlueprint.steps.map((s, i) => (
                <div
                  key={s.name}
                  className="relative flex flex-col justify-between rounded-2xl border border-line/10 bg-line/[0.03] p-5 transition hover:border-accent/40"
                >
                  {/* Step Connector Indicator */}
                  {i < currentBlueprint.steps.length - 1 && (
                    <div className="pointer-events-none absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 md:block">
                      <div className="grid h-6 w-6 place-items-center rounded-full border border-line/20 bg-background text-accent">
                        <ArrowRight size={12} />
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between font-mono text-[11px] text-muted">
                      <span>Step 0{i + 1}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    </div>
                    <h4 className="mt-2 text-base font-semibold text-foreground">{s.name}</h4>
                    <span className="mt-1 inline-block font-mono text-xs text-accent">{s.tool}</span>
                    <p className="mt-3 text-xs leading-relaxed text-muted">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

