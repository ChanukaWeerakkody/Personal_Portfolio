import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowUpRight, CheckCircle2, Loader2, Mail, MapPin, Phone, Send } from 'lucide-react';
import { profile } from '@/data/profile';
import { RULES, validateAll } from '@/lib/validate';
import { useApp } from '@/lib/app';
import SectionHeading from '@/components/ui/SectionHeading';
import SpotlightCard from '@/components/ui/SpotlightCard';
import Reveal from '@/components/ui/Reveal';

const EMPTY = { name: '', email: '', message: '' };
const COOLDOWN_MS = 30_000;

function Field({ id, label, error, touched, valid, children, hint }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium">{label}</label>
        {hint}
      </div>
      {children}
      <div className="mt-1.5 min-h-[1.25rem]" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {touched && error ? (
            <motion.p key="e" id={`${id}-err`} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-xs text-red-400"><AlertCircle size={12} />{error}</motion.p>
          ) : touched && valid ? (
            <motion.p key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-xs text-emerald-400"><CheckCircle2 size={12} />Looks good</motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Contact() {
  const { toast } = useApp();
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent
  const lastSent = useRef(0);
  const honeypot = useRef('');

  const errors = validateAll(values);
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));
  const props = (k) => ({
    id: k, value: values[k], onChange: set(k), onBlur: blur(k),
    'aria-invalid': touched[k] && !!errors[k], 'aria-describedby': touched[k] && errors[k] ? `${k}-err` : undefined,
    className: 'input',
  });

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });
    if (Object.values(errors).some(Boolean)) { toast('Please fix the highlighted fields.', 'error'); return; }
    if (honeypot.current) { setStatus('sent'); return; } // bots fill hidden fields; pretend success
    if (Date.now() - lastSent.current < COOLDOWN_MS) { toast('Message already sent — please wait a moment.', 'info'); return; }

    const { VITE_EMAILJS_SERVICE_ID: svc, VITE_EMAILJS_TEMPLATE_ID: tpl, VITE_EMAILJS_PUBLIC_KEY: key } = import.meta.env;
    if (!svc || !tpl || !key) {
      // Email service not configured: hand off to the visitor's mail client rather than silently failing.
      const body = encodeURIComponent(`${values.message}\n\n— ${values.name} (${values.email})`);
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(`Portfolio enquiry from ${values.name}`)}&body=${body}`;
      toast('Opening your mail app…', 'info');
      return;
    }

    setStatus('sending');
    try {
      const { default: emailjs } = await import('@emailjs/browser');
      await emailjs.send(svc, tpl, { from_name: values.name.trim(), from_email: values.email.trim(), message: values.message.trim(), to_name: profile.name.split(' ')[0] }, { publicKey: key });
      lastSent.current = Date.now();
      setStatus('sent'); setValues(EMPTY); setTouched({});
      toast("Message sent — I'll reply within a day.");
      setTimeout(() => setStatus('idle'), 5000);
    } catch {
      setStatus('idle');
      toast('Could not send. Please email me directly.', 'error');
    }
  };

  return (
    <section id="contact" className="section">
      <SectionHeading eyebrow="08 — Contact" title="Let's build something dependable." />
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <SpotlightCard className="flex h-full flex-col justify-between gap-8 p-6 md:p-8">
            <div>
              <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> {profile.available ? 'Available for work' : 'Fully booked'}</p>
              <h3 className="mt-4 text-2xl font-semibold">Have a backend problem to solve?</h3>
              <p className="mt-3 text-sm text-muted">Scalable APIs, microservices, integrations. I usually reply within 24 hours.</p>
            </div>
            <ul className="space-y-2 text-sm">
              {[[Mail, profile.email, `mailto:${profile.email}`], [Phone, profile.phone, `tel:${profile.phone.replace(/\s/g, '')}`], [MapPin, profile.location, null]].map(([Icon, text, href]) => (
                <li key={text}>{href ? (
                  <a href={href} className="group flex items-center gap-3 rounded-xl border border-line/10 px-4 py-3 transition-colors hover:border-accent/50"><Icon size={16} className="text-accent" /><span className="truncate">{text}</span><ArrowUpRight size={14} className="ml-auto opacity-40 transition-opacity group-hover:opacity-100" /></a>
                ) : (<div className="flex items-center gap-3 rounded-xl border border-line/10 px-4 py-3"><Icon size={16} className="text-accent" />{text}</div>)}</li>
              ))}
            </ul>
          </SpotlightCard>
        </Reveal>

        <Reveal delay={0.1}>
          <form onSubmit={submit} noValidate className="glass rounded-2xl p-6 md:p-8" aria-label="Contact form">
            <div className="grid gap-x-5 sm:grid-cols-2">
              <Field id="name" label="Name" error={errors.name} touched={touched.name} valid={!errors.name}>
                <input {...props('name')} type="text" autoComplete="name" placeholder="Jane Doe" />
              </Field>
              <Field id="email" label="Email" error={errors.email} touched={touched.email} valid={!errors.email}>
                <input {...props('email')} type="email" autoComplete="email" inputMode="email" placeholder="jane@company.com" />
              </Field>
            </div>
            <Field id="message" label="Message" error={errors.message} touched={touched.message} valid={!errors.message}
              hint={<span className={`font-mono text-[11px] ${values.message.length > 1500 ? 'text-red-400' : 'text-muted'}`}>{values.message.length}/1500</span>}>
              <textarea {...props('message')} rows={5} placeholder="Tell me about the project…" className="input resize-none" />
            </Field>
            <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" onChange={(e) => { honeypot.current = e.target.value; }} />
            <button type="submit" disabled={status === 'sending'} className="btn btn-primary mt-2 w-full disabled:opacity-60">
              {status === 'sending' ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : status === 'sent' ? <><CheckCircle2 size={16} /> Sent!</> : <><Send size={16} /> Send message</>}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
