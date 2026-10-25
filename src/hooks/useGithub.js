import { useEffect, useState } from 'react';

const TTL = 30 * 60 * 1000; // cache 30 min to stay well under GitHub's unauthenticated rate limit

/** Live GitHub profile + repo + language stats with sessionStorage caching and graceful failure. */
export function useGithub(user) {
  const [state, setState] = useState({ status: 'loading', profile: null, repos: [], languages: [], stars: 0 });

  useEffect(() => {
    const key = `pf-gh-${user}`;
    try {
      const cached = JSON.parse(sessionStorage.getItem(key) || 'null');
      if (cached && Date.now() - cached.t < TTL) { setState({ status: 'ready', ...cached.d }); return; }
    } catch { /* ignore */ }

    const ctrl = new AbortController();
    (async () => {
      try {
        const [pRes, rRes] = await Promise.all([
          fetch(`https://api.github.com/users/${user}`, { signal: ctrl.signal }),
          fetch(`https://api.github.com/users/${user}/repos?per_page=100&sort=pushed`, { signal: ctrl.signal }),
        ]);
        if (!pRes.ok || !rRes.ok) throw new Error('GitHub API unavailable');
        const [profile, allRepos] = await Promise.all([pRes.json(), rRes.json()]);
        const repos = allRepos.filter((r) => !r.fork);
        const langCount = {};
        repos.forEach((r) => r.language && (langCount[r.language] = (langCount[r.language] || 0) + 1));
        const total = Object.values(langCount).reduce((a, b) => a + b, 0) || 1;
        const languages = Object.entries(langCount).sort((a, b) => b[1] - a[1]).slice(0, 5)
          .map(([name, n]) => ({ name, pct: Math.round((n / total) * 100) }));
        const stars = repos.reduce((n, r) => n + r.stargazers_count, 0);
        const d = {
          profile: { followers: profile.followers, repos: profile.public_repos, since: new Date(profile.created_at).getFullYear() },
          repos: repos.slice(0, 4).map((r) => ({ name: r.name, url: r.html_url, desc: r.description, stars: r.stargazers_count, lang: r.language, pushed: r.pushed_at })),
          languages, stars,
        };
        try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), d })); } catch { /* ignore */ }
        setState({ status: 'ready', ...d });
      } catch (e) {
        if (e.name !== 'AbortError') setState((s) => ({ ...s, status: 'error' }));
      }
    })();
    return () => ctrl.abort();
  }, [user]);

  return state;
}

/** Contribution calendar (third-party mirror of GitHub's graph; optional — UI degrades without it). */
export function useContributions(user) {
  const [state, setState] = useState({ status: 'loading', weeks: [], total: 0 });
  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`https://github-contributions-api.jogruber.de/v4/${user}?y=last`, { signal: ctrl.signal })
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => {
        const days = data.contributions || [];
        const weeks = [];
        for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
        const total = Object.values(data.total || {}).reduce((a, b) => a + b, 0);
        setState({ status: 'ready', weeks, total });
      })
      .catch((e) => e.name !== 'AbortError' && setState({ status: 'error', weeks: [], total: 0 }));
    return () => ctrl.abort();
  }, [user]);
  return state;
}
