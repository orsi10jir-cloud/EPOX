'use strict';

/* =========================================================
   EPOX web – script.js
   1) zachytávání chyb   2) terminál   3) karty
   4) tlačítko "Co jsme dělali"
   5) tlačítko "Kontrola kódu"
   6) tlačítko "Kontrola v Markdownu"
   ========================================================= */

/* ---------- 1) Zachytávání chyb (pro kontrolu kódu) ---------- */
const chyby = [];
window.addEventListener('error', (e) => chyby.push(e.message || 'Neznámá chyba'));

const $ = (sel) => document.querySelector(sel);

// Pomocník: vytvoří HTML prvek -> el('p', {class: 'x'}, 'text')
function el(tag, attrs = {}, ...deti) {
  const prvek = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') prvek.className = v;
    else if (k.startsWith('on')) prvek.addEventListener(k.slice(2), v);
    else prvek.setAttribute(k, v);
  }
  for (const d of deti) prvek.append(d);
  return prvek;
}

const nahodny = (pole) => pole[Math.floor(Math.random() * pole.length)];

/* ---------- Data ---------- */
const FAKTY = [
  'Chobotnice má tři srdce a modrou krev.',
  'První počítačový „bug“ byla skutečná můra zaseknutá v relé počítače Harvard Mark II (1947).',
  'Blesk je zhruba 5× teplejší než povrch Slunce.',
  'Banány jsou nepatrně radioaktivní kvůli draslíku-40.',
  'Světlo ze Slunce letí k Zemi asi 8 minut a 20 sekund.',
  'Git vytvořil Linus Torvalds v roce 2005.',
  'JavaScript byl v roce 1995 navržen zhruba za 10 dní.',
  'Lidský mozek má přibližně 86 miliard neuronů.',
  'Markdown vymyslel John Gruber v roce 2004.',
];

const VTIPY = [
  'Existuje 10 typů lidí: ti, co rozumí dvojkové soustavě, a ti, co ne.',
  'Kolik programátorů je potřeba na výměnu žárovky? Žádný, to je hardwarový problém.',
  'Proč programátoři nechodí do přírody? Je tam moc bugů.',
  '„U mě to funguje.“ – Každý programátor, vždycky.',
];

const KOSTKA = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
const BARVY = ['#39ff8f', '#4ad8ff', '#ff4ad8', '#ffc94a', '#ff7a3d', '#b38cff'];

/* ---------- 2) Terminál ---------- */
const out = $('#term-output');
const input = $('#term-input');
const historiePrikazu = [];
let hIndex = 0;
let barvaIndex = 0;

function tisk(text = '', trida) {
  const radek = el('div', trida ? { class: trida } : {}, text);
  out.append(radek);
  out.scrollTop = out.scrollHeight;
}

const PRIKAZY = {
  help:     { popis: 'seznam příkazů', run: () => {
              tisk('Dostupné příkazy:');
              for (const [jmeno, p] of Object.entries(PRIKAZY)) tisk(`  ${jmeno.padEnd(10)}${p.popis}`);
            } },
  cls:      { popis: 'vyčistí obrazovku', run: () => { out.textContent = ''; } },
  cas:      { popis: 'aktuální čas', run: () => tisk(new Date().toLocaleTimeString('cs-CZ')) },
  datum:    { popis: 'dnešní datum', run: () => tisk(new Date().toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })) },
  echo:     { popis: 'vypíše text (echo ahoj)', run: (args) => tisk(args.join(' ')) },
  vtip:     { popis: 'programátorský vtip', run: () => tisk(nahodny(VTIPY)) },
  fakt:     { popis: 'náhodný fakt', run: () => tisk(nahodny(FAKTY)) },
  kostka:   { popis: 'hodí kostkou', run: () => tisk(`Padlo: ${Math.floor(Math.random() * 6) + 1}`) },
  color:    { popis: 'změní barvu webu', run: () => {
              barvaIndex = (barvaIndex + 1) % BARVY.length;
              document.documentElement.style.setProperty('--accent', BARVY[barvaIndex]);
              tisk(`Barva nastavena na ${BARVY[barvaIndex]}`);
            } },
  matrix:   { popis: 'matrix efekt (zastavíš klikem/klávesou)', run: () => matrix() },
  ver:      { popis: 'verze', run: () => tisk('EPOX web [verze 1.0.0]') },
  whoami:   { popis: 'kdo jsi', run: () => tisk('host@epox-web') },
  kontrola: { popis: 'spustí kontrolu kódu', run: () => { tisk('Spouštím kontrolu…'); ukazKontrolu(); } },
  md:       { popis: 'kontrola v Markdownu', run: () => { tisk('Generuji Markdown…'); ukazMarkdown(); } },
  historie: { popis: 'co jsme dělali', run: () => ukazHistorii() },
};

