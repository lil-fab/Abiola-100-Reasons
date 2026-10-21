(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const pad = (x, l = 3) => String(x).padStart(l, "0");
  const url = () => location.origin + location.pathname;
  const wa = (t) => "https://wa.me/?text=" + encodeURIComponent(t);

  const ticks = Array.from({ length: 12 }, (_, i) =>
    `<line class="tk" x1="50" y1="${i % 3 ? 8 : 5}" x2="50" y2="${i % 3 ? 12 : 14}" transform="rotate(${i * 30} 50 50)"/>`).join("");
  const dial = (angle = 0, live = false) =>
    `<svg class="dial" viewBox="0 0 100 100" aria-hidden="true"><circle class="rim" cx="50" cy="50" r="47"/>${ticks}` +
    `<line class="hr2" x1="50" y1="50" x2="50" y2="26" style="transform:rotate(${angle / 12}deg)"/>` +
    `<line class="hand${live ? " live" : ""}" x1="50" y1="50" x2="50" y2="12" style="transform:rotate(${angle}deg)"/><circle class="hub" cx="50" cy="50" r="3"/></svg>`;
  const seal = `<svg class="seal" viewBox="0 0 48 48" aria-hidden="true"><path d="M24 2l5 3.5 6-.5 2.5 5.5 5.5 2.5-.5 6L46 24l-3.5 5 .5 6-5.5 2.5L35 43l-6-.5L24 46l-5-3.5-6 .5-2.5-5.5L5 35l.5-6L2 24l3.5-5-.5-6 5.5-2.5L13 5l6 .5z"/><path d="M15 25l6 6 12-13"/></svg>`;

  $("#mini").innerHTML = dial(0, true);
  $("#big").innerHTML = dial(0, true);

  // build chapters
  let n = 0, html = "";
  C.forEach((c, i) => {
    const a = n + 1;
    html += `<section class="ch" id="c${i + 1}"><header class="chh"><span class="cn">${pad(i + 1, 2)}</span><div><h2>${c.t}</h2><p>${c.s}</p><span class="rg">Reasons ${a} to ${a + c.r.length - 1}</span></div>${dial((i + 1) * 36)}</header>`;
    c.r.forEach((t) => {
      n++;
      html += `<article class="r" id="r${n}" data-n="${n}"><span class="n">${pad(n)}</span><p>${t}</p><div class="act"><a class="wa" target="_blank" rel="noopener" data-n="${n}" href="#">Share</a>${seal}</div></article>`;
    });
    html += "</section>";
  });
  $("#chapters").innerHTML = html;
  $("#chips").innerHTML = C.map((c, i) => `<a href="#c${i + 1}">${c.k}</a>`).join("");
  $("#last").textContent = C[9].r[9];

  const cards = [...document.querySelectorAll(".r")];
  const secs = [...document.querySelectorAll(".ch")];
  const chips = [...document.querySelectorAll("#chips a")];
  const lives = [...document.querySelectorAll(".hand.live")];
  const text = (el) => $("p", el).textContent;

  // share links
  document.querySelectorAll(".wa").forEach((a) => {
    const k = a.dataset.n;
    a.href = wa(`*Reason ${k} of 100 to vote Abiola Olaniyi (001) for UI'SU President:*\n\n_${text($("#r" + k))}_\n\nRead all 100: ${url()}#r${k}`);
  });
  $("#shareSite").href = wa(`*100 reasons to vote Abiola Olaniyi (001) for UI'SU President.*\n\n_The Paradigm Shift '27._\n\n${url()}`);

  // scroll progress: clock, counter, active chapter
  let tick = false;
  function update() {
    tick = false;
    let cur = 0;
    for (const el of cards) if (!el.hidden && el.getBoundingClientRect().top < innerHeight * 0.55) cur = +el.dataset.n;
    $("#cur").textContent = pad(cur);
    lives.forEach((h) => (h.style.transform = `rotate(${(cur / 100) * 360}deg)`));
    let on = -1;
    secs.forEach((s, i) => { if (!s.hidden && s.getBoundingClientRect().top < innerHeight * 0.4) on = i; });
    chips.forEach((c, i) => c.classList.toggle("on", i === on));
    if (on >= 0 && chips[on]) {
      const box = $("#chips");
      box.scrollTo({ left: chips[on].offsetLeft - 16, behavior: "smooth" });
    }
  }
  addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener("resize", update);

  // stamp seals as reasons enter view
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.6 });
  cards.forEach((c) => io.observe(c));

  // search
  $("#q").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    cards.forEach((c) => (c.hidden = !!q && !text(c).toLowerCase().includes(q) && !c.dataset.n.includes(q)));
    secs.forEach((s) => (s.hidden = !s.querySelector(".r:not([hidden])")));
    $("#none").hidden = cards.some((c) => !c.hidden);
    update();
  });

  // typing search bar
  const Q = ["Why vote Abiola Olaniyi?", "Abiola Olaniyi's ideology about leadership.", "What is Abiola Olaniyi's vision for the University of Ibadan?", "Why do UI students need a Paradigm Shift?", "Who is Abiola Olaniyi?"];
  const out = $("#typed");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) out.textContent = Q[0];
  else {
    let qi = 0, ci = 0, del = false;
    (function type() {
      const s = Q[qi];
      out.textContent = s.slice(0, ci);
      let wait = del ? 25 : 55;
      if (!del && ci === s.length) { del = true; wait = 1600; }
      else if (del && ci === 0) { del = false; qi = (qi + 1) % Q.length; wait = 350; }
      else ci += del ? -1 : 1;
      setTimeout(type, wait);
    })();
  }

  update();
  if (location.hash) { const t = $(location.hash); if (t) setTimeout(() => t.scrollIntoView(), 50); }
})();
