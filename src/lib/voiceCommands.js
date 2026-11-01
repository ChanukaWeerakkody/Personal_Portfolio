import { navItems } from '@/data/profile';

const ALIASES = {
  home: ['home', 'top', 'start', 'hero'],
  about: ['about', 'bio', 'who'],
  experience: ['experience', 'journey', 'timeline', 'career', 'work history', 'education'],
  skills: ['skills', 'skill', 'matcher', 'stack', 'tech'],
  architecture: ['architecture', 'system design', 'engineering', 'systems', 'blueprints'],
  projects: ['projects', 'project', 'portfolio', 'work'],
  github: ['github', 'git hub', 'stats', 'activity'],
  writing: ['writing', 'blog', 'articles', 'posts', 'medium'],
  contact: ['contact', 'hire', 'email', 'reach'],
};

/** Map a spoken phrase to an action descriptor, or null when nothing matches. */
export function parseVoiceCommand(raw) {
  const t = raw.toLowerCase().trim();
  if (/\b(dark)\b.*\b(mode|theme)\b|\bgo dark\b/.test(t)) return { type: 'theme', value: 'dark' };
  if (/\b(light)\b.*\b(mode|theme)\b|\bgo light\b/.test(t)) return { type: 'theme', value: 'light' };
  if (/\b(open|start|show)\b.*\b(chat|assistant)\b/.test(t)) return { type: 'chat' };
  if (/\b(command palette|search|open menu)\b/.test(t)) return { type: 'palette' };
  if (/\b(download|get)\b.*\b(cv|resume)\b/.test(t)) return { type: 'cv' };
  if (/\bhelp\b|what can i say/.test(t)) return { type: 'help' };
  if (/\b(go|scroll|take me|navigate|open|show)\b/.test(t) || navItems.some((n) => t.includes(n.id))) {
    for (const [id, words] of Object.entries(ALIASES)) {
      if (words.some((w) => new RegExp(`\\b${w}\\b`).test(t))) return { type: 'scroll', id };
    }
  }
  return null;
}

export const VOICE_HELP = '“Go to projects” · “Show skills” · “Dark mode” · “Open chat” · “Download CV”';