function spustPrikaz(radek) {
  tisk(`C:\\EPOX>${radek}`, 'cmd');
  const [jmeno, ...args] = radek.trim().split(/\s+/);
  if (!jmeno) return;
  const prikaz = PRIKAZY[jmeno.toLowerCase()];
  if (prikaz) prikaz.run(args);
  else tisk(`'${jmeno}' není rozpoznán jako příkaz. Napiš help.`, 'err');
}

$('#term-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const radek = input.value;
  if (radek.trim()) historiePrikazu.push(radek);
  hIndex = historiePrikazu.length;
  input.value = '';
  spustPrikaz(radek);
});

// Šipky nahoru/dolů = předchozí příkazy (jako v cmd)
input.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp' && hIndex > 0) {
    hIndex--; input.value = historiePrikazu[hIndex]; e.preventDefault();
  } else if (e.key === 'ArrowDown') {
    hIndex = Math.min(hIndex + 1, historiePrikazu.length);
    input.value = historiePrikazu[hIndex] || ''; e.preventDefault();
  }
});

// Klik kamkoliv do terminálu = psaní
$('.terminal').addEventListener('click', () => input.focus());

function matrix() {
  const c = $('#matrix');
  c.hidden = false;
  const ctx = c.getContext('2d');
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  const vel = 16;
  const y = Array(Math.floor(c.width / vel)).fill(0);
  const znaky = 'EPOX01<>/{}[]=+*アイウエオカキクケコ';
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, c.width, c.height);
  const barva = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();

  const id = setInterval(() => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = barva;
    ctx.font = `${vel}px monospace`;
    y.forEach((radek, i) => {
      ctx.fillText(nahodny(znaky), i * vel, radek * vel);
      y[i] = (radek * vel > c.height && Math.random() > 0.975) ? 0 : radek + 1;
    });
  }, 50);

  const stop = () => {
    clearInterval(id);
    c.hidden = true;
    window.removeEventListener('keydown', stop);
    c.removeEventListener('click', stop);
    input.focus();
  };
  // malá pauza, aby Enter, který matrix spustil, ho hned nezastavil
  setTimeout(() => {
    window.addEventListener('keydown', stop);
    c.addEventListener('click', stop);
  }, 200);
}

/* ---------- 3) Karty ---------- */
function novyFakt() { $('#fact').textContent = nahodny(FAKTY); }
$('#new-fact').addEventListener('click', novyFakt);
novyFakt();

$('#roll').addEventListener('click', () => {
  const d = $('#dice');
  d.classList.remove('roll');
  void d.offsetWidth; // restart animace
  d.textContent = nahodny(KOSTKA);
  d.classList.add('roll');
});

function hodiny() {
  const ted = new Date();
  $('#clock').textContent = ted.toLocaleTimeString('cs-CZ');
  $('#date').textContent = ted.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });
}
hodiny();
setInterval(hodiny, 1000);

/* ---------- Panel ---------- */
const panel = $('#panel');
const panelTitulek = $('#panel-title');
const panelObsah = $('#panel-body');

