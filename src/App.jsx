import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { AppProvider, useApp } from '@/lib/app';
import { ThemeProvider, useTheme } from '@/lib/theme';
import { parseVoiceCommand, VOICE_HELP } from '@/lib/voiceCommands';
import { scrollToId } from '@/lib/utils';
import { speak, useVoice } from '@/hooks/useVoice';
import { useLenis } from '@/hooks/useLenis';
import { profile } from '@/data/profile';
import ErrorBoundary from '@/components/ErrorBoundary';
import Navbar from '@/components/Navbar';
import ScrollProgress from '@/components/ui/ScrollProgress';
import SectionWatermark from '@/components/ui/SectionWatermark';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Footer from '@/components/sections/Footer';
import Preloader from './components/Preloader';
import CustomCursor from './components/ui/CustomCursor';

// Below-the-fold and optional widgets are split out of the critical bundle.
const Timeline = lazy(() => import('@/components/sections/Timeline'));
const Skills = lazy(() => import('@/components/sections/Skills'));
const Architecture = lazy(() => import('@/components/sections/Architecture'));
const Projects = lazy(() => import('@/components/sections/Projects'));
const GithubStats = lazy(() => import('@/components/sections/GithubStats'));
const Writing = lazy(() => import('@/components/sections/Writing'));
const Contact = lazy(() => import('@/components/sections/Contact'));
const Terminal = lazy(() => import('@/components/sections/Terminal'));
const ChatAssistant = lazy(() => import('@/components/ai/ChatAssistant'));
const CommandPalette = lazy(() => import('@/components/CommandPalette'));

const SectionFallback = () => <div className="mx-auto h-[60vh] max-w-6xl px-5" aria-hidden />;

function Shell() {
  useLenis();
  const { setTheme } = useTheme();
  const { setChatOpen, setPaletteOpen, toast } = useApp();
  const [heard, setHeard] = useState(false);

  const onVoice = useCallback((text) => {
    const cmd = parseVoiceCommand(text);
    if (!cmd) { toast(`Didn't catch a command in “${text}”. Say “help”.`, 'info'); return; }
    switch (cmd.type) {
      case 'scroll': scrollToId(cmd.id); toast(`Going to ${cmd.id}`); break;
      case 'theme': setTheme(cmd.value); toast(`${cmd.value} mode`); break;
      case 'chat': setChatOpen(true); break;
      case 'palette': setPaletteOpen(true); break;
      case 'cv': { const a = document.createElement('a'); a.href = profile.cv; a.download = ''; a.click(); break; }
      case 'help': toast(VOICE_HELP, 'info'); speak('Try saying: go to projects, dark mode, or open chat.'); break;
      default: break;
    }
  }, [setTheme, setChatOpen, setPaletteOpen, toast]);

  const voice = useVoice(onVoice);
  const toggleVoice = () => {
    if (voice.listening) { voice.stop(); return; }
    setHeard(true); voice.start();
    toast('Listening… try “go to projects”', 'info');
  };
  useEffect(() => { if (voice.error && heard) { toast(voice.error, 'error'); setHeard(false); } }, [voice.error, heard, toast]);

  return (
    <>
      <a href="#about" className="sr-only z-[200] rounded bg-accent px-4 py-2 text-[rgb(7_8_12)] focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
      {/* <Preloader /> */}
      <CustomCursor />
      <ScrollProgress />
      <SectionWatermark />
      <Navbar onVoice={voice.supported ? toggleVoice : undefined} voiceListening={voice.listening} />
      <main id="main">
        <Hero />
        <About />
        <Suspense fallback={<SectionFallback />}>
          <Timeline />
          <Skills />
          <Architecture />
          <Projects />
          <GithubStats />
          <Writing />
          <Contact />
          <Terminal />
        </Suspense>
      </main>
      <Footer />
      <ErrorBoundary>
        <Suspense fallback={null}>
          <ChatAssistant />
          <CommandPalette />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Shell />
        <Analytics />
      </AppProvider>
    </ThemeProvider>
  );
}
