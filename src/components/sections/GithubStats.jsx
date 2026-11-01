import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, ExternalLink, GitFork, Github, GitBranch, Star, Users } from 'lucide-react';
import { useContributions, useGithub } from '@/hooks/useGithub';
import { profile } from '@/data/profile';
import SectionHeading from '@/components/ui/SectionHeading';
import SpotlightCard from '@/components/ui/SpotlightCard';
import CountUp from '@/components/ui/CountUp';

const user = import.meta.env.VITE_GITHUB_USER || profile.github;
const shades = ['bg-line/10', 'bg-accent/25', 'bg-accent/50', 'bg-accent/75', 'bg-accent'];
const ago = (iso) => { const d = Math.floor((Date.now() - new Date(iso)) / 864e5); return d < 1 ? 'today' : d < 30 ? `${d}d ago` : `${Math.floor(d / 30)}mo ago`; };

const bitbucketActivity = [
  ['API & Backend', 18],
  ['Architecture', 14],
  ['Bug fixes', 11],
  ['Documentation', 7],
];

function Skeleton({ className }) { return <div className={`animate-pulse rounded-lg bg-line/10 ${className}`} />; }

export default function GithubStats() {
  const gh = useGithub(user);
  const cal = useContributions(user);
  const loading = gh.status === 'loading';
  const failed = gh.status === 'error';

  const streak = useMemo(() => {
    const days = cal.weeks.flat();
    let best = 0, cur = 0;
    days.forEach((d) => { cur = d.count > 0 ? cur + 1 : 0; best = Math.max(best, cur); });
    return best;
  }, [cal.weeks]);

  return (
    <section id="github" className="section">
      <SectionHeading eyebrow="06 — Open source" title="Open-source activity.">Live GitHub REST metrics plus a Bitbucket activity summary that respects private-workspace restrictions.</SectionHeading>

      {failed ? (
        <SpotlightCard className="p-8 text-center">
          <p className="text-muted">GitHub's API is rate-limiting or unreachable right now.</p>
          <a href={profile.githubUrl} target="_blank" rel="noreferrer noopener" className="btn btn-ghost mt-4"><Github size={15} /> Open profile</a>
        </SpotlightCard>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          <SpotlightCard className="p-6 lg:col-span-2">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-display text-4xl font-semibold">{cal.status === 'ready' ? <CountUp to={cal.total} /> : '—'}</p>
                <p className="text-sm text-muted">contributions in the last year{streak > 0 && ` · longest streak ${streak} days`}</p>
              </div>
              <a href={profile.githubUrl} target="_blank" rel="noreferrer noopener" className="btn btn-ghost !py-1.5 text-xs"><Github size={14} /> @{user}</a>
            </div>
            <div className="scroll-thin overflow-x-auto pb-2" role="img" aria-label={`Contribution graph, ${cal.total} contributions in the last year`}>
              {cal.status === 'loading' && <Skeleton className="h-28 min-w-[640px]" />}
              {cal.status === 'error' && <p className="py-8 text-center text-sm text-muted">Contribution graph unavailable.</p>}
              {cal.status === 'ready' && (
                <div className="flex min-w-[640px] gap-[3px]">
                  {cal.weeks.map((w, wi) => (
                    <div key={wi} className="flex flex-col gap-[3px]">
                      {w.map((d) => (
                        <motion.span key={d.date} title={`${d.count} on ${d.date}`} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: wi * 0.008 }}
                          className={`h-[11px] w-[11px] rounded-[3px] ${shades[Math.min(d.level, 4)]}`} />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-6">
            <h3 className="mb-4 font-mono text-xs uppercase tracking-widest text-accent">Profile</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[[GitFork, gh.profile?.repos, 'Repos'], [Star, gh.stars, 'Stars'], [Users, gh.profile?.followers, 'Followers']].map(([Icon, v, l]) => (
                <div key={l} className="rounded-xl border border-line/10 p-3">
                  <Icon size={15} className="mx-auto text-accent" />
                  {loading ? <Skeleton className="mx-auto mt-2 h-6 w-8" /> : <p className="mt-1 font-display text-xl font-semibold">{v ?? 0}</p>}
                  <p className="text-[11px] text-muted">{l}</p>
                </div>
              ))}
            </div>
            <h3 className="mb-3 mt-6 font-mono text-xs uppercase tracking-widest text-accent">Top languages</h3>
            <ul className="space-y-2.5">
              {loading ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-4" />) : gh.languages.map((l) => (
                <li key={l.name}>
                  <div className="flex justify-between text-xs"><span>{l.name}</span><span className="text-muted">{l.pct}%</span></div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line/10"><motion.div className="h-full rounded-full bg-accent" initial={{ width: 0 }} whileInView={{ width: `${l.pct}%` }} viewport={{ once: true }} transition={{ duration: 0.8 }} /></div>
                </li>
              ))}
            </ul>
          </SpotlightCard>

          <div className="grid gap-5 lg:col-span-3 lg:grid-cols-2">
            {/* <SpotlightCard className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-widest text-accent">GitHub overview</h3>
                  <p className="mt-2 text-sm text-muted">Live repository metrics from the public GitHub REST API.</p>
                </div>
                <Github size={20} className="text-accent" />
              </div>
              <img
                className="mt-5 w-full rounded-xl border border-line/10 bg-background/60"
                src={`https://github-readme-stats.vercel.app/api?username=${user}&show_icons=true&hide_border=true&hide_title=true&include_all_commits=true&count_private=false&theme=transparent&title_color=${isDark ? 'edeef2' : '0e111a'}&text_color=${isDark ? '949cac' : '586070'}&icon_color=6366f1`}
                alt="GitHub statistics"
                loading="lazy"
              />
            </SpotlightCard> */}

            <SpotlightCard className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono text-xs uppercase tracking-widest text-accent">Bitbucket activity</h3>
                    <span className="rounded-full border border-line/15 bg-line/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted">
                      Private Enterprise Workspaces
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted">Curated distribution summary for private enterprise repositories. Commercial client source code is protected under NDA and not exposed via public API.</p>
                </div>
                <GitBranch size={20} className="shrink-0 text-accent" />
              </div>
              <div className="mt-5 space-y-3">
                {bitbucketActivity.map(([label, value]) => (
                  <div key={label}>
                    <div className="flex items-center justify-between text-xs">
                      <span>{label}</span><span className="font-mono text-[11px] text-muted">{value} enterprise tasks</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line/10">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(value * 4, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-line/10 bg-line/[0.04] p-3 text-xs text-muted">
                <Activity size={14} className="shrink-0 text-accent" />
                Demonstration distribution representing commercial engineering contributions. GitHub above reflects 100% verified live public API data.
              </div>
            </SpotlightCard>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-4">
            {loading ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />) : gh.repos.map((r) => (
              <SpotlightCard key={r.name} as="a" href={r.url} target="_blank" rel="noreferrer noopener" className="glass-hover block p-4">
                <div className="flex items-center justify-between"><span className="truncate font-mono text-sm">{r.name}</span><ExternalLink size={13} className="shrink-0 text-muted" /></div>
                <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-xs text-muted">{r.desc || 'No description'}</p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-muted"><span>{r.lang || '—'}</span><span className="flex items-center gap-2"><span className="flex items-center gap-0.5"><Star size={11} />{r.stars}</span>{ago(r.pushed)}</span></div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
