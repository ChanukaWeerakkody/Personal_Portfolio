import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Blocks,
  CheckCircle2,
  Code2,
  Database,
  Layers3,
  Server,
  Sparkles,
  Wand2,
  Wrench,
} from 'lucide-react';

import {
  siDocker,
  siExpress,
  siNodedotjs,
  siPostgresql,
  siReact,
  siSpringboot,
  siTailwindcss,
  siTypescript,
} from 'simple-icons';

// Java was removed from simple-icons v16 — use a hand-rolled path.
const siJava = {
  path: 'M8.851 18.56s-.917.534.653.714c1.902.218 2.874.187 4.969-.211 0 0 .552.346 1.321.646-4.699 2.013-10.633-.118-6.943-1.149M8.276 15.933s-1.028.761.542.924c2.032.209 3.636.227 6.413-.308 0 0 .384.389.987.602-5.679 1.661-12.007.13-7.942-1.218M13.116 11.475c1.158 1.333-.304 2.533-.304 2.533s2.939-1.518 1.589-3.418c-1.261-1.772-2.228-2.652 3.007-5.688 0 0-8.216 2.051-4.292 6.573M19.33 20.504s.679.559-.747.991c-2.712.822-11.288 1.069-13.669.033-.856-.373.75-.89 1.254-.998.527-.114.828-.093.828-.093-.953-.671-6.156 1.317-2.643 1.887 9.58 1.553 17.462-.7 14.977-1.82M9.292 13.21s-4.362 1.036-1.544 1.412c1.189.159 3.561.123 5.77-.062 1.806-.152 3.618-.477 3.618-.477s-.637.272-1.098.587c-4.429 1.165-12.986.623-10.522-.568 2.082-1.006 3.776-.892 3.776-.892M17.116 17.584c4.503-2.34 2.421-4.589.968-4.285-.355.074-.515.138-.515.138s.132-.207.385-.297c2.875-1.011 5.086 2.981-.928 4.562 0 .001.07-.062.09-.118M14.401 0s2.494 2.494-2.365 6.33c-3.896 3.077-.888 4.832-.001 6.836-2.274-2.053-3.943-3.858-2.824-5.539 1.644-2.469 6.197-3.665 5.19-7.627M9.734 23.924c4.322.277 10.959-.153 11.116-2.19 0 0-.302.775-3.572 1.391-3.688.694-8.239.613-10.937.168 0-.001.553.457 3.393.631',
};

import { matchJobDescription, SAMPLE_JD } from '@/lib/skillMatcher';
import { cn, scrollToId } from '@/lib/utils';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';

const categories = [
  {
    name: 'Backend Engineering',
    number: '01',
    icon: Server,
    span: 'md:col-span-7',
    skills: [
      { name: 'Java', icon: siJava, color: '#f89820', level: 'Core' },
      { name: 'Spring Boot', icon: siSpringboot, color: '#6db33f', level: 'Core' },
      { name: 'Node.js', icon: siNodedotjs, color: '#83cd29', level: 'Core' },
      { name: 'Express.js', icon: siExpress, color: '#b8c1c8', level: 'Core' },
    ],
  },
  {
    name: 'Frontend Systems',
    number: '02',
    icon: Layers3,
    span: 'md:col-span-5',
    skills: [
      { name: 'React', icon: siReact, color: '#61dafb', level: 'Core' },
      { name: 'TypeScript', icon: siTypescript, color: '#3178c6', level: 'Core' },
      { name: 'Tailwind CSS', icon: siTailwindcss, color: '#38bdf8', level: 'Core' },
    ],
  },
  {
    name: 'Data & Delivery',
    number: '03',
    icon: Database,
    span: 'md:col-span-5',
    skills: [
      { name: 'PostgreSQL', icon: siPostgresql, color: '#4169e1', level: 'Core' },
      { name: 'Docker', icon: siDocker, color: '#2496ed', level: 'Working' },
      {
        name: 'Query Optimisation',
        icon: Database,
        color: '#64d2ff',
        level: 'Core',
      },
    ],
  },
  {
    name: 'Architecture & Workflow',
    number: '04',
    icon: Wrench,
    span: 'md:col-span-7',
    skills: [
      {
        name: 'Microservices',
        icon: Blocks,
        color: '#a78bfa',
        level: 'Working',
      },
      {
        name: 'RESTful APIs',
        icon: Code2,
        color: '#64d2ff',
        level: 'Core',
      },
      {
        name: 'Git & Agile',
        icon: Wrench,
        color: '#f97316',
        level: 'Working',
      },
    ],
  },
];

