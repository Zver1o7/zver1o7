/**
 * gen-stats.js — генератор анимированных SVG-карточек статистики.
 * Запускается GitHub Actions'ом (см. .github/workflows/stats.yml).
 * ENV: USER_NAME (ник), GITHUB_TOKEN (токен из Actions).
 * Выход: out/stats.svg, out/langs.svg (ветка stats-output).
 */
const fs = require('fs');
const path = require('path');

const USER = process.env.USER_NAME || 'Zver1o7';
const TOKEN = process.env.GITHUB_TOKEN || '';
const API = 'https://api.github.com';

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'profile-stats-generator',
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

async function jget(url) {
  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  return r.json();
}

function fmt(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}

function fmtBytes(b) {
  if (b >= 1048576) return (b / 1048576).toFixed(1) + ' MB';
  if (b >= 1024) return Math.round(b / 1024) + ' KB';
  return b + ' B';
}

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const MONO = "Consolas, 'Courier New', monospace";

/* ---------- icons ---------- */
const icons = {
  star: '<path d="M14 1.5l4.2 8.6 9.4 1.4-6.8 6.6 1.6 9.4L14 22.9l-8.4 4.6 1.6-9.4L.4 11.5l9.4-1.4z" fill="#ff9e2c"/>',
  repo:
    '<rect x="2" y="2" width="24" height="24" rx="4" fill="none" stroke="#ff9e2c" stroke-width="2"/>' +
    '<path d="M2 9.5h24" stroke="#ff9e2c" stroke-width="2"/>' +
    '<path d="M7 15h9" stroke="#ff9e2c" stroke-width="2" stroke-linecap="round"/>',
  fork:
    '<circle cx="7" cy="6" r="3.5" fill="none" stroke="#ff9e2c" stroke-width="2"/>' +
    '<circle cx="21" cy="6" r="3.5" fill="none" stroke="#ff9e2c" stroke-width="2"/>' +
    '<circle cx="14" cy="22" r="3.5" fill="none" stroke="#ff9e2c" stroke-width="2"/>' +
    '<path d="M7 9.5v2.5a4 4 0 004 4h6a4 4 0 004-4V9.5M14 16v2.5" fill="none" stroke="#ff9e2c" stroke-width="2"/>',
  commit:
    '<circle cx="14" cy="14" r="6" fill="none" stroke="#ff9e2c" stroke-width="2"/>' +
    '<line x1="0" y1="14" x2="7" y2="14" stroke="#ff9e2c" stroke-width="2"/>' +
    '<line x1="21" y1="14" x2="28" y2="14" stroke="#ff9e2c" stroke-width="2"/>',
  person:
    '<circle cx="14" cy="9" r="5.5" fill="none" stroke="#ff9e2c" stroke-width="2"/>' +
    '<path d="M4 27a10 10 0 0120 0" fill="none" stroke="#ff9e2c" stroke-width="2"/>',
};

function statCell(cx, icon, value, label, i) {
  return (
    `<g transform="translate(${cx - 14},36)">${icons[icon]}` +
    `<animate attributeName="opacity" values="0.55;1;0.55" dur="3s" begin="${(i * 0.45).toFixed(2)}s" repeatCount="indefinite"/></g>` +
    `<text x="${cx}" y="108" text-anchor="middle" font-family="${MONO}" font-size="30" font-weight="bold" fill="#ffd8a8">${esc(value)}</text>` +
    `<text x="${cx}" y="130" text-anchor="middle" font-family="${MONO}" font-size="11" letter-spacing="3" fill="#8b949e">${esc(label)}</text>`
  );
}

