import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Bot, Mic, Send, Sparkles, User, Volume2, VolumeX, X } from 'lucide-react';
import { ask, SUGGESTIONS } from '@/lib/assistant';
import { speak, useVoice } from '@/hooks/useVoice';
import { useApp } from '@/lib/app';
import { cn, scrollToId } from '@/lib/utils';

const GREETING = { role: 'bot', text: "Hi! I'm Chanuka's AI assistant. Ask me about his skills, projects, experience or availability — or tap the mic and speak." };
const SECTION_LABEL = { about: 'About', experience: 'Journey', skills: 'Skills', projects: 'Projects', github: 'GitHub', writing: 'Blogs', contact: 'Contact' };

export default function ChatAssistant() {
  const { chatOpen: open, setChatOpen: setOpen } = useApp();
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const mounted = useRef(true);
  
  // Stale state tracking
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' }); }, [messages, busy]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 150); }, [open]);
  
  useEffect(() => {
    const onChatEvent = (e) => {
      if (typeof e.detail === 'boolean') setOpen(e.detail);
      else setOpen((prev) => !prev);
    };
    window.addEventListener('site:chat', onChatEvent);
    return () => window.removeEventListener('site:chat', onChatEvent);
  }, [setOpen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  const send = useCallback(async (text) => {
    const q = text.trim().slice(0, 500);
    if (!q || busy) return;

    setInput('');
    const userMessage = { role: 'user', text: q };
    const currentHistory = messagesRef.current;

    setMessages((m) => [...m, userMessage]);
    setBusy(true);

    try {
      const [res] = await Promise.all([
        ask(q, currentHistory),
        new Promise((r) => setTimeout(r, 350))
      ]);

      if (!mounted.current) return;

      const botText = res?.text || "Sorry, I couldn't process that response.";
      setMessages((m) => [
        ...m, 
        { role: 'bot', text: botText, section: res?.section, source: res?.source }
      ]);

      if (speakReplies && res?.text) {
        speak(res.text.replace(/[•·]/g, ''));
      }
    } catch (err) {
      if (!mounted.current) return;
      setMessages((m) => [
        ...m,
        { role: 'bot', text: "Something went wrong. Please try asking again." }
      ]);
    } finally {
      setBusy(false);
    }
  }, [busy, speakReplies]);

  const voice = useVoice((t) => send(t));

  return (
    <>
      <motion.button
        onClick={() => setOpen(!open)} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'} aria-expanded={open}
        className="glass fixed bottom-5 right-5 z-[60] grid h-14 w-14 place-items-center rounded-full text-accent shadow-xl shadow-accent/20 hover:shadow-accent/40"
      >
        {open ? <X size={22} /> : <Sparkles size={22} />}
        {!open && <span className="absolute right-1 top-1 h-3 w-3 rounded-full border-2 border-background bg-emerald-400" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.section
            role="dialog" aria-label="AI assistant"
            initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }} style={{ transformOrigin: 'bottom right' }}
            className="glass fixed bottom-24 right-3 z-[60] flex h-[min(560px,calc(100svh-8rem))] w-[calc(100vw-1.5rem)] max-w-[400px] flex-col overflow-hidden rounded-3xl bg-background/85 shadow-2xl sm:right-5"
          >
            <header className="flex items-center justify-between border-b border-line/10 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-accent/15 text-accent"><Bot size={16} /></span>
                <div><p className="text-sm font-semibold leading-none">Ask Chanuka's AI</p><p className="mt-1 text-[11px] text-muted">Answers grounded in this portfolio</p></div>
              </div>
              <button onClick={() => { setSpeakReplies((s) => !s); window.speechSynthesis?.cancel(); }} aria-pressed={speakReplies} aria-label="Read replies aloud"
                className={cn('grid h-8 w-8 place-items-center rounded-full hover:bg-accent/10', speakReplies && 'text-accent')}>
                {speakReplies ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>
            </header>

            <div role="log" aria-live="polite" className="scroll-thin flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn('flex gap-2', m.role === 'user' && 'flex-row-reverse')}>
                  <span className={cn('mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full', m.role === 'user' ? 'bg-line/10' : 'bg-accent/15 text-accent')}>
                    {m.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                  </span>
                  <div className={cn('max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed', m.role === 'user' ? 'rounded-tr-sm bg-accent text-[rgb(7_8_12)]' : 'rounded-tl-sm border border-line/10 bg-card/5')}>
                    {m.text}
                    {m.section && SECTION_LABEL[m.section] && (
                      <button onClick={() => { scrollToId(m.section); if (window.innerWidth < 640) setOpen(false); }}
                        className="mt-2 flex items-center gap-1 text-xs font-medium text-accent hover:underline">Show me the {SECTION_LABEL[m.section]} section <ArrowRight size={12} /></button>
                    )}
                  </div>
                </motion.div>
              ))}
              {busy && (
                <div className="flex gap-2" aria-label="Assistant is typing">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-accent/15 text-accent"><Bot size={12} /></span>
                  <div className="flex items-center gap-1 rounded-2xl border border-line/10 px-4 py-3">{[0, 1, 2].map((d) => <motion.span key={d} className="h-1.5 w-1.5 rounded-full bg-accent" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.1, delay: d * 0.15 }} />)}</div>
                </div>
              )}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-1.5 pt-1">{SUGGESTIONS.map((s) => <button key={s} onClick={() => send(s)} className="chip transition-colors hover:border-accent hover:text-accent">{s}</button>)}</div>
              )}
              <div ref={endRef} />
            </div>

            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 border-t border-line/10 p-3">
              <label htmlFor="chat-input" className="sr-only">Message</label>
              <input id="chat-input" ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} maxLength={500} placeholder={voice.listening ? 'Listening…' : 'Ask about skills, projects…'} autoComplete="off" className="input !rounded-full !py-2.5 !text-base sm:!text-sm" />
              {voice.supported && (
                <button type="button" onClick={voice.listening ? voice.stop : voice.start} aria-label={voice.listening ? 'Stop listening' : 'Speak your question'} aria-pressed={voice.listening}
                  className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line/10 transition-colors hover:border-accent', voice.listening && 'border-accent bg-accent/15 text-accent')}>
                  <Mic size={16} className={voice.listening ? 'animate-pulse' : ''} />
                </button>
              )}
              <button type="submit" disabled={!input.trim() || busy} aria-label="Send" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-[rgb(7_8_12)] transition-opacity disabled:opacity-40"><Send size={15} /></button>
            </form>
            {voice.error && <p className="px-4 pb-2 text-xs text-red-400" role="alert">{voice.error}</p>}
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}