const coreStack = [
  { name: 'Java', icon: siJava, color: '#f89820' },
  { name: 'React', icon: siReact, color: '#61dafb' },
  { name: 'Node.js', icon: siNodedotjs, color: '#83cd29' },
  { name: 'PostgreSQL', icon: siPostgresql, color: '#4169e1' },
];

function BrandIcon({ icon, color }) {
  if (icon?.path) {
    return (
      <svg
        viewBox="0 0 24 24"
        role="img"
        aria-hidden="true"
        className="h-5 w-5 shrink-0"
        style={{ color }}
      >
        <path d={icon.path} fill="currentColor" />
      </svg>
    );
  }

  const Icon = icon;

  return (
    <Icon
      aria-hidden="true"
      className="h-5 w-5 shrink-0"
      style={{ color }}
    />
  );
}

function StatusChip({ level }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-1',
        'font-mono text-[9px] uppercase tracking-wider',
        'transition-colors',
        level === 'Core'
          ? 'border-accent/20 bg-accent/10 text-accent'
          : 'border-line/10 bg-background/40 text-muted',
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          level === 'Core' ? 'bg-accent' : 'bg-muted',
        )}
      />

      {level}
    </span>
  );
}

function TechSkillTile({ skill }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group flex min-w-0 items-center gap-3 rounded-2xl',
        'border border-line/10 bg-background/30 p-3',
        'transition-all duration-300',
        'hover:border-accent/20 hover:bg-accent/[0.04]',
      )}
    >
      <div
        className={cn(
          'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
          'border border-line/10 bg-background/60',
          'transition-all duration-300',
          'group-hover:border-accent/20',
        )}
      >
        <BrandIcon icon={skill.icon} color={skill.color} />
      </div>

      <span className="min-w-0 flex-1 truncate text-sm font-medium">
        {skill.name}
      </span>

      <StatusChip level={skill.level} />
    </motion.div>
  );
}

function ScoreRing({ score }) {
  const radius = 43;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg
        viewBox="0 0 100 100"
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".1"
          strokeWidth="7"
        />

        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="rgb(var(--accent))"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset:
              circumference * (1 - score / 100),
          }}
          transition={{
            duration: 1,
            ease: 'easeOut',
          }}
        />
      </svg>

      <div className="absolute inset-0 grid place-items-center">
        <span className="font-display text-3xl font-semibold">
          {score}
          <span className="text-sm text-muted">%</span>
        </span>
      </div>
    </div>
  );
}

