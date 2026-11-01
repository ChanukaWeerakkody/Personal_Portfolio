import { skills, projects, timeline } from '@/data/profile';

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9+#./ ]+/g, ' ');

// Set of technologies verified in production jobs or completed project tags
const PRODUCTION_VERIFIED = new Set([
  'spring boot', 'nestjs', 'node.js', 'java', 'typescript', 'php', 'laravel',
  'mysql', 'postgresql', 'mongodb', 'redis', 'apache kafka', 'docker',
  'rest api design', 'jwt & rbac', 'websockets', 'react', 'react native'
]);

// Build a lookup of every term → skill
const index = skills.flatMap((s) =>
  [s.name, ...s.aliases].map((term) => ({ term: norm(term).trim(), skill: s })),
);

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function containsTerm(text, term) {
  const re = new RegExp(`(^|[^a-z0-9])${escapeRe(term)}($|[^a-z0-9])`, 'i');
  return re.test(text);
}

/**
 * Match free-text (a job description) against the verified skill graph.
 * Clearly separates Direct Production Experience from Transferable / Inferred Relevance.
 */
export function matchJobDescription(raw) {
  const text = ` ${norm(raw)} `;
  const hits = new Map();
  for (const { term, skill } of index) {
    if (term && containsTerm(text, term)) hits.set(skill.name, skill);
  }
  const allMatched = [...hits.values()].sort((a, b) => b.level - a.level);

  // Distinguish Direct Production Experience vs Inferred / Transferable
  const directMatches = [];
  const inferredMatches = [];

  allMatched.forEach((skill) => {
    const key = norm(skill.name).trim();
    const isDirect = PRODUCTION_VERIFIED.has(key) ||
      projects.some((p) => (p.tags || []).some((t) => norm(t) === key)) ||
      timeline.some((tl) => (tl.tags || []).some((t) => norm(t) === key));

    if (isDirect) {
      directMatches.push(skill);
    } else {
      inferredMatches.push(skill);
    }
  });

  // Identify honest gaps (technologies in JD not in skill graph)
  const known = new Set(index.map((i) => i.term));
  const candidates = raw.match(/\b[A-Z][A-Za-z]+(?:\.js)?|\b[a-z]+\.js\b|\bC\+\+|\bC#|\bGo(?:lang)?\b|\bRust\b|\bKubernetes\b|\bGraphQL\b|\bTerraform\b|\bAWS\b|\bAzure\b|\bRabbitMQ\b/g) ?? [];
  const common = new Set([
    'The', 'We', 'You', 'And', 'Our', 'With', 'For', 'This', 'Experience', 'Strong',
    'Required', 'Skills', 'Responsibilities', 'Requirements', 'Team', 'Work', 'Looking',
    'Senior', 'Junior', 'Engineer', 'Developer', 'Software', 'Backend', 'Frontend',
    'Full', 'Stack', 'Must', 'Nice', 'Have', 'Ability', 'Knowledge', 'Understanding',
    'Good', 'Excellent', 'Years', 'Role', 'Job', 'About', 'Company', 'Benefits', 'Salary',
    'Apply', 'Build', 'Design', 'Bonus', 'Plus', 'Familiarity', 'Proficiency', 'Hands',
    'Proven', 'Track', 'Record', 'Preferred', 'Optional', 'Ideal', 'Candidate', 'Position',
    'Opportunity', 'Remote', 'Type'
  ]);
  const knownWords = new Set(index.flatMap((i) => i.term.split(/[^a-z0-9+#.]+/)).filter(Boolean));
  const gaps = [...new Set(candidates)]
    .filter((c) => {
      const w = norm(c).trim();
      const singular = w.replace(/s$/, '');
      return !common.has(c) && c.length > 2 && !known.has(w) && !knownWords.has(w) && !knownWords.has(singular);
    })
    .slice(0, 5);

  // Transparent scoring algorithm
  const directScore = directMatches.reduce((acc, s) => acc + s.level * 1.0, 0);
  const inferredScore = inferredMatches.reduce((acc, s) => acc + s.level * 0.65, 0);
  const totalWeight = (directMatches.length + inferredMatches.length) * 5 || 1;
  const strengthRatio = (directScore + inferredScore) / totalWeight;

  const totalEvaluated = directMatches.length + inferredMatches.length + gaps.length;
  const coverageRatio = totalEvaluated > 0 ? (directMatches.length + inferredMatches.length) / totalEvaluated : 0;

  const score = allMatched.length === 0 ? 0 : Math.min(100, Math.round((strengthRatio * 0.6 + coverageRatio * 0.4) * 100));

  // Category alignment calculation
  const categories = ['Backend', 'Databases', 'Architecture', 'DevOps'];
  const categoryStats = categories.map((cat) => {
    const inCat = allMatched.filter((s) => s.cat === cat || (cat === 'Backend' && s.cat === 'Languages'));
    return { category: cat, count: inCat.length };
  });

  // Overlapping projects
  const relevantProjects = projects
    .map((p) => ({
      p,
      n: (p.tags || []).filter((t) => allMatched.some((m) => norm(t).includes(norm(m.name)) || norm(m.name).includes(norm(t)))).length,
    }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 3)
    .map((x) => x.p);

  return {
    matched: allMatched,
    directMatches,
    inferredMatches,
    gaps,
    score,
    categoryStats,
    relevantProjects,
  };
}

export const SAMPLE_JD = `Backend Engineer — We are looking for a backend engineer with strong experience in Spring Boot and NestJS to build scalable microservices and RESTful APIs. You will work with PostgreSQL, Redis, and Apache Kafka for real-time event streaming, enforce JWT & RBAC security, and ship containerized services using Docker. Bonus: Kubernetes and GraphQL.`;
