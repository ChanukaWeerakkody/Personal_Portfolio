/** Deterministic, data-grounded project summaries in three audiences (no hallucination, no network). */
export const SUMMARY_MODES = [
  { id: 'recruiter', label: 'Recruiter' },
  { id: 'engineer', label: 'Engineer' },
  { id: 'eli5', label: 'Plain English' },
];

const list = (a) => (a.length <= 1 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a.at(-1)}`);

export function summarizeProject(p, mode) {
  const tech = list(p.tags.slice(0, 4));
  const metrics = p.metrics.map(([k, v]) => `${k.toLowerCase()}: ${v}`).join(' · ');
  switch (mode) {
    case 'engineer':
      return `Stack: ${tech}. Problem: ${p.challenge} Approach: ${p.solution} Key traits — ${metrics}.`;
    case 'eli5':
      return `Imagine a ${p.category.toLowerCase()} product that has to work reliably for lots of people at once. ${p.title.split(' – ')[0]} is the "engine room" behind it: ${p.description.split('.')[0].toLowerCase()}. Chanuka built the part users never see but always depend on.`;
    default:
      return `${p.title.split(' – ')[0]} (${p.year}) demonstrates delivery of a ${p.category.toLowerCase()} solution end to end using ${tech}. Business problem: ${p.challenge.replace(/\.$/, '')}. Outcome: ${p.solution.charAt(0).toLowerCase()}${p.solution.slice(1)}`;
  }
}