function otevriPanel(titulek, ...obsah) {
  panelTitulek.textContent = titulek;
  panelObsah.replaceChildren(...obsah);
  panel.hidden = false;
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
$('#panel-close').addEventListener('click', () => { panel.hidden = true; });

/* ---------- 4) Tlačítko "Co jsme dělali" ---------- */
const HISTORIE = {
  ty: [
    'Zadal jsi web se 3 tlačítky dole, náhodným obsahem a klidně i s cmd.',
    'Vybral jsi Markdown jako jazyk „naučitelný za 60 sekund“ pro 3. tlačítko.',
    'Vybral jsi, že kontrola kódu má zkontrolovat web sám sebe.',
    'Chtěl jsi, aby web běžel na GitHubu.',
  ],
  ja: [
    'Položil jsem ti 4 otázky, abych věděl, co přesně chceš.',
    'Napsal jsem 4 soubory: index.html, style.css, script.js a README.md.',
    'Udělal jsem terminál s 15 příkazy (help, vtip, matrix, color…) a historií šipkami.',
    'Přidal jsem náhodné karty: fakt dne, kostku a hodiny.',
    'Napsal jsem kontrolu kódu se 18 testy a její verzi v Markdownu (kopírovat / stáhnout .md).',
    'Vytvořil jsem složku na tvém počítači a nahrál web na GitHub Pages.',
  ],
  nastaveni: [
    'Model: Claude Opus 5.5 od firmy Anthropic',
    'Jazyk odpovědí: čeština',
    'Styl: celé soubory najednou, vysvětlení česky',
    'Datum vytvoření: 15. 10. 2026',
  ],
};

function seznam(polozky) { return el('ul', {}, ...polozky.map((t) => el('li', {}, t))); }

function ukazHistorii() {
  otevriPanel('📜 Co jsme dělali',
    el('div', { class: 'columns' },
      el('div', {}, el('h3', {}, '👤 Ty (Jiří)'), seznam(HISTORIE.ty)),
      el('div', {}, el('h3', {}, '🤖 Já (Claude)'), seznam(HISTORIE.ja)),
      el('div', {}, el('h3', {}, '⚙️ Moje nastavení'), seznam(HISTORIE.nastaveni)),
    ),
  );
}

/* ---------- 5) Tlačítko "Kontrola kódu" ---------- */
function kontrola() {
  const v = [];
  const pridej = (nazev, stav, detail) => v.push({ nazev, stav, detail }); // stav: ok | varovani | chyba
  const vsechny = (sel) => [...document.querySelectorAll(sel)];

  const dt = document.doctype;
  pridej('DOCTYPE', dt && dt.name.toLowerCase() === 'html' ? 'ok' : 'chyba', dt ? '<!DOCTYPE html> nalezen' : 'chybí');

  const lang = document.documentElement.lang;
  pridej('Jazyk stránky (lang)', lang ? 'ok' : 'chyba', lang ? `lang="${lang}"` : 'chybí atribut lang');

  const charset = $('meta[charset]');
  pridej('Kódování znaků', charset ? 'ok' : 'chyba', charset ? charset.getAttribute('charset') : 'chybí <meta charset>');

  pridej('Mobilní zobrazení (viewport)', $('meta[name="viewport"]') ? 'ok' : 'varovani',
    $('meta[name="viewport"]') ? 'nastaveno' : 'chybí – na mobilu bude web malý');

  pridej('Titulek stránky', document.title.trim() ? 'ok' : 'chyba', document.title || 'prázdný');

  const popis = $('meta[name="description"]');
  pridej('Popis pro Google (description)', popis ? 'ok' : 'varovani', popis ? 'nastaven' : 'chybí');

  const ids = vsechny('[id]').map((e) => e.id);
  const dup = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  pridej('Unikátní ID', dup.length ? 'chyba' : 'ok', dup.length ? `duplicitní: ${dup.join(', ')}` : `${ids.length} ID, žádné duplicity`);

  const h1 = vsechny('h1').length;
  pridej('Právě jeden nadpis h1', h1 === 1 ? 'ok' : 'varovani', `počet h1: ${h1}`);

  const urovne = vsechny('h1, h2, h3, h4, h5, h6').map((h) => Number(h.tagName[1]));
  const skok = urovne.some((u, i) => i > 0 && u - urovne[i - 1] > 1);
  pridej('Pořadí nadpisů', skok ? 'varovani' : 'ok', skok ? 'některá úroveň nadpisu je přeskočená' : 'bez přeskakování');

  const imgs = vsechny('img');
  const bezAlt = imgs.filter((i) => !i.hasAttribute('alt')).length;
  pridej('Obrázky mají popis (alt)', bezAlt ? 'chyba' : 'ok', imgs.length ? `${imgs.length - bezAlt}/${imgs.length} má alt` : 'žádné obrázky');

  const btns = vsechny('button');
  const bezPopisu = btns.filter((b) => !(b.textContent.trim() || b.getAttribute('aria-label'))).length;
  pridej('Tlačítka mají popisek', bezPopisu ? 'chyba' : 'ok', `${btns.length - bezPopisu}/${btns.length} v pořádku`);

  const pole = vsechny('input, textarea, select');
  const bezLabel = pole.filter((i) => !(i.labels && i.labels.length) && !i.getAttribute('aria-label')).length;
  pridej('Formulářová pole mají label', bezLabel ? 'chyba' : 'ok', `${pole.length - bezLabel}/${pole.length} v pořádku`);

  const odkazy = vsechny('a');
  const bezHref = odkazy.filter((a) => !a.getAttribute('href')).length;
  pridej('Odkazy mají cíl (href)', bezHref ? 'chyba' : 'ok', `${odkazy.length - bezHref}/${odkazy.length} v pořádku`);

  const css = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  pridej('CSS načteno (style.css)', css ? 'ok' : 'chyba', css ? 'proměnné CSS fungují' : 'style.css se nenačetl');

  pridej('JavaScript bez chyb', chyby.length ? 'chyba' : 'ok', chyby.length ? chyby.slice(0, 3).join(' | ') : 'žádné chyby za běhu');

  const inline = vsechny('body [style]').length;
  pridej('Bez inline stylů', inline ? 'varovani' : 'ok', inline ? `${inline} prvků má style=""` : 'všechny styly jsou ve style.css');

  const proto = location.protocol;
  pridej('Zabezpečení (HTTPS)', proto === 'https:' ? 'ok' : 'varovani',
    proto === 'file:' ? 'otevřeno z disku – po nahrání na GitHub Pages bude HTTPS' : proto.replace(':', ''));

  const nav = performance.getEntriesByType('navigation')[0];
  if (nav && nav.loadEventEnd > 0) {
    const ms = Math.round(nav.loadEventEnd - nav.startTime);
    pridej('Rychlost načtení', ms < 2000 ? 'ok' : 'varovani', `${ms} ms`);
  }
  return v;
}

const IKONA = { ok: '✅', varovani: '⚠️', chyba: '❌' };

function spocitej(v) {
  return {
    ok: v.filter((r) => r.stav === 'ok').length,
    varovani: v.filter((r) => r.stav === 'varovani').length,
    chyba: v.filter((r) => r.stav === 'chyba').length,
  };
}

function w3cOdkaz() {
  if (location.protocol.startsWith('http')) {
    return el('p', { class: 'note' }, 'Oficiální kontrola od W3C: ',
      el('a', { href: `https://validator.w3.org/nu/?doc=${encodeURIComponent(location.href)}`, target: '_blank', rel: 'noopener' }, 'validator.w3.org'));
  }
  return el('p', { class: 'note' }, 'Tip: až bude web na GitHub Pages, tady se objeví odkaz na oficiální W3C validátor.');
}

function ukazKontrolu() {
  const v = kontrola();
  const p = spocitej(v);
  otevriPanel('✅ Kontrola kódu',
    el('div', { class: 'summary' },
      el('span', { class: 'pill ok' }, `✅ OK: ${p.ok}`),
      el('span', { class: 'pill varovani' }, `⚠️ Varování: ${p.varovani}`),
      el('span', { class: 'pill chyba' }, `❌ Chyby: ${p.chyba}`),
    ),
    el('ul', { class: 'checks' }, ...v.map((r) =>
      el('li', { class: r.stav },
        el('span', {}, IKONA[r.stav]),
        el('span', { class: 'name' }, r.nazev),
        el('span', { class: 'detail' }, r.detail),
      ))),
    w3cOdkaz(),
  );
}

/* ---------- 6) Tlačítko "Kontrola v Markdownu" ---------- */
function vytvorMarkdown(v) {
  const p = spocitej(v);
  let md = '# Kontrola kódu – EPOX web\n\n';
  md += `**Datum:** ${new Date().toLocaleString('cs-CZ')}\n`;
  md += `**Adresa:** ${location.href}\n\n`;
  md += '## Výsledek\n\n';
  md += `- ✅ OK: **${p.ok}**\n- ⚠️ Varování: **${p.varovani}**\n- ❌ Chyby: **${p.chyba}**\n\n`;
  md += '## Detaily\n\n| # | Kontrola | Stav | Detail |\n|---|---|---|---|\n';
  v.forEach((r, i) => {
    md += `| ${i + 1} | ${r.nazev} | ${IKONA[r.stav]} | \`${r.detail.replace(/\|/g, '\\|')}\` |\n`;
  });
  md += '\n## Verdikt\n\n';
  md += p.chyba ? '**Web má chyby – oprav je.**\n'
    : p.varovani ? 'Web funguje, ale jsou tu **varování**.\n'
    : '**Všechno je v pohodě.** 🎉\n';
  return md;
}

// Malý převodník Markdown -> HTML (nadpisy, seznamy, tabulky, tučné, `kód`)
function mdNaHtml(md) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const radkovy = (s) => esc(s)
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  const bunky = (l) => l.trim().slice(1, -1).split(/(?<!\\)\|/)
    .map((c) => radkovy(c.trim().replace(/\\\|/g, '|')));

  const radky = md.split('\n');
  let html = '';
  let i = 0;
  while (i < radky.length) {
    const r = radky[i];
    const nadpis = r.match(/^(#{1,4}) (.*)/);
    if (nadpis) {
      const uroven = Math.min(nadpis[1].length + 2, 6); // # -> h3, ## -> h4
      html += `<h${uroven}>${radkovy(nadpis[2])}</h${uroven}>`;
      i++;
    } else if (r.startsWith('|')) {
      const tab = [];
      while (i < radky.length && radky[i].startsWith('|')) tab.push(radky[i++]);
      html += '<table><thead><tr>' + bunky(tab[0]).map((c) => `<th>${c}</th>`).join('') + '</tr></thead><tbody>'
        + tab.slice(2).map((l) => '<tr>' + bunky(l).map((c) => `<td>${c}</td>`).join('') + '</tr>').join('')
        + '</tbody></table>';
    } else if (r.startsWith('- ')) {
      html += '<ul>';
      while (i < radky.length && radky[i].startsWith('- ')) html += `<li>${radkovy(radky[i++].slice(2))}</li>`;
      html += '</ul>';
    } else if (r.trim()) {
      html += `<p>${radkovy(r)}</p>`;
      i++;
    } else {
      i++;
    }
  }
  return html;
}

function ukazMarkdown() {
  const md = vytvorMarkdown(kontrola());
  const zdroj = el('pre', { class: 'md-source' }, md);
  const vykresleno = el('div', { class: 'md-render' });
  vykresleno.innerHTML = mdNaHtml(md); // obsah je escapovaný v mdNaHtml
  vykresleno.hidden = true;

  const tabZdroj = el('button', { type: 'button', class: 'tab-btn active' }, 'Markdown (zdroj)');
  const tabRender = el('button', { type: 'button', class: 'tab-btn' }, 'Vykresleno');
  const prepni = (ukazZdroj) => {
    zdroj.hidden = !ukazZdroj;
    vykresleno.hidden = ukazZdroj;
    tabZdroj.classList.toggle('active', ukazZdroj);
    tabRender.classList.toggle('active', !ukazZdroj);
  };
  tabZdroj.addEventListener('click', () => prepni(true));
  tabRender.addEventListener('click', () => prepni(false));

  const kopirovat = el('button', { type: 'button', class: 'small-btn' }, '📋 Kopírovat');
  kopirovat.addEventListener('click', () => {
    navigator.clipboard.writeText(md)
      .then(() => { kopirovat.textContent = '✔ Zkopírováno'; })
      .catch(() => { kopirovat.textContent = 'Kopírování nejde – označ text ručně'; });
  });

  const stahnout = el('button', { type: 'button', class: 'small-btn' }, '💾 Stáhnout .md');
  stahnout.addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([md], { type: 'text/markdown' }));
    const a = el('a', { href: url, download: 'kontrola-epox.md' });
    a.click();
    URL.revokeObjectURL(url);
  });

  otevriPanel('📝 Kontrola v Markdownu',
    el('p', { class: 'note' }, 'Stejná kontrola jako u druhého tlačítka, jen výsledek je zapsaný v Markdownu – jazyce, který se naučíš za 60 sekund: # nadpis, - seznam, **tučně**, `kód`, | tabulka |.'),
    el('div', { class: 'toolbar' }, tabZdroj, tabRender, kopirovat, stahnout),
    zdroj,
    vykresleno,
  );
}

/* ---------- Tlačítka dole ---------- */
$('#btn-history').addEventListener('click', ukazHistorii);
$('#btn-check').addEventListener('click', ukazKontrolu);
$('#btn-md').addEventListener('click', ukazMarkdown);

/* ---------- Start terminálu ---------- */
tisk('EPOX web [verze 1.0.0]');
tisk('Napiš help pro seznam příkazů.');
tisk('');