function JobMatcher() {
  const [jd, setJd] = useState('');
  const [result, setResult] = useState(null);

  const run = () => {
    if (jd.trim().length < 12) return;

    setResult(matchJobDescription(jd));
  };

  const verdict = useMemo(() => {
    if (!result) return '';

    if (result.matched.length === 0) {
      return "I couldn't identify recognisable technologies. Try pasting a fuller job description.";
    }

    const directCount = result.directMatches?.length || 0;
    const inferredCount = result.inferredMatches?.length || 0;

    if (result.score >= 75) {
      return `Strong production fit (${result.score}%) — ${directCount} direct production technologies verified in real SaaS/enterprise apps, plus ${inferredCount} transferable skills.`;
    }

    if (result.score >= 50) {
      return `Solid technical alignment (${result.score}%) — Core backend foundations match with ${directCount} verified production tools. Minimal ramp-up needed.`;
    }

    return `Partial overlap (${result.score}%) — Transferable backend and API fundamentals apply, though some requested tools are outside his primary stack.`;
  }, [result]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
      className={cn(
        'relative overflow-hidden rounded-3xl',
        'border border-line/10 bg-background/40',
        'p-6 md:p-8',
      )}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-accent/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              <Sparkles size={13} />
              Role compatibility
            </p>

            <h3 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
              Does Chanuka fit your role?
            </h3>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Paste a job description and compare its requirements against
              the technologies and experience represented in this portfolio.
            </p>
          </div>

          <span className="inline-flex w-fit shrink-0 items-center rounded-full border border-line/10 bg-background/50 px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-muted">
            Runs locally
          </span>
        </div>

        <label
          htmlFor="jd"
          className="sr-only"
        >
          Job description
        </label>

        <textarea
          id="jd"
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          rows={5}
          maxLength={4000}
          placeholder="Paste a job description or list of requirements…"
          className={cn(
            'mt-6 w-full resize-y rounded-2xl',
            'border border-line/10 bg-background/50',
            'px-4 py-3 text-sm leading-6',
            'outline-none transition-all',
            'placeholder:text-muted',
            'focus:border-accent/30 focus:ring-1 focus:ring-accent/20',
          )}
        />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={run}
            disabled={jd.trim().length < 12}
            className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Wand2 size={15} />
            Analyse match
          </button>

          <button
            type="button"
            onClick={() => {
              setJd(SAMPLE_JD);
              setResult(matchJobDescription(SAMPLE_JD));
            }}
            className="btn btn-ghost"
          >
            Try a sample
          </button>

          <span className="ml-auto font-mono text-[10px] text-muted">
            {jd.length}/4000
          </span>
        </div>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key={`${result.score}-${result.matched.length}`}
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: 0.35,
              }}
              className="mt-8 border-t border-line/10 pt-6"
              aria-live="polite"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                {result.matched.length > 0 && (
                  <ScoreRing score={result.score} />
                )}

                <div>
                  <p className="text-sm leading-6 text-muted">
                    {verdict}
                  </p>

                  {result.matched.length > 0 && (
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-muted">
                      {result.matched.length} matching skills detected
                    </p>
                  )}
                </div>
              </div>

              {result.matched.length > 0 && (
                <div className="mt-7 grid gap-6 md:grid-cols-3">
                  {/* Direct Production Experience */}
                  <div>
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-emerald-400">
                      <CheckCircle2 size={15} />
                      Production Experience
                      <span className="font-mono text-[10px] text-muted">
                        ({result.directMatches.length})
                      </span>
                    </h4>

                    <ul className="flex flex-wrap gap-1.5">
                      {result.directMatches.map((skill) => (
                        <li
                          key={skill.name}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-xs text-foreground"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          {skill.name}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Transferable / Inferred Relevance */}
                  <div>
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-sky-400">
                      <Sparkles size={14} />
                      Transferable Relevance
                      <span className="font-mono text-[10px] text-muted">
                        ({result.inferredMatches.length})
                      </span>
                    </h4>

                    {result.inferredMatches.length > 0 ? (
                      <ul className="flex flex-wrap gap-1.5">
                        {result.inferredMatches.map((skill) => (
                          <li
                            key={skill.name}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/20 bg-sky-500/10 px-2.5 py-1.5 text-xs text-foreground"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                            {skill.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted">Direct core match covers requirements.</p>
                    )}
                  </div>

                  {/* Missing Gaps */}
                  <div>
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-amber-400">
                      <AlertTriangle size={15} />
                      Missing Requirements
                      <span className="font-mono text-[10px] text-muted">
                        ({result.gaps.length})
                      </span>
                    </h4>

                    {result.gaps.length > 0 ? (
                      <ul className="flex flex-wrap gap-1.5">
                        {result.gaps.map((gap) => (
                          <li
                            key={gap}
                            className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-2.5 py-1.5 text-xs text-muted"
                          >
                            {gap}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-emerald-400/80 flex items-center gap-1">
                        <CheckCircle2 size={12} /> No critical stack gaps found.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {result.relevantProjects.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-muted">
                  <span>Relevant work:</span>

                  {result.relevantProjects.map((project) => (
                    <span
                      key={project.title}
                      className="rounded-full border border-line/10 bg-background/40 px-2.5 py-1 text-xs"
                    >
                      {project.title.split(' – ')[0]}
                    </span>
                  ))}

                  <button
                    type="button"
                    onClick={() => scrollToId('projects')}
                    className="text-accent underline-offset-4 hover:underline"
                  >
                    View projects →
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function Skills() {
  const marqueeSkills = categories.flatMap(
    (category) => category.skills,
  );

  return (
    <section
      id="skills"
      className="relative overflow-hidden py-16 md:py-28"
    >
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        <div className="absolute inset-x-0 top-0 h-[45%] bg-[radial-gradient(ellipse_at_top,rgb(var(--accent)/0.10),transparent_65%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="03 — Skills"
          title="A focused, production-tested stack."
        />

        {/* Modern heading */}
        <motion.div
          className="mb-10 text-center"
          initial={{
            opacity: 0,
            y: 24,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.6,
          }}
        >
          <h2 className="mt-2 text-4xl font-bold tracking-tight md:text-6xl">
            Tech{' '}
            <span className="bg-gradient-to-r from-accent to-foreground/40 bg-clip-text text-transparent">
              Stack
            </span>
          </h2>

          <p className="mt-3 text-sm text-muted md:text-base">
            The tools behind production-ready systems.
          </p>
        </motion.div>

        {/* Core stack overview */}
        <motion.div
          className={cn(
            'mb-5 overflow-hidden rounded-3xl',
            'border border-line/10 bg-background/40',
            'p-6 md:p-7',
          )}
          initial={{
            opacity: 0,
            y: 24,
            scale: 0.98,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          viewport={{
            once: true,
            margin: '-60px',
          }}
          transition={{
            duration: 0.55,
          }}
        >
          <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
            <div>
              <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                <Code2 size={14} />
                Core stack
              </p>

              <h3 className="mt-2 text-xl font-bold md:text-2xl">
                Building reliable full-stack systems
              </h3>

              <p className="mt-1 text-sm text-muted">
                A focused toolkit shaped by real production work.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {coreStack.map((skill) => (
                <motion.span
                  key={skill.name}
                  whileHover={{
                    y: -2,
                  }}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-xl',
                    'border border-line/10 bg-background/50',
                    'px-3 py-2 text-xs font-medium',
                    'transition-all hover:border-accent/20',
                  )}
                >
                  <BrandIcon
                    icon={skill.icon}
                    color={skill.color}
                  />

                  {skill.name}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
          {categories.map((category, index) => {
            const CategoryIcon = category.icon;

            return (
              <motion.article
                key={category.name}
                className={cn(
                  'group relative overflow-hidden rounded-3xl',
                  'border border-line/10 bg-background/40',
                  'p-5 md:p-6',
                  category.span,
                )}
                initial={{
                  opacity: 0,
                  y: 28,
                  scale: 0.97,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                whileHover={{
                  y: -4,
                }}
                viewport={{
                  once: true,
                  margin: '-70px',
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                }}
              >
                {/* Card glow */}
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-accent/5 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                  aria-hidden="true"
                />

                <div className="relative z-10 mb-6 flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={cn(
                        'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
                        'border border-line/10 bg-background/50',
                        'text-accent',
                      )}
                    >
                      <CategoryIcon size={17} />
                    </div>

                    <h3 className="truncate font-mono text-[10px] uppercase tracking-[0.13em] text-accent md:text-xs">
                      {category.name}
                    </h3>
                  </div>

                  <span className="shrink-0 font-mono text-[10px] text-muted">
                    {category.number}
                  </span>
                </div>

                <div className="relative z-10 grid gap-3 sm:grid-cols-2">
                  {category.skills.map((skill) => (
                    <TechSkillTile
                      key={skill.name}
                      skill={skill}
                    />
                  ))}
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Infinite marquee */}
        <div className="relative mt-20 overflow-hidden py-5">
          {/* Edge fades */}
          <div
            className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-background to-transparent md:w-32"
            aria-hidden="true"
          />

          <div
            className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-background to-transparent md:w-32"
            aria-hidden="true"
          />

          <motion.div
            className="flex w-max items-center gap-10 whitespace-nowrap"
            animate={{
              x: ['0%', '-50%'],
            }}
            transition={{
              duration: 28,
              ease: 'linear',
              repeat: Infinity,
            }}
          >
            {[...marqueeSkills, ...marqueeSkills].map(
              (skill, index) => (
                <div
                  key={`${skill.name}-${index}`}
                  className="group flex items-center gap-3 opacity-40 transition-opacity hover:opacity-100"
                >
                  <BrandIcon
                    icon={skill.icon}
                    color={skill.color}
                  />

                  <span className="font-mono text-lg font-bold tracking-tight">
                    {skill.name}
                  </span>

                  <span className="text-accent/40">•</span>
                </div>
              ),
            )}
          </motion.div>
        </div>

        {/* Job matcher */}
        <div className="mt-14">
          <JobMatcher />
        </div>
      </div>
    </section>
  );
}