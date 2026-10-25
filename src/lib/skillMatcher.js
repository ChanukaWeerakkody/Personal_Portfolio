import { skills, projects } from '@/data/profile';

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9+#./ ]+/g, ' ');

// Build a lookup of every term → skill
const index = skills.flatMap((s) =>
  [s.name, ...s.aliases].map((term) => ({ term: norm(term).trim(), skill: s })),
);

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function containsTerm(text, term) {
  // Word-boundary-ish match that also works for terms like "c++", "node.js", "ci/cd".
  const re = new RegExp(`(^|[^a-z0-9])${escapeRe(term)}($|[^a-z0-9])`, 'i');
  return re.test(text);
}

/**
 * Match free-text (a job description) against the skill graph.
 * Returns matched skills, a weighted score, relevant projects and honest gaps.
 */
export function matchJobDescription(raw) {
  const text = ` ${norm(raw)} `;
  const hits = new Map();
  for (const { term, skill } of index) {
    if (term && containsTerm(text, term)) hits.set(skill.name, skill);
  }
  const matched = [...hits.values()].sort((a, b) => b.level - a.level);

  // Words that look like technologies but aren't in the skill graph → honest gaps.
  const known = new Set(index.map((i) => i.term));
  const candidates = raw.match(/\b[A-Z][A-Za-z]+(?:\.js)?|\b[a-z]+\.js\b|\bC\+\+|\bC#|\bGo(?:lang)?\b|\bRust\b|\bKubernetes\b|\bGraphQL\b|\bTerraform\b/g) ?? [];
  const common = new Set(['The', 'We', 'You', 'And', 'Our', 'With', 'For', 'This', 'Experience', 'Strong', 'Required', 'Skills', 'Responsibilities', 'Requirements', 'Team', 'Work', 'Looking', 'Senior', 'Junior', 'Engineer', 'Developer', 'Software', 'Backend', 'Frontend', 'Full', 'Stack', 'Must', 'Nice', 'Have', 'Ability', 'Knowledge', 'Understanding', 'Good', 'Excellent', 'Years', 'Role', 'Job', 'About', 'Company', 'Benefits', 'Salary', 'Apply', 'Build', 'Design', 'Bonus', 'Plus', 'Familiarity', 'Proficiency', 'Hands', 'Proven', 'Track', 'Record', 'Preferred', 'Optional', 'Ideal', 'Candidate', 'Position', 'Opportunity', 'Remote', 'Type']);
  // Every individual word of every known term/alias (so "Boot" from "Spring Boot" is never a gap).
  const knownWords = new Set(index.flatMap((i) => i.term.split(/[^a-z0-9+#.]+/)).filter(Boolean));
  const gaps = [...new Set(candidates)]
    .filter((c) => {
      const w = norm(c).trim();
      const singular = w.replace(/s$/, '');
      return !common.has(c) && c.length > 2 && !known.has(w) && !knownWords.has(w) && !knownWords.has(singular);
    })
    .slice(0, 6);

  const maxPossible = matched.length * 5 || 1;
  const strength = matched.reduce((n, s) => n + s.level, 0) / maxPossible;
  const coverage = matched.length / Math.max(matched.length + gaps.length, 1);
  const score = matched.length === 0 ? 0 : Math.round((strength * 0.55 + coverage * 0.45) * 100);

  const relevantProjects = projects
    .map((p) => ({ p, n: p.tags.filter((t) => matched.some((m) => norm(t).includes(norm(m.name)) || norm(m.name).includes(norm(t)))).length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 3)
    .map((x) => x.p);

  return { matched, gaps, score, relevantProjects };
}

export const SAMPLE_JD = `Backend Engineer — we're looking for someone with strong Java and Spring Boot experience building REST APIs and microservices. You'll work with PostgreSQL, Redis and Kafka, ship with Docker and CI/CD, and care about JWT-based security. Bonus: Kubernetes and GraphQL.`;