function buildStatsCard({ stars, repos, forks, commits, followers }) {
  const date = new Date().toISOString().slice(0, 10);
  const cells = [
    statCell(92, 'star', fmt(stars), 'STARS', 0),
    statCell(276, 'repo', fmt(repos), 'REPOS', 1),
    statCell(460, 'fork', fmt(forks), 'FORKS', 2),
    statCell(644, 'commit', fmt(commits), 'COMMITS', 3),
    statCell(828, 'person', fmt(followers), 'FOLLOWERS', 4),
  ].join('');
  const dividers = [1, 2, 3, 4]
    .map((i) => `<line x1="${184 * i}" y1="54" x2="${184 * i}" y2="118" stroke="#21262d" stroke-width="1"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="920" height="150" viewBox="0 0 920 150" role="img" aria-label="GitHub stats">
  <rect width="920" height="150" rx="14" fill="#0d1117" stroke="#ff7a18" stroke-opacity="0.35" stroke-width="1.5"/>
  <rect x="4" y="4" width="912" height="142" rx="11" fill="none" stroke="#ff7a18" stroke-width="1" stroke-dasharray="14 10" stroke-opacity="0.4">
    <animate attributeName="stroke-dashoffset" values="0;-48" dur="2.8s" repeatCount="indefinite"/>
  </rect>
  <text x="30" y="26" font-family="${MONO}" font-size="11" letter-spacing="2" fill="#8b949e">ZVER1O7 :: LIVE STATS</text>
  <text x="890" y="26" text-anchor="end" font-family="${MONO}" font-size="11" letter-spacing="2" fill="#8b949e">AUTO ${esc(date)}</text>
  ${dividers}
  ${cells}
</svg>`;
}

const PALETTE = ['#ff9e2c', '#ff7a18', '#e8590c', '#ffb347', '#ffd8a8', '#c77b2a', '#ff3d00', '#d9a066'];

function buildLangsCard(topLangs) {
  if (!topLangs.length) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="920" height="120" viewBox="0 0 920 120" role="img" aria-label="languages">
  <rect width="920" height="120" rx="14" fill="#0d1117" stroke="#ff7a18" stroke-opacity="0.35" stroke-width="1.5"/>
  <text x="460" y="60" text-anchor="middle" font-family="${MONO}" font-size="16" letter-spacing="3" fill="#ffb347">NO LANGUAGE DATA YET &#8212; COMMITS INCOMING &#8230;</text>
</svg>`;
  }
  const total = topLangs.reduce((s, x) => s + x[1], 0);
  const rows = topLangs.length;
  const H = 56 + rows * 42 + 14;
  const date = new Date().toISOString().slice(0, 10);
  let body = '';
  topLangs.forEach(([lang, bytes], i) => {
    const cy = 56 + i * 42 + 21;
    const pct = (bytes / total) * 100;
    const w = Math.max(10, Math.round((bytes / topLangs[0][1]) * 520));
    const name = lang.length > 16 ? lang.slice(0, 15) + '\u2026' : lang;
    const color = PALETTE[i % PALETTE.length];
    body +=
      `<text x="36" y="${cy + 5}" font-family="${MONO}" font-size="16" fill="#e6edf3">${esc(name)}</text>` +
      `<rect x="210" y="${cy - 8}" width="520" height="16" rx="8" fill="#21262d"/>` +
      `<rect x="210" y="${cy - 8}" width="0" height="16" rx="8" fill="${color}">` +
      `<animate attributeName="width" from="0" to="${w}" dur="1s" begin="${(0.15 + i * 0.12).toFixed(2)}s" fill="freeze" calcMode="spline" keySplines="0.2 0.6 0.3 1" keyTimes="0;1"/>` +
      `</rect>` +
      `<text x="756" y="${cy + 5}" font-family="${MONO}" font-size="14" fill="#8b949e">${pct.toFixed(1)}%</text>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="920" height="${H}" viewBox="0 0 920 ${H}" role="img" aria-label="top languages">
  <rect width="920" height="${H}" rx="14" fill="#0d1117" stroke="#ff7a18" stroke-opacity="0.35" stroke-width="1.5"/>
  <text x="30" y="32" font-family="${MONO}" font-size="11" letter-spacing="2" fill="#8b949e">ZVER1O7 :: TOP LANGUAGES</text>
  <text x="890" y="32" text-anchor="end" font-family="${MONO}" font-size="11" letter-spacing="2" fill="#8b949e">TOTAL ${fmtBytes(total)}</text>
  ${body}
</svg>`;
}

/* ---------- main ---------- */
(async () => {
  let followers = 0;
  try {
    const u = await jget(`${API}/users/${USER}`);
    followers = u.followers;
  } catch (e) {
    console.warn('user fetch failed:', e.message);
  }

  let repos = [];
  try {
    for (let p = 1; p <= 5; p++) {
      const d = await jget(`${API}/users/${USER}/repos?per_page=100&page=${p}&sort=updated`);
      repos = repos.concat(d);
      if (d.length < 100) break;
    }
  } catch (e) {
    console.warn('repos fetch failed:', e.message);
  }
  repos.sort((a, b) => b.stargazers_count - a.stargazers_count);

  const stars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const forks = repos.reduce((s, r) => s + r.forks_count, 0);

  let commits = 0;
  try {
    const d = await jget(`${API}/search/commits?q=author:${USER}&per_page=1`);
    commits = d.total_count;
  } catch (e) {
    console.warn('commits search failed:', e.message);
  }

  const langs = {};
  for (const r of repos.slice(0, 30)) {
    try {
      const d = await jget(`${API}/repos/${r.full_name}/languages`);
      for (const [l, b] of Object.entries(d)) langs[l] = (langs[l] || 0) + b;
    } catch (e) {
      /* skip private/removed repos */
    }
  }
  const topLangs = Object.entries(langs).sort((a, b) => b[1] - a[1]).slice(0, 8);

  fs.mkdirSync(path.join(process.cwd(), 'out'), { recursive: true });
  fs.writeFileSync('out/stats.svg', buildStatsCard({ stars, repos: repos.length, forks, commits, followers }));
  fs.writeFileSync('out/langs.svg', buildLangsCard(topLangs));
  console.log(`OK: stats.svg + langs.svg generated for ${USER}`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
