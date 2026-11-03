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

// СВОИ организации — по ним тоже считается статистика (через запятую)
const ORG_NAMES = ['ArmagedonDev'];

// Заголовки БЕЗ токена: все данные публичные, а токен Actions ограничен одним репо.
// (без токена видны ВСЕ репозитории пользователя — иначе Python/другие репо теряются)
const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'profile-stats-generator',
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
  <text x="30" y="26" font-family="${MONO}" font-size="11" letter-spacing="2" fill="#8b949e">${esc(USER)} :: LIVE STATS</text>
  <text x="890" y="26" text-anchor="end" font-family="${MONO}" font-size="11" letter-spacing="2" fill="#8b949e">AUTO ${esc(date)}</text>
  ${dividers}
  ${cells}
</svg>`;
}

const PALETTE = ['#ff9e2c', '#ff7a18', '#e8590c', '#ffb347', '#ffd8a8', '#c77b2a', '#ff3d00', '#d9a066', '#ffd166', '#b45309'];

/* On an empty profile — a beautiful skeleton card: it fills automatically with the first code */
function buildEmptyLangsCard(meta, date) {
  const H = 530;
  const cx = 705, cy = 250, r = 96;

  let skeleton = '';
  for (let i = 0; i < 9; i++) {
    const y = 96 + i * 30;
    const nameW = 40 + ((i * 37) % 60);
    skeleton +=
      `<rect x="30" y="${y}" width="12" height="12" rx="2" fill="#21262d"/>` +
      `<rect x="50" y="${y + 2}" width="${nameW}" height="9" rx="4" fill="#21262d"/>` +
      `<rect x="180" y="${y}" width="250" height="15" rx="7.5" fill="#1a2029">` +
      `<animate attributeName="opacity" values="0.5;1;0.5" dur="${(1.8 + i * 0.22).toFixed(2)}s" begin="${(i * 0.12).toFixed(2)}s" repeatCount="indefinite"/>` +
      `</rect>` +
      `<text x="500" y="${y + 11}" text-anchor="end" font-family="${MONO}" font-size="13" fill="#3d444d">&#8212;&#8212;</text>`;
  }

  const ring =
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#21262d" stroke-width="32"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#ffb347" stroke-width="32" pathLength="100" stroke-dasharray="10 90" opacity="0.85">` +
    `<animateTransform attributeName="transform" type="rotate" values="0 ${cx} ${cy};360 ${cx} ${cy}" dur="2.4s" repeatCount="indefinite"/>` +
    `</circle>`;

  let legend = '';
  for (let i = 0; i < 8; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 566 + col * 178;
    const y = 392 + row * 22;
    legend +=
      `<rect x="${x}" y="${y + 1}" width="70" height="9" rx="4" fill="#21262d"/>` +
      `<rect x="${x + 92}" y="${y + 1}" width="34" height="9" rx="4" fill="#21262d"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="920" height="${H}" viewBox="0 0 920 ${H}" role="img" aria-label="top languages loading">
  <rect width="920" height="${H}" rx="14" fill="#0d1117" stroke="#ff7a18" stroke-opacity="0.35" stroke-width="1.5"/>
  <text x="30" y="32" font-family="${MONO}" font-size="11" letter-spacing="2" fill="#8b949e">${esc(USER)} :: TOP LANGUAGES</text>
  <text x="890" y="32" text-anchor="end" font-family="${MONO}" font-size="11" letter-spacing="2" fill="#8b949e">AWAITING DATA</text>

  <text x="30" y="74" font-family="${MONO}" font-size="13" letter-spacing="3" fill="#8b949e">SHARE OF CODE &#8212; LOADING&#8230;</text>
  ${skeleton}
  <line x1="525" y1="60" x2="525" y2="385" stroke="#21262d" stroke-width="1"/>

  <text x="${cx}" y="74" text-anchor="middle" font-family="${MONO}" font-size="13" letter-spacing="3" fill="#8b949e">BY VOLUME</text>
  ${ring}
  <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-family="${MONO}" font-size="11" letter-spacing="2" fill="#8b949e">TOTAL</text>
  <text x="${cx}" y="${cy + 18}" text-anchor="middle" font-family="${MONO}" font-size="21" font-weight="bold" fill="#6e7681">0 MB</text>
  <text x="${cx}" y="${cy + 38}" text-anchor="middle" font-family="${MONO}" font-size="9" letter-spacing="2" fill="#6e7681">AWAITING COMMITS</text>

  <text x="${cx}" y="360" text-anchor="middle" font-family="${MONO}" font-size="10" letter-spacing="1" fill="#ffb347">
    PUSH YOUR CODE &#8212; GRAPH FILLS ITSELF
    <animate attributeName="opacity" values="0.5;1;0.5" dur="2.2s" repeatCount="indefinite"/>
  </text>
  ${legend}

  <text x="30" y="${H - 18}" font-family="${MONO}" font-size="11" letter-spacing="2" fill="#6e7681">REPOS: ${meta.repos || 0} &#183; ORGS: ${meta.orgs || 0} &#183; LANGS: ${meta.distinct || 0} &#183; COMMITS: ${meta.commits != null ? fmt(meta.commits) : '0'}</text>
  <text x="890" y="${H - 18}" text-anchor="end" font-family="${MONO}" font-size="11" letter-spacing="2" fill="#6e7681">AUTO ${date}</text>
</svg>`;
}

