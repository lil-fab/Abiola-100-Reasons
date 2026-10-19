/* ===== Fill these in when confirmed ===== */
const CONFIG = {
  dates: "Election day: October 31st, 2026",            // e.g. "Accreditation: ... | Election day: ..."
  steps: []             // e.g. ["Step one", "Step two", "Step three"] from the accreditation flyer
};

const $ = s => document.querySelector(s);
const list = $('#list'), chips = $('#chips');
const pad = n => String(n).padStart(3, '0');
const esc = s => s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const base = location.href.split('#')[0];
const wa = t => 'https://wa.me/?text=' + encodeURIComponent(t);

// dial ticks
$('#ticks').innerHTML = Array.from({length:12}, (_, i) =>
  `<line x1="50" y1="9" x2="50" y2="${i % 3 ? 13 : 17}" transform="rotate(${i * 30} 50 50)"/>`).join('');

// build page
let n = 0, html = '', chipHtml = '';
const seal = '<span class="seal"><svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg></span>';
C.forEach((c, i) => {
  const from = n + 1, to = n + c.r.length;
  chipHtml += `<a href="#c${i+1}" data-c="${i+1}">${esc(c.k)}</a>`;
  html += `<section class="chapter" data-c="${i+1}"><div class="chap" id="c${i+1}"><small>Chapter ${i+1} of 10 &middot; Reasons ${from} to ${to}</small><h2>${esc(c.t)}</h2><p>${esc(c.s)}</p></div>`;
  c.r.forEach(t => {
    n++;
    const last = n === 100;
    html += `<article class="card${last ? ' last' : ''}" id="r${n}" data-n="${n}" data-t="${esc(t.toLowerCase())}"><div class="num">${pad(n)}</div><p>${esc(t)}</p><div class="meta">${seal}<a class="share" target="_blank" rel="noopener" href="${wa(`Reason ${n} of 100 to vote Abiola Olaniyi for UISU President:\n${t}\n${base}#r${n}`)}">Share on WhatsApp</a></div></article>`;
  });
  html += '</section>';
});
list.innerHTML = html;
chips.innerHTML = chipHtml;
const cards = [...document.querySelectorAll('.card')];
const chapters = [...document.querySelectorAll('.chapter')];

// seal stamp on view
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), {threshold:.6});
cards.forEach(c => io.observe(c));

// clock + counter + active chapter
let tick = false;
function update() {
  tick = false;
  const line = innerHeight * .4;
  let cur = 0;
  for (const c of cards) { if (c.classList.contains('hide')) continue; if (c.getBoundingClientRect().top < line) cur = +c.dataset.n; else break; }
  $('#cur').textContent = pad(cur);
  $('#hand').style.transform = `rotate(${cur / 100 * 360}deg)`;
  let act = 0;
  chapters.forEach((s, i) => { if (!s.classList.contains('hide') && s.getBoundingClientRect().top < line) act = i + 1; });
  chips.querySelectorAll('a').forEach(a => {
    const on = +a.dataset.c === act;
    if (on !== a.classList.contains('on')) { a.classList.toggle('on', on); if (on) a.scrollIntoView({inline:'center', block:'nearest'}); }
  });
}
addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(update); } }, {passive:true});
addEventListener('resize', update);
update();

// search
const q = $('#q');
q.addEventListener('input', () => {
  const v = q.value.trim().toLowerCase();
  let hits = 0;
  cards.forEach(c => {
    const ok = !v || c.dataset.t.includes(v);
    c.classList.toggle('hide', !ok);
    if (ok && v) hits++;
    const p = c.querySelector('p');
    const t = C.flatMap(x => x.r)[c.dataset.n - 1];
    p.innerHTML = v && ok ? esc(t).replace(new RegExp('(' + v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'), '<mark>$1</mark>') : esc(t);
  });
  chapters.forEach(s => {
    const any = s.querySelector('.card:not(.hide)');
    s.classList.toggle('hide', !any);
  });
  $('#found').textContent = v ? (hits ? `${hits} of 100 reasons match "${q.value.trim()}"` : 'No reasons match. Try a shorter word, like "money" or "hall".') : '';
  update();
});

// hero typing
const msg = 'Why vote Abiola Olaniyi?', typed = $('#typed');
if (matchMedia('(prefers-reduced-motion: reduce)').matches) typed.textContent = msg;
else { let i = 0; (function go() { typed.textContent = msg.slice(0, ++i); if (i < msg.length) setTimeout(go, 70); })(); }

// closer
if (CONFIG.dates) { const d = $('#dates'); d.textContent = CONFIG.dates; d.hidden = false; }
if (CONFIG.steps.length) { const s = $('#steps'); s.innerHTML = CONFIG.steps.map(x => `<li>${esc(x)}</li>`).join(''); s.hidden = false; }
$('#shareSite').href = wa(`100 reasons to vote Abiola Olaniyi for UISU President. The Paradigm Shift.\n${base}`);

// deep link to a reason
if (/^#r\d+$/.test(location.hash)) setTimeout(() => document.querySelector(location.hash)?.scrollIntoView(), 100);
