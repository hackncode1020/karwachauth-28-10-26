// Karwa Chauth Moon 🌙 — made by @hack.n.code
(() => {
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const CAPTURE = params.has('capture');
  const cv = $('sky'), ctx = cv.getContext('2d');
  let W = 0, H = 0, DPR = 1;

  // ---------- timeline (seconds after Start) ----------
  const T = { MOON0: 0, MOON1: 2.2, CH0: 1.8, CH1: 3.6, MORPH0: 3.8, MORPH1: 5.2, L1_0: 5.0, L1_1: 6.6, L2_0: 6.7, L2_1: 8.3, DONE: 8.6 };
  const LINE1 = 'Mera chaand tum ho 🌙❤️';
  const HAPPY = 'Happy Karwa Chauth,';

  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const easeOut = (x) => 1 - Math.pow(1 - x, 3);
  const easeInOut = (x) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const easeBack = (x) => { const c1 = 1.25, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
  const rnd = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const graphemes = (s) => (window.Intl && Intl.Segmenter) ? [...new Intl.Segmenter().segment(s)].map(x => x.segment) : Array.from(s);

  // ---------- state ----------
  const S = { phase: 'idle', t: 0, G: 0, name: '', start: 0 };

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function geom() {
    const R = Math.min(W * 0.33, H * 0.18);
    return { cx: W / 2, cy: H * 0.335, R, r: R * 0.6 };
  }

  // ---------- painters ----------
  function drawSky(G) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#05041a'); g.addColorStop(0.45, '#120a36'); g.addColorStop(0.8, '#2a0f3c'); g.addColorStop(1, '#3d1530');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // warm horizon glow behind diyas
    const hg = ctx.createRadialGradient(W / 2, H * 1.02, 10, W / 2, H * 1.02, H * 0.5);
    hg.addColorStop(0, 'rgba(255,140,40,0.35)'); hg.addColorStop(1, 'rgba(255,140,40,0)');
    ctx.fillStyle = hg; ctx.fillRect(0, 0, W, H);
    // stars
    const n = Math.round(W * H / 2600);
    for (let i = 0; i < n; i++) {
      const x = rnd(i) * W, y = rnd(i + 500) * H * 0.78;
      const tw = 0.45 + 0.55 * Math.sin(G * (1.2 + rnd(i + 900) * 2.5) + i);
      const s = 0.5 + rnd(i + 1300) * 1.3;
      ctx.globalAlpha = clamp(0.25 + 0.6 * tw);
      ctx.fillStyle = rnd(i + 77) > 0.85 ? '#ffe3a3' : '#ffffff';
      ctx.beginPath(); ctx.arc(x, y, s, 0, 6.283); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function sparkle(x, y, s, a, col) {
    ctx.globalAlpha = a; ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(x, y - s); ctx.quadraticCurveTo(x, y, x + s, y); ctx.quadraticCurveTo(x, y, x, y + s);
    ctx.quadraticCurveTo(x, y, x - s, y); ctx.quadraticCurveTo(x, y, x, y - s); ctx.fill();
  }

  function drawSparkles(G, boost) {
    const n = 46;
    for (let i = 0; i < n; i++) {
      const sp = 14 + rnd(i + 40) * 22;
      const x = rnd(i + 3) * W + Math.sin(G * 0.6 + i) * 12;
      const y = H - ((rnd(i + 9) * H + G * sp) % (H + 40)) + 20;
      const tw = 0.5 + 0.5 * Math.sin(G * (2 + rnd(i) * 3) + i * 1.7);
      sparkle(x, y, 2 + rnd(i + 21) * 4 * (1 + boost * 0.4), clamp((0.15 + 0.6 * tw) * (0.7 + boost * 0.5)), i % 3 ? '#ffd877' : '#fff1c9');
    }
    ctx.globalAlpha = 1;
  }

  function drawBorder(G) {
    const m = 10, gold = '#e9b44c';
    ctx.save();
    ctx.strokeStyle = 'rgba(233,180,76,0.75)'; ctx.lineWidth = 1.5;
    ctx.strokeRect(m, m, W - 2 * m, H - 2 * m);
    ctx.strokeStyle = 'rgba(233,180,76,0.35)'; ctx.lineWidth = 1;
    ctx.strokeRect(m + 6, m + 6, W - 2 * m - 12, H - 2 * m - 12);
    // scallops + dots along edges (mehendi lace)
    const step = 22;
    ctx.strokeStyle = 'rgba(233,180,76,0.6)'; ctx.fillStyle = 'rgba(255,215,130,0.75)'; ctx.lineWidth = 1.2;
    const edge = (x0, y0, x1, y1, nx, ny) => {
      const len = Math.hypot(x1 - x0, y1 - y0), k = Math.floor(len / step), ux = (x1 - x0) / len, uy = (y1 - y0) / len;
      for (let i = 1; i < k - 1; i++) {
        const px = x0 + ux * (i * step + step / 2), py = y0 + uy * (i * step + step / 2);
        ctx.beginPath(); ctx.arc(px, py, step / 2 - 1, Math.atan2(ny, nx) - Math.PI / 2, Math.atan2(ny, nx) + Math.PI / 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(px + nx * (step / 2 + 3), py + ny * (step / 2 + 3), 1.4, 0, 6.283); ctx.fill();
      }
    };
    const o = m + 6;
    edge(o, o, W - o, o, 0, 1); edge(o, H - o, W - o, H - o, 0, -1);
    edge(o, o, o, H - o, 1, 0); edge(W - o, o, W - o, H - o, -1, 0);
    // corner paisleys
    const corner = (x, y, sx, sy) => {
      ctx.save(); ctx.translate(x, y); ctx.scale(sx, sy);
      ctx.strokeStyle = gold; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(4, 46); ctx.bezierCurveTo(4, 14, 22, 4, 44, 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(14, 30); ctx.bezierCurveTo(16, 18, 26, 14, 34, 16); ctx.bezierCurveTo(40, 18, 38, 28, 30, 27); ctx.bezierCurveTo(24, 26, 25, 20, 30, 20); ctx.stroke();
      ctx.fillStyle = '#ffd27a';
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(8 + i * 9, 52 - i * 9 + (i > 2 ? 6 : 0), 1.6, 0, 6.283); ctx.fill(); }
      ctx.beginPath(); ctx.arc(18, 18, 3, 0, 6.283); ctx.fill();
      ctx.restore();
    };
    corner(m + 4, m + 4, 1, 1); corner(W - m - 4, m + 4, -1, 1); corner(m + 4, H - m - 4, 1, -1); corner(W - m - 4, H - m - 4, -1, -1);
    ctx.restore();
  }

  function drawDiya(x, y, s, G, i) {
    // flame glow
    const fl = 0.85 + 0.15 * Math.sin(G * 11 + i * 2.1) + 0.08 * Math.sin(G * 23 + i);
    const gl = ctx.createRadialGradient(x, y - s * 0.9, 1, x, y - s * 0.9, s * 2.6 * fl);
    gl.addColorStop(0, 'rgba(255,190,80,0.55)'); gl.addColorStop(1, 'rgba(255,120,30,0)');
    ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, y - s * 0.9, s * 2.6 * fl, 0, 6.283); ctx.fill();
    // flame
    const sway = Math.sin(G * 6 + i) * s * 0.08;
    ctx.save(); ctx.translate(x, y - s * 0.32);
    const fh = s * 1.05 * fl;
    let fg = ctx.createLinearGradient(0, -fh, 0, 0);
    fg.addColorStop(0, '#fff6c8'); fg.addColorStop(0.45, '#ffc23d'); fg.addColorStop(1, '#ff6a00');
    ctx.fillStyle = fg;
    ctx.beginPath(); ctx.moveTo(sway * 2, -fh);
    ctx.bezierCurveTo(s * 0.32 + sway, -fh * 0.45, s * 0.24, 0, 0, 0);
    ctx.bezierCurveTo(-s * 0.24, 0, -s * 0.32 + sway, -fh * 0.45, sway * 2, -fh); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,240,0.85)';
    ctx.beginPath(); ctx.ellipse(sway * 0.6, -fh * 0.28, s * 0.07, s * 0.2, 0, 0, 6.283); ctx.fill();
    ctx.restore();
    // clay bowl
    const bg = ctx.createLinearGradient(x, y - s * 0.4, x, y + s * 0.5);
    bg.addColorStop(0, '#d9772f'); bg.addColorStop(1, '#7a2e10');
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.moveTo(x - s * 1.05, y - s * 0.3);
    ctx.quadraticCurveTo(x, y - s * 0.12, x + s * 1.05, y - s * 0.3);
    ctx.quadraticCurveTo(x + s * 0.9, y + s * 0.5, x, y + s * 0.5);
    ctx.quadraticCurveTo(x - s * 0.9, y + s * 0.5, x - s * 1.05, y - s * 0.3); ctx.fill();
    ctx.fillStyle = '#ffd46b';
    for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.arc(x + k * s * 0.32, y + s * 0.12, s * 0.06, 0, 6.283); ctx.fill(); }
    ctx.strokeStyle = 'rgba(255,214,120,0.7)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x - s * 0.8, y - s * 0.02); ctx.quadraticCurveTo(x, y + s * 0.12, x + s * 0.8, y - s * 0.02); ctx.stroke();
  }

  function drawDiyas(G) {
    const y = H - 116 - 30, s = Math.min(W, 480) * 0.05;
    const xs = [0.1, 0.27, 0.5, 0.73, 0.9];
    xs.forEach((f, i) => drawDiya(W * f, y + (i === 2 ? 0 : (i % 2 ? 6 : -2)), s * (i === 2 ? 1.15 : 1), G, i));
  }

  function drawMoon(x, y, r, a, G) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    const halo = ctx.createRadialGradient(x, y, r * 0.8, x, y, r * 2.6);
    halo.addColorStop(0, 'rgba(255,236,190,0.45)'); halo.addColorStop(1, 'rgba(255,236,190,0)');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(x, y, r * 2.6, 0, 6.283); ctx.fill();
    const mg = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    mg.addColorStop(0, '#fffdf2'); mg.addColorStop(0.7, '#fbeec8'); mg.addColorStop(1, '#e9d29a');
    ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
    ctx.fillStyle = 'rgba(190,160,100,0.22)';
    [[-0.3, -0.2, 0.18], [0.25, 0.1, 0.24], [-0.1, 0.38, 0.12], [0.35, -0.35, 0.1], [-0.42, 0.18, 0.09]].forEach(([dx, dy, rr]) => {
      ctx.beginPath(); ctx.arc(x + dx * r, y + dy * r, rr * r, 0, 6.283); ctx.fill();
    });
    ctx.restore();
  }

  function heartPath(x, y, s) {
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const t = i / 120 * Math.PI * 2;
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      const px = x + hx * s / 16, py = y - hy * s / 16 - s * 0.08;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath();
  }

  function drawHeart(x, y, s, a, G) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    const halo = ctx.createRadialGradient(x, y, s * 0.3, x, y, s * 2.4);
    halo.addColorStop(0, 'rgba(255,90,130,0.55)'); halo.addColorStop(0.5, 'rgba(255,170,70,0.18)'); halo.addColorStop(1, 'rgba(255,90,130,0)');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(x, y, s * 2.4, 0, 6.283); ctx.fill();
    heartPath(x, y, s);
    const hg = ctx.createRadialGradient(x - s * 0.3, y - s * 0.35, s * 0.05, x, y, s * 1.1);
    hg.addColorStop(0, '#ffd0dc'); hg.addColorStop(0.35, '#ff5c86'); hg.addColorStop(1, '#c4123f');
    ctx.fillStyle = hg; ctx.shadowColor = 'rgba(255,80,120,0.9)'; ctx.shadowBlur = s * 0.5; ctx.fill();
    ctx.shadowBlur = 0; ctx.lineWidth = Math.max(2, s * 0.05); ctx.strokeStyle = 'rgba(255,215,130,0.95)'; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath(); ctx.ellipse(x - s * 0.42, y - s * 0.42, s * 0.16, s * 0.08, -0.7, 0, 6.283); ctx.fill();
    ctx.restore();
  }

  function drawChhalni(x, y, R, G) {
    const Ri = R * 0.84;
    ctx.save();
    // mesh (seen-through sieve)
    ctx.beginPath(); ctx.arc(x, y, Ri, 0, 6.283); ctx.clip();
    ctx.fillStyle = 'rgba(40,10,30,0.18)'; ctx.fillRect(x - Ri, y - Ri, Ri * 2, Ri * 2);
    ctx.strokeStyle = 'rgba(255,214,130,0.42)'; ctx.lineWidth = 1;
    const step = Ri / 9;
    ctx.beginPath();
    for (let k = -Ri * 2; k <= Ri * 2; k += step) {
      ctx.moveTo(x + k - Ri * 2, y - Ri * 2); ctx.lineTo(x + k + Ri * 2, y + Ri * 2);
      ctx.moveTo(x + k + Ri * 2, y - Ri * 2); ctx.lineTo(x + k - Ri * 2, y + Ri * 2);
    }
    ctx.stroke();
    ctx.restore();
    // golden rim
    ctx.save();
    const rimW = R * 0.16, rr = (R + Ri) / 2;
    const rg = ctx.createRadialGradient(x, y, Ri, x, y, R);
    rg.addColorStop(0, '#9c5d10'); rg.addColorStop(0.35, '#ffd770'); rg.addColorStop(0.65, '#f0a830'); rg.addColorStop(1, '#8a4a08');
    ctx.strokeStyle = rg; ctx.lineWidth = rimW; ctx.shadowColor = 'rgba(255,190,80,0.7)'; ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.283); ctx.stroke(); ctx.shadowBlur = 0;
    // red velvet band with gota dots
    ctx.strokeStyle = '#a3123a'; ctx.lineWidth = rimW * 0.36;
    ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.283); ctx.stroke();
    const nb = 40;
    for (let i = 0; i < nb; i++) {
      const a = i / nb * 6.283 + G * 0.05;
      ctx.fillStyle = i % 5 === 0 ? '#ffffff' : '#ffd36a';
      ctx.beginPath(); ctx.arc(x + Math.cos(a) * rr, y + Math.sin(a) * rr, i % 5 === 0 ? rimW * 0.16 : rimW * 0.09, 0, 6.283); ctx.fill();
    }
    // outer lace (gota triangles) + beads
    const nl = 56;
    ctx.fillStyle = '#ffcf5a';
    for (let i = 0; i < nl; i++) {
      const a = i / nl * 6.283;
      const ax = x + Math.cos(a) * R, ay = y + Math.sin(a) * R;
      const tx = x + Math.cos(a) * (R + R * 0.075), ty = y + Math.sin(a) * (R + R * 0.075);
      const pa = a + Math.PI / 2, w = R * 0.045;
      ctx.beginPath(); ctx.moveTo(ax + Math.cos(pa) * w, ay + Math.sin(pa) * w); ctx.lineTo(tx, ty); ctx.lineTo(ax - Math.cos(pa) * w, ay - Math.sin(pa) * w); ctx.fill();
    }
    // 8 kundan gems
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * 6.283 + Math.PI / 8;
      const gx = x + Math.cos(a) * rr, gy = y + Math.sin(a) * rr;
      ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.arc(gx, gy, rimW * 0.42, 0, 6.283); ctx.fill();
      ctx.fillStyle = i % 2 ? '#1f8f5a' : '#d11a4a'; ctx.beginPath(); ctx.arc(gx, gy, rimW * 0.3, 0, 6.283); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.arc(gx - rimW * 0.1, gy - rimW * 0.1, rimW * 0.08, 0, 6.283); ctx.fill();
    }
    ctx.restore();
  }

  function drawBurst(x, y, R, k) {
    if (k <= 0 || k >= 1) return;
    for (let i = 0; i < 36; i++) {
      const a = rnd(i + 2000) * 6.283, d = R * (0.3 + 1.5 * easeOut(k) * (0.5 + rnd(i + 2100)));
      sparkle(x + Math.cos(a) * d, y + Math.sin(a) * d, 3 + rnd(i + 2200) * 5, (1 - k) * 0.95, i % 2 ? '#ffd877' : '#ff9fb6');
    }
    ctx.globalAlpha = 1;
  }

  // ---------- one frame ----------
  function paint() {
    const { phase, G } = S;
    const t = phase === 'idle' ? 0 : S.t;
    const { cx, cy, R, r } = geom();
    drawSky(G);
    const started = phase !== 'idle';
    drawSparkles(G, started ? prog(t, T.MORPH0, T.MORPH1) : 0);
    if (started) {
      const mp = easeInOut(prog(t, T.MOON0, T.MOON1));
      const my = (H + r * 1.5) + (cy - (H + r * 1.5)) * mp;
      const mk = easeInOut(prog(t, T.MORPH0, T.MORPH1));
      const beat = 1 + 0.06 * Math.pow(Math.max(0, Math.sin(G * 5.2)), 6) * mk;
      drawMoon(cx, my, r * (1 - 0.25 * mk), 1 - mk, G);
      drawHeart(cx, cy, r * (0.65 + 0.33 * mk) * beat, mk, G);
      const cp = easeBack(prog(t, T.CH0, T.CH1));
      const chx = (-R * 1.3) + (cx + R * 1.3) * cp;
      if (t > T.CH0) drawChhalni(chx, cy, R, G);
      drawBurst(cx, cy, R, prog(t, T.MORPH0 + 0.6, T.MORPH1 + 1.2));
    } else {
      // idle: soft glow where the moon will rise
      const gg = ctx.createRadialGradient(cx, cy, 5, cx, cy, R * 1.4);
      gg.addColorStop(0, 'rgba(255,230,170,' + (0.10 + 0.05 * Math.sin(G * 2)) + ')'); gg.addColorStop(1, 'rgba(255,230,170,0)');
      ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(cx, cy, R * 1.4, 0, 6.283); ctx.fill();
      sparkle(cx, cy, 10 + 3 * Math.sin(G * 3), 0.8, '#fff1c9'); ctx.globalAlpha = 1;
    }
    drawDiyas(G);
    drawBorder(G);
    // text
    const nm = (S.name || '').trim() || 'my love';
    const g1 = graphemes(LINE1), n1 = Math.round(g1.length * prog(t, T.L1_0, T.L1_1));
    const full2 = graphemes(HAPPY + '\u0001' + nm);
    const n2 = Math.round(full2.length * prog(t, T.L2_0, T.L2_1));
    const shown2 = full2.slice(0, n2).join('').split('\u0001');
    setText('line1', started ? g1.slice(0, n1).join('') : '');
    setText('hk', started ? shown2[0] : '');
    setText('nm', started && shown2.length > 1 ? shown2[1] : '');
    $('line1').classList.toggle('caret', started && t > T.L1_0 - 0.2 && t < T.L1_1 + 0.1);
    const onNm = shown2.length > 1;
    $('hk').classList.toggle('caret', started && !onNm && t > T.L2_0 - 0.1 && t < T.L2_1);
    $('nm').classList.toggle('caret', started && onNm && t < T.L2_1 + 0.25);
    document.body.classList.toggle('running', phase === 'run');
    document.body.classList.toggle('done', phase === 'done');
  }
  const cache = {};
  function setText(id, v) { if (cache[id] !== v) { cache[id] = v; $(id).textContent = v; } }

  // ---------- live loop ----------
  let t0 = performance.now();
  function loop(now) {
    S.G = (now - t0) / 1000;
    if (S.phase === 'run') { S.t = (now - S.start) / 1000; if (S.t >= T.DONE) { S.phase = 'done'; } }
    else if (S.phase === 'done') { S.t = (now - S.start) / 1000; }
    paint(); requestAnimationFrame(loop);
  }

  function start() {
    S.name = $('name').value.trim();
    S.phase = 'run'; S.start = performance.now(); S.t = 0;
    const u = new URL(location.href); if (S.name) u.searchParams.set('name', S.name); else u.searchParams.delete('name');
    history.replaceState(null, '', u);
    $('name').blur();
  }
  function toast(m) { const d = document.createElement('div'); d.id = 'toast'; d.textContent = m; document.body.appendChild(d); setTimeout(() => d.remove(), 2200); }
  async function share() {
    const u = new URL(location.origin + location.pathname); const n = (S.name || $('name').value).trim(); if (n) u.searchParams.set('name', n);
    const data = { title: 'Mera chaand tum ho 🌙❤️', text: 'Happy Karwa Chauth 🌙 Open this 👇', url: u.toString() };
    try { if (navigator.share) { await navigator.share(data); return; } } catch (e) { return; }
    try { await navigator.clipboard.writeText(data.text + ' ' + data.url); toast('Link copied 💌'); } catch (e) { prompt('Copy this link', data.url); }
  }
  $('go').addEventListener('click', start);
  $('name').addEventListener('keydown', (e) => { if (e.key === 'Enter') start(); });
  $('replay').addEventListener('click', () => { S.phase = 'run'; S.start = performance.now(); S.t = 0; });
  $('share').addEventListener('click', share);
  window.addEventListener('resize', resize);

  // ---------- capture hooks (record the reel frame by frame) ----------
  window.__render = (st) => {
    Object.assign(S, st);
    if ('typed' in st) $('name').value = st.typed;
    $('go').classList.toggle('press', !!st.press);
    $('name').classList.toggle('caret', !!st.caret);
    if (st.focus) $('name').style.borderColor = '#ffc55e'; else $('name').style.borderColor = '';
    paint();
  };
  window.__rect = (id) => { const r = $(id).getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; };
  window.__T = T;

  resize();
  const pn = (params.get('name') || '').slice(0, 18);
  if (pn) $('name').value = pn;
  if (CAPTURE) { document.body.classList.add('cap'); document.fonts.ready.then(() => { resize(); paint(); setTimeout(() => { window.__ready = true; }, 300); }); }
  else {
    requestAnimationFrame(loop);
    if (pn) setTimeout(start, 700);
  }
})();
