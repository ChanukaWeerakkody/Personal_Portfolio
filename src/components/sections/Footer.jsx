import { Github, Linkedin, Mail } from 'lucide-react';
import { profile } from '@/data/profile';
import TimeDisplay from '@/components/ui/TimeDisplay';

export default function Footer() {
  return (
    <footer className="border-t border-line/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted md:flex-row">
        <p>© {new Date().getFullYear()} {profile.name}. Built with React, Tailwind &amp; Framer Motion.</p>
        <p className="font-mono text-xs">{profile.location.split(',')[0]} · <TimeDisplay timeZone={profile.timezone} /> (UTC+5:30)</p>
        <div className="flex gap-1">
          {[[Github, profile.githubUrl, 'GitHub'], [Linkedin, profile.linkedin, 'LinkedIn'], [Mail, `mailto:${profile.email}`, 'Email']].map(([Icon, href, label]) => (
            <a key={label} href={href} aria-label={label} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer noopener" className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-accent/10 hover:text-accent"><Icon size={16} /></a>
          ))}
        </div>
      </div>
    </footer>
  );
}