function buildLangsCard(topLangs, meta = {}) {
  const date = new Date().toISOString().slice(0, 10);
  if (!topLangs.length) {
    return buildEmptyLangsCard(meta, date);
  }

  const total = topLangs.reduce((s, x) => s + x[1], 0);
  const H = 530;
  const maxBytes = topLangs[0][1];

  /* --- left: animated share bars --- */
  let bars = '';
  topLangs.forEach(([lang, bytes], i) => {
    const y = 96 + i * 30;
    const pct = (bytes / total) * 100;
    const w = Math.max(10, Math.round((bytes / maxBytes) * 250));
    const name = lang.length > 14 ? lang.slice(0, 13) + '\u2026' : lang;
    const color = PALETTE[i % PALETTE.length];
    bars +=
      `<rect x="30" y="${y}" width="12" height="12" rx="2" fill="${color}"/>` +
      `<text x="50" y="${y + 11}" font-family="${MONO}" font-size="14" fill="#e6edf3">${esc(name)}</text>` +
      `<rect x="180" y="${y}" width="250" height="15" rx="7.5" fill="#21262d"/>` +
      `<rect x="180" y="${y}" width="0" height="15" rx="7.5" fill="${color}">` +
      `<animate attributeName="width" from="0" to="${w}" dur="1s" begin="${(0.15 + i * 0.09).toFixed(2)}s" fill="freeze" calcMode="spline" keySplines="0.2 0.6 0.3 1" keyTimes="0;1"/>` +
      `</rect>` +
      `<text x="500" y="${y + 11}" text-anchor="end" font-family="${MONO}" font-size="13" fill="#8b949e">${pct.toFixed(1)}%</text>`;
  });

  /* --- right: animated donut --- */
  const cx = 705, cy = 250, r = 96;
  let cum = 0;
  let donut = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#21262d" stroke-width="32"/>`;
  topLangs.forEach(([lang, bytes], i) => {
    const pct = (bytes / total) * 100;
    const L = Math.max(pct, 0.5) * 0.97;
    const start = (cum * 3.6 - 90).toFixed(2);
    cum += pct;
    donut +=
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${PALETTE[i % PALETTE.length]}" stroke-width="32" pathLength="100" stroke-dasharray="0 100" transform="rotate(${start} ${cx} ${cy})">` +
      `<animate attributeName="stroke-dasharray" values="0 100;${L.toFixed(2)} ${(100 - L).toFixed(2)}" dur="${(0.8 + i * 0.1).toFixed(2)}s" begin="0.3s" fill="freeze"/>` +
      `</circle>`;
  });

  /* --- legend under donut --- */
  let legend = '';
  topLangs.forEach(([lang, bytes], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 566 + col * 178;
    const y = 392 + row * 22;
    const name = lang.length > 10 ? lang.slice(0, 9) + '\u2026' : lang;
    const pct = ((bytes / total) * 100).toFixed(1);
    legend +=
      `<rect x="${x}" y="${y}" width="10" height="10" rx="2" fill="${PALETTE[i % PALETTE.length]}"/>` +
      `<text x="${x + 16}" y="${y + 9}" font-family="${MONO}" font-size="11" fill="#c9d1d9">${esc(name)}</text>` +
      `<text x="${x + 92}" y="${y + 9}" font-family="${MONO}" font-size="11" fill="#8b949e">${pct}%</text>`;
  });

  const footer =
    `<text x="30" y="${H - 18}" font-family="${MONO}" font-size="11" letter-spacing="2" fill="#6e7681">REPOS: ${meta.repos || 0} &#183; ORGS: ${meta.orgs || 0} &#183; LANGS: ${meta.distinct || topLangs.length} &#183; COMMITS: ${meta.commits != null ? fmt(meta.commits) : '0'}</text>` +
    `<text x="890" y="${H - 18}" text-anchor="end" font-family="${MONO}" font-size="11" letter-spacing="2" fill="#6e7681">AUTO ${date}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="920" height="${H}" viewBox="0 0 920 ${H}" role="img" aria-label="top languages">
  <rect width="920" height="${H}" rx="14" fill="#0d1117" stroke="#ff7a18" stroke-opacity="0.35" stroke-width="1.5"/>
  <text x="30" y="32" font-family="${MONO}" font-size="11" letter-spacing="2" fill="#8b949e">${esc(USER)} :: TOP LANGUAGES</text>
  <text x="890" y="32" text-anchor="end" font-family="${MONO}" font-size="11" letter-spacing="2" fill="#8b949e">TOTAL ${fmtBytes(total)}</text>

  <text x="30" y="74" font-family="${MONO}" font-size="13" letter-spacing="3" fill="#ff9e2c">SHARE OF CODE</text>
  ${bars}
  <line x1="525" y1="60" x2="525" y2="385" stroke="#21262d" stroke-width="1"/>

  <text x="705" y="74" text-anchor="middle" font-family="${MONO}" font-size="13" letter-spacing="3" fill="#ff9e2c">BY VOLUME</text>
  ${donut}
  <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-family="${MONO}" font-size="11" letter-spacing="2" fill="#8b949e">TOTAL</text>
  <text x="${cx}" y="${cy + 18}" text-anchor="middle" font-family="${MONO}" font-size="21" font-weight="bold" fill="#ffd8a8">${fmtBytes(total)}</text>
  <text x="${cx}" y="${cy + 38}" text-anchor="middle" font-family="${MONO}" font-size="9" letter-spacing="2" fill="#6e7681">OF CODE</text>
  ${legend}
  ${footer}
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

  // репозитории организаций (публичные): ArmagedonDev + любое публичное членство
  const orgList = [...ORG_NAMES];
  try {
    const meOrgs = await jget(`${API}/users/${USER}/orgs`);
    for (const o of meOrgs) if (!orgList.includes(o.login)) orgList.push(o.login);
  } catch (e) {
    console.warn('orgs fetch failed:', e.message);
  }
  let orgRepos = [];
  for (const orgName of orgList) {
    try {
      for (let p = 1; p <= 5; p++) {
        const d = await jget(`${API}/orgs/${orgName}/repos?per_page=100&page=${p}&sort=updated`);
        orgRepos = orgRepos.concat(d);
        if (d.length < 100) break;
      }
    } catch (e) {
      console.warn(`org ${orgName} repos failed:`, e.message);
    }
  }
  orgRepos.forEach(r => { r.orgSource = 'ORG'; });
  repos.forEach(r => { r.orgSource = null; });
  repos = repos.concat(orgRepos);
  repos.sort((a, b) => b.stargazers_count - a.stargazers_count);

  const stars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const forks = repos.reduce((s, r) => s + r.forks_count, 0);

  let commits = 0;
  // считаем коммиты по каждом репо (надёжнее search: у-search валидируетorg-квоу и иногда 422)
  for (const r of repos) {
    try {
      let page = 1;
      while (page <= 10) {
        const d = await jget(`${API}/repos/${r.full_name}/commits?per_page=100&page=${page}`);
        commits += d.length;
        if (d.length < 100) break;
        page++;
      }
    } catch (e) {
      console.warn(`commits ${r.full_name} failed:`, e.message);
    }
  }

  const langs = {};
  for (const r of repos.slice(0, 40)) {
    try {
      const d = await jget(`${API}/repos/${r.full_name}/languages`);
      for (const [l, b] of Object.entries(d)) langs[l] = (langs[l] || 0) + b;
    } catch (e) {
      /* skip private/removed repos */
    }
  }
  const langEntries = Object.entries(langs).sort((a, b) => b[1] - a[1]);
  const langMeta = { repos: repos.length, distinct: langEntries.length, commits, orgs: orgList.length, orgNames: orgList.slice(0, 3).join('+') };
  const topLangs = langEntries.slice(0, 10);

  fs.mkdirSync(path.join(process.cwd(), 'out'), { recursive: true });
  fs.writeFileSync('out/stats.svg', buildStatsCard({ stars, repos: repos.length, forks, commits, followers }));
  fs.writeFileSync('out/langs.svg', buildLangsCard(topLangs, langMeta));
  console.log(`OK: stats.svg + langs.svg generated for ${USER}`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
