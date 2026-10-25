# Chanuka Weerakkody — Portfolio v2

React 18 · Vite 6 · Tailwind 3 · Framer Motion · React Three Fiber · Lenis

```bash
npm install
cp .env.example .env     # optional: EmailJS keys, LLM endpoint
npm run dev              # http://localhost:5173
npm run build && npm run preview
```
Put your CV at `public/Chanuka_Weerakkody_CV.pdf`.

## What's inside
| Area | Details |
|---|---|
| **AI assistant** | `src/lib/assistant.js` — BM25 retrieval over a corpus generated from `src/data/profile.js`, so answers can never drift from the site. Works offline. Set `VITE_CHAT_ENDPOINT=/api/chat` + `ANTHROPIC_API_KEY` (Vercel) to upgrade to an LLM that is *grounded* on the retrieved context; falls back to local on any failure. |
| **Skill matcher** | Paste a job description → weighted fit score, matched skills, honest gaps, relevant projects. 100% client-side (`src/lib/skillMatcher.js`). |
| **Auto project summaries** | Recruiter / Engineer / Plain-English modes generated from structured project data. |
| **Voice navigation** | Mic button in navbar + chat. "Go to projects", "dark mode", "open chat", "download CV". Web Speech API (Chromium/Safari); hidden where unsupported. |
| **Timeline** | Filterable work/education timeline with scroll-linked progress line. |
| **GitHub + Bitbucket stats** | Live GitHub REST profile/repository metrics + contribution graph, optional GitHub Readme Stats card, and a clearly labelled mocked Bitbucket activity panel for restricted/private workspaces. |
| **Projects** | Category + tech filters, search, animated layout, accessible modal. |
| **Contact** | Instant per-field validation, honeypot, 30 s cooldown, EmailJS with mailto fallback. |
| **Extras** | ⌘/Ctrl+K command palette, visible Emerald/Indigo/Violet/Rose/Amber-style accent switching, interactive terminal, 3D hero (desktop only, lazy). |

## Editing content
Everything lives in `src/data/profile.js`.

## Performance notes
- Initial JS ≈ 110 kB gzip (React + Motion + app shell). Every below-the-fold section, the chat, palette, and the 3D scene are lazy chunks.
- WebGL loads only on ≥1024px, non-reduced-motion, after `requestIdleCallback`.
- Profile photo: 643 kB PNG → 20 kB / 49 kB responsive WebP.
- No third-party hot-linked images; fonts use `display=swap` with preconnect.
- Lenis smooth-scroll is skipped for `prefers-reduced-motion`.


## Public project / NDA policy
The public Projects section intentionally contains personal/open-source work only. Client and company-specific production systems from the CV are not exposed as portfolio projects. Where an exact public repository slug could not be independently verified, the project card links to a GitHub repository search for the project name instead of inventing a repository URL.

## Accent colours
Accent selection is persisted in `localStorage` and applied through the `--accent` CSS variable, so Tailwind utility classes such as `bg-accent`, `text-accent`, focus rings and hover states update consistently.

## Scroll spy
Navbar state is driven by `IntersectionObserver` with a scroll-position fallback. This avoids active-tab flicker when adjacent sections overlap the observer band and keeps keyboard/mobile navigation in sync.
