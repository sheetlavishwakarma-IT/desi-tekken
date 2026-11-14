'use strict';
// ====== CREATOR NAME (yahan se badal sakte ho) ======
const CREATOR = 'Sheetla Vishwakarma';
// ==========================================================
const $ = i => document.getElementById(i), R = Math.PI / 180, W = 900, GY = 360;
document.querySelectorAll('.cr').forEach(e => e.textContent = CREATOR);

const C = [
 {n:'वीर',en:'VEER',d:'पहलवान · Akhara Wrestler',hp:130,pw:1.15,sp:200,skin:'#c68642',top:null,pants:'#c1121f',hair:'#1b1b1b',st:'bald',beard:1},
 {n:'रुद्र',en:'RUDRA',d:'साधु · Monk of Kashi',hp:105,pw:1.05,sp:250,skin:'#b9783c',top:'#ff8c1a',pants:'#ff8c1a',hair:'#222222',st:'long',beard:1},
 {n:'ज्वाला',en:'JWALA',d:'योद्धा · Fire Fighter',hp:90,pw:1,sp:310,skin:'#d9965b',top:'#d6246e',pants:'#6a0f3a',hair:'#111111',st:'pony'},
 {n:'भैरव',en:'BHAIRAV',d:'नक़ाबपोश · Masked Shadow',hp:100,pw:1.2,sp:240,skin:'#a96a35',top:'#2a2a40',pants:'#2a2a40',hair:'#111111',st:'mask'},
 {n:'अर्जुन',en:'ARJUN',d:'धनुर्धर · Archer Prince',hp:100,pw:1.1,sp:270,skin:'#c98a4b',top:'#1d6fd1',pants:'#f1e9d2',hair:'#161616',st:'band'},
 {n:'तूफ़ान',en:'TUFAN',d:'पंजाबी शेर · Punjabi Speedster',hp:85,pw:1,sp:340,skin:'#cf9255',top:'#1f9d55',pants:'#f4f4f4',hair:'#e8590c',st:'turban',beard:1}
];
const MV = {
 lp:{dmg:6,rg:100,su:.08,dur:.28,kb:14,stun:.3,sfx:'punch',t:'LP'},
 rp:{dmg:10,rg:110,su:.14,dur:.45,kb:24,stun:.38,sfx:'punch',t:'RP'},
 lk:{dmg:8,rg:120,su:.12,dur:.4,kb:18,stun:.34,sfx:'kick',t:'LK'},
 rk:{dmg:14,rg:132,su:.2,dur:.62,kb:42,stun:.5,sfx:'kick',t:'RK!'}
};
// pose = [lean, frontArmUp, frontArmFore, backArmUp, backArmFore, frontThigh, frontShin, backThigh, backShin]
const P = {
 idle:[6,25,125,15,130,12,4,-14,-8], lp:[12,88,90,15,130,12,4,-14,-8], rp:[22,25,125,92,94,14,6,-18,-10],
 lk:[-6,25,125,15,130,78,80,-12,-6], rk:[-14,25,125,15,130,12,4,100,102],
 hit:[-18,-25,20,-20,15,-4,-2,-16,-10], block:[2,55,170,45,175,10,2,-12,-8]
};

// ---------- Sound (WebAudio, no files needed) ----------
let AC = null, mute = false;
const ac = () => { if (!AC) try { AC = new (window.AudioContext || window.webkitAudioContext)() } catch (e) {} if (AC && AC.state == 'suspended') AC.resume(); return AC };
function tone(f0, f1, d, ty, v) { const c = ac(); if (!c || mute) return; const o = c.createOscillator(), g = c.createGain(), t = c.currentTime; o.type = ty; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + d); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(g); g.connect(c.destination); o.start(); o.stop(t + d) }
function noise(d, fq, v, ty) { const c = ac(); if (!c || mute) return; const n = Math.floor(c.sampleRate * d), b = c.createBuffer(1, n, c.sampleRate), a = b.getChannelData(0), t = c.currentTime; for (let i = 0; i < n; i++) a[i] = Math.random() * 2 - 1; const s = c.createBufferSource(); s.buffer = b; const f = c.createBiquadFilter(); f.type = ty || 'lowpass'; f.frequency.value = fq; const g = c.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d); s.connect(f); f.connect(g); g.connect(c.destination); s.start() }
// Real sound files: put mp3s in the sounds/ folder (see sounds/README.txt). Missing file = synth fallback.
const REAL = {}, mp3 = n => { const a = new Audio('sounds/' + n + '.mp3'); a.preload = 'auto'; a.addEventListener('canplaythrough', () => REAL[n] = a, { once: true }); return a };
['punch', 'kick', 'block', 'swing', 'ko', 'bell', 'dhol', 'click'].forEach(mp3);
function play(n, v) { const a = REAL[n]; if (!a || mute) return false; const c = a.cloneNode(); c.volume = v || 1; c.play().catch(() => {}); return true }
let BGM = null, bgmTried = 0;
function startBgm() { if (bgmTried) return; bgmTried = 1; const a = new Audio('sounds/bgm.mp3'); a.loop = true; a.volume = .25; a.addEventListener('canplaythrough', () => { BGM = a; a.muted = mute; a.play().catch(() => {}) }, { once: true }) }
const SYN = {
 swing:() => noise(.1, 3000, .15, 'highpass'), punch:() => { noise(.05, 3500, .5, 'bandpass'); noise(.12, 900, .7); tone(170, 45, .14, 'sine', .9) },
 kick:() => { noise(.06, 2500, .5, 'bandpass'); noise(.2, 700, .9); tone(110, 35, .26, 'sine', 1) }, block:() => { tone(900, 500, .12, 'square', .15); noise(.06, 4000, .3, 'highpass') },
 ko:() => { tone(420, 50, .9, 'sawtooth', .25); noise(.4, 500, .5) }, bell:() => tone(1000, 990, .7, 'sine', .3),
 click:() => tone(600, 900, .08, 'square', .12), dhol:() => { tone(110, 60, .2, 'sine', .8); setTimeout(() => tone(90, 50, .25, 'sine', .8), 180) }
};
const SFX = {}; Object.keys(SYN).forEach(n => SFX[n] = () => { if (!play(n)) SYN[n]() });

// ---------- Drawing ----------
const dk = h => { const n = parseInt(h.slice(1), 16); return 'rgb(' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => v * .7 | 0).join() + ')' };
function pose(f) {
 const b = P.idle.slice();
 if (f.st == 'walk') { const w = Math.sin(f.anim * 11) * 26; b[5] += w; b[6] += w; b[7] -= w; b[8] -= w } else b[0] += Math.sin(f.anim * 4) * 1.5;
 let tg = null, k = 0;
 if (f.st == 'atk') { const m = MV[f.mv], u = f.t / m.dur; k = u < .4 ? u / .4 : Math.max(0, 1 - (u - .4) / .6); tg = P[f.mv] }
 else if (f.st == 'hit') { tg = P.hit; k = Math.min(1, f.t * 10) }
 else if (f.st == 'block') { tg = P.block; k = 1 }
 else if (f.st == 'ko') { tg = P.hit; k = 1 }
 return tg ? b.map((v, i) => v + (tg[i] - v) * k) : b;
}
function dr(c, f, gy, S) {
 const ch = f.ch, d = f.dir, Q = pose(f), th = 42 * S, sh = 40 * S, ua = 28 * S, fa = 26 * S, T = 60 * S;
 const bob = f.st == 'walk' ? Math.abs(Math.sin(f.anim * 11)) * 3 : 0;
 c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
 if (f.st == 'ko') { const q = -d * 1.45 * Math.min(1, f.t * 3); c.translate(f.x, gy); c.rotate(q); c.translate(-f.x, -gy) }
 c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(f.x, gy + 2, 38 * S, 7 * S, 0, 0, 7); c.fill();
 const hip = [f.x, gy - (th + sh) * .96 - bob];
 const pt = (o, l, a) => [o[0] + l * Math.sin(a * R * d), o[1] + l * Math.cos(a * R)];
 const limb = (o, l1, a1, l2, a2, w, col, ec, ty) => {
  const k = pt(o, l1, a1), e = pt(k, l2, a2);
  c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(o[0], o[1]); c.lineTo(k[0], k[1]); c.lineTo(e[0], e[1]); c.stroke();
  c.fillStyle = ec; c.beginPath();
  if (ty == 'f') c.ellipse(e[0] + d * 5 * S, e[1], 11 * S, 5 * S, 0, 0, 7); else c.arc(e[0], e[1], 7 * S, 0, 7);
  c.fill();
 };
 const ux = Math.sin(Q[0] * R * d), uy = -Math.cos(Q[0] * R);
 const nk = [hip[0] + T * ux, hip[1] + T * uy], shd = [hip[0] + T * .9 * ux, hip[1] + T * .9 * uy];
 limb(hip, th, Q[7], sh, Q[8], 15 * S, dk(ch.pants), '#111', 'f');
 limb(shd, ua, Q[3], fa, Q[4], 11 * S, dk(ch.skin), dk(ch.skin), 'h');
 c.strokeStyle = ch.top || ch.skin; c.lineWidth = 27 * S; c.beginPath(); c.moveTo(hip[0], hip[1]); c.lineTo(nk[0], nk[1]); c.stroke();
 c.strokeStyle = ch.pants; c.lineWidth = 28 * S; c.beginPath(); c.moveTo(hip[0], hip[1]); c.lineTo(hip[0] + T * .3 * ux, hip[1] + T * .3 * uy); c.stroke();
 const hc = [nk[0] + 14 * S * ux, nk[1] + 14 * S * uy], r = 14 * S;
 c.fillStyle = ch.hair;
 if (ch.st == 'long') { c.beginPath(); c.ellipse(hc[0] - d * 8 * S, hc[1] + 6 * S, 13 * S, 20 * S, 0, 0, 7); c.fill() }
 if (ch.st == 'pony') { c.strokeStyle = ch.hair; c.lineWidth = 6 * S; c.beginPath(); c.moveTo(hc[0] - d * 10 * S, hc[1] - 4 * S); c.lineTo(hc[0] - d * 28 * S, hc[1] + 12 * S); c.stroke() }
 c.fillStyle = ch.skin; c.beginPath(); c.arc(hc[0], hc[1], r, 0, 7); c.fill();
 c.fillStyle = ch.hair;
 if (ch.beard) { c.beginPath(); c.ellipse(hc[0] + d * 3 * S, hc[1] + r * .7, r * .75, r * .5, 0, 0, 7); c.fill() }
 if (ch.st == 'mask') { c.fillStyle = '#111'; c.beginPath(); c.arc(hc[0], hc[1], r + .5 * S, 0, Math.PI); c.fill() }
 c.fillStyle = ch.hair;
 if (ch.st == 'turban') { c.beginPath(); c.ellipse(hc[0], hc[1] - 6 * S, r * 1.2, r * 1.05, 0, 0, 7); c.fill(); c.strokeStyle = '#fff3'; c.lineWidth = 2 * S; c.beginPath(); c.moveTo(hc[0] - r, hc[1] - 4 * S); c.lineTo(hc[0] + r, hc[1] - 12 * S); c.stroke() }
 else if (ch.st != 'bald') { c.beginPath(); c.arc(hc[0], hc[1], r + S, Math.PI * 1.05, Math.PI * 1.95); c.fill() }
 if (ch.st == 'band') { c.strokeStyle = '#e11d48'; c.lineWidth = 4 * S; c.beginPath(); c.moveTo(hc[0] - r, hc[1] - 6 * S); c.lineTo(hc[0] + r, hc[1] - 6 * S); c.moveTo(hc[0] - d * r, hc[1] - 6 * S); c.lineTo(hc[0] - d * (r + 15 * S), hc[1] + 2 * S); c.stroke() }
 c.fillStyle = '#fff'; c.beginPath(); c.arc(hc[0] + d * 6 * S, hc[1] - 2 * S, 3 * S, 0, 7); c.fill();
 c.fillStyle = '#000'; c.beginPath(); c.arc(hc[0] + d * 7 * S, hc[1] - 2 * S, 1.5 * S, 0, 7); c.fill();
 limb(hip, th, Q[5], sh, Q[6], 16 * S, ch.pants, '#111', 'f');
 limb(shd, ua, Q[1], fa, Q[2], 12 * S, ch.skin, ch.skin, 'h');
 c.restore();
}
// Desi akhara background: sunset, mandir, flags, diyas
const BG = document.createElement('canvas'); BG.width = W; BG.height = 420;
(function () {
 const c = BG.getContext('2d'), g = c.createLinearGradient(0, 0, 0, GY); g.addColorStop(0, '#2b0f4a'); g.addColorStop(.6, '#ff6b3d'); g.addColorStop(1, '#ffd27a');
 c.fillStyle = g; c.fillRect(0, 0, W, 420);
 c.fillStyle = '#ffeab0'; c.beginPath(); c.arc(450, 250, 80, 0, 7); c.fill();
 c.fillStyle = '#5a1f55'; c.beginPath(); c.moveTo(0, GY); c.lineTo(120, 230); c.lineTo(260, 300); c.lineTo(420, 210); c.lineTo(600, 300); c.lineTo(760, 220); c.lineTo(W, 290); c.lineTo(W, GY); c.fill();
 c.fillStyle = '#2d0d3a';
 [[190, 1], [710, .8]].forEach(([x, s]) => { c.fillRect(x - 60 * s, GY - 70 * s, 120 * s, 70 * s); [[110, 50], [85, 36], [62, 24]].forEach(([w, h], i) => { c.beginPath(); c.moveTo(x - w * s / 2, GY - 70 * s - i * 34 * s); c.lineTo(x + w * s / 2, GY - 70 * s - i * 34 * s); c.lineTo(x + w * s / 3, GY - 70 * s - i * 34 * s - 34 * s); c.lineTo(x - w * s / 3, GY - 70 * s - i * 34 * s - 34 * s); c.fill() }); c.fillRect(x - 2, GY - 70 * s - 132 * s, 4, 26 * s) });
 for (let i = 0; i < 18; i++) { c.fillStyle = i % 2 ? '#ff8c1a' : '#e11d48'; c.beginPath(); c.moveTo(i * 52, 0); c.lineTo(i * 52 + 26, 0); c.lineTo(i * 52 + 13, 28); c.fill() }
 c.fillStyle = '#8a5230'; c.fillRect(0, GY, W, 60); c.fillStyle = '#6e3f22'; c.fillRect(0, GY, W, 5);
 c.fillStyle = 'rgba(255,255,255,.12)'; c.font = 'bold 54px Impact,sans-serif'; c.textAlign = 'center'; c.fillText('अखाड़ा', 450, 410);
 [60, 840].forEach(x => { c.fillStyle = '#ffd23f'; c.beginPath(); c.ellipse(x, GY - 8, 7, 12, 0, 0, 7); c.fill(); c.fillStyle = '#8a3b00'; c.fillRect(x - 10, GY - 2, 20, 6) });
})();

// ---------- Game state ----------
const cv = $('cv'), cx = cv.getContext('2d'), S = 1.25;
let scr = 'title', st = 'title', me = 0, p, e, sc = [0, 0], rn = 1, timer = 60, gt = 0, hs = 0, shake = 0, buf = null, last = 0, parts = [], K = {};
const mkF = (ch, x) => ({ ch, x, dir: 1, hp: ch.hp, tr: ch.hp, st: 'idle', t: 0, anim: 0, mv: '', hitDone: 0, stun: 0, cb: 0, lh: -9, ai: 0, mx: 0, w: null, stage: 0 });
function show(id) { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id == id)); scr = id }

// Select screen
const grid = $('grid');
C.forEach((ch, i) => {
 const d = document.createElement('div'); d.className = 'cd'; d.innerHTML = '<canvas width="100" height="140"></canvas><small>' + ch.n + '</small>';
 const c = d.firstChild.getContext('2d'); c.fillStyle = '#3a1a2a'; c.fillRect(0, 0, 100, 140); dr(c, { ch, x: 50, dir: 1, st: 'idle', anim: 0, t: 0 }, 132, .6);
 d.onclick = () => pick(i); grid.appendChild(d);
});
function pick(i) {
 me = i; const ch = C[i]; SFX.click();
 [...grid.children].forEach((g, k) => g.classList.toggle('sl', k == i));
 $('pn').textContent = ch.n + ' · ' + ch.en; $('pd').textContent = ch.d;
 const row = (l, v) => '<div class="st"><b>' + l + '</b><i><u style="width:' + v * 100 + '%"></u></i></div>';
 $('ps').innerHTML = row('HP', ch.hp / 130) + row('POWER', ch.pw / 1.2) + row('SPEED', ch.sp / 340);
}
pick(0);
$('go').onclick = () => { ac(); SFX.dhol(); show('select'); st = 'select'; last = performance.now(); requestAnimationFrame(loop) };
$('fgt').onclick = () => {
 ac(); SFX.dhol(); const o = C.filter((_, k) => k != me), en = o[Math.floor(Math.random() * o.length)];
 p = mkF(C[me], 200); e = mkF(en, 700);
 const v = (id, f) => { $(id).innerHTML = '<canvas width="220" height="300"></canvas><h3>' + f.ch.n + '<br>' + f.ch.en + '</h3>'; dr($(id).firstChild.getContext('2d'), { ch: f.ch, x: 110, dir: id == 'v1' ? 1 : -1, st: 'idle', anim: 0, t: 0 }, 290, 1.3) };
 v('v1', p); v('v2', e); show('vs'); st = 'vs';
 setTimeout(() => { show('game'); fight() }, 2200);
};
function pips() { [1, 2].forEach(n => { const w = sc[n - 1]; $('pp' + n).innerHTML = '<s class="' + (w > 0 ? 'w' : '') + '"></s><s class="' + (w > 1 ? 'w' : '') + '"></s>' }) }
function fight() { startBgm(); sc = [0, 0]; rn = 1; $('hn1').textContent = p.ch.n + ' ' + p.ch.en; $('hn2').textContent = e.ch.en + ' ' + e.ch.n; $('end').className = ''; newRound() }
function banner(t, ms) { const b = $('bn'); b.textContent = t; b.className = 'on'; setTimeout(() => b.className = '', ms) }
function newRound() {
 [p, e].forEach(f => { f.hp = f.tr = f.ch.hp; f.st = 'idle'; f.t = 0; f.cb = 0; f.mx = 0; f.w = null }); p.x = 250; e.x = 650; timer = 60; buf = null; pips();
 st = 'intro'; banner('ROUND ' + rn + '\nराउंड ' + rn, 1100); SFX.dhol();
 setTimeout(() => { banner('FIGHT!\nलड़ो!', 700); SFX.bell(); st = 'fight' }, 1300);
}
function koRound(w, l, txt) {
 if (st != 'fight') return; st = 'ko'; l.st = 'ko'; l.t = 0; SFX.ko(); sc[w === p ? 0 : 1]++; pips(); banner(txt, 1800);
 setTimeout(() => { if (sc[0] > 1 || sc[1] > 1) endMatch(); else { rn++; newRound() } }, 2400);
}
function endMatch() {
 st = 'over'; const win = sc[0] > 1, el = $('end'); el.className = 'on';
 el.innerHTML = '<h2>' + (win ? 'आप जीते! 🏆<br>YOU WIN' : 'आप हारे 💀<br>YOU LOSE') + '</h2><div><button class="btn" id="rm">दोबारा · REMATCH</button><button class="btn" id="cf">योद्धा बदलो · CHANGE</button></div>';
 $('rm').onclick = () => $('fgt').onclick(); $('cf').onclick = () => { show('select'); st = 'select' };
}
function spark(x, y, col, n) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, v = 150 + Math.random() * 250; parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, l: .35, c: col }) } }
function pop(x, t) { const d = document.createElement('div'); d.className = 'pop'; d.textContent = t; d.style.left = x / W * 100 + '%'; $('fx').appendChild(d); setTimeout(() => d.remove(), 800) }
function hit(a, d) {
 const m = MV[a.mv], dist = Math.abs(a.x - d.x); if (dist > m.rg || d.st == 'ko') return;
 const cxp = d.x - a.dir * 20, cyp = GY - 140;
 if (d.st == 'block') { d.x += a.dir * m.kb * .4; d.hp = Math.max(1, d.hp - m.dmg * .08); SFX.block(); spark(cxp, cyp, '#7dd3fc', 8); pop(d.x, 'BLOCK · रोका'); return }
 if (gt - a.lh < 1.2) a.cb++; else a.cb = 1; a.lh = gt;
 let dmg = m.dmg * a.ch.pw * (1 + (a.cb - 1) * .08) * (a === e ? .9 : 1);
 d.hp -= dmg; d.st = 'hit'; d.t = 0; d.stun = m.stun; d.x += a.dir * m.kb; SFX[m.sfx](); spark(cxp, cyp, '#ffd23f', 16);
 hs = .07; shake = m.kb > 30 ? 10 : 4; pop(d.x, a.cb > 1 ? a.cb + ' HIT COMBO!' : m.t);
 if (d.hp <= 0) { d.hp = 0; koRound(a, d, 'K.O.!\nखेल ख़त्म') }
}
function step(f, o, dt, mx, wants) {
 f.anim += dt; f.t += dt; f.dir = f.x < o.x ? 1 : -1;
 if (f.st == 'ko') return 0;
 if (f.st == 'atk') { const m = MV[f.mv]; if (!f.hitDone && f.t >= m.su) { f.hitDone = 1; hit(f, o) } if (f.t >= m.dur) { f.st = 'idle'; f.t = 0 } }
 else if (f.st == 'hit') { if (f.t >= f.stun) { f.st = 'idle'; f.t = 0 } }
 if (f.st == 'idle' || f.st == 'walk' || f.st == 'block') {
  if (wants) { f.st = 'atk'; f.mv = wants; f.t = 0; f.hitDone = 0; SFX.swing(); return 1 }
  if (mx && mx == -f.dir) f.st = 'block'; else if (mx) { f.st = 'walk'; f.x += mx * f.ch.sp * dt } else f.st = 'idle';
 }
 return 0;
}
function aiIn(dt) {
 e.ai -= dt;
 if (e.ai <= 0) {
  const dist = Math.abs(e.x - p.x), r = Math.random(); e.ai = .18 + Math.random() * .3; e.mx = 0; e.w = null;
  if (p.st == 'atk' && dist < 140 && r < .4) { e.mx = -e.dir; e.ai = .45 }
  else if (dist > 115) e.mx = e.dir;
  else if (r < .6) e.w = ['lp', 'rp', 'lk', 'rk'][Math.floor(Math.random() * 4)];
  else if (r < .8) { e.mx = -e.dir; e.ai = .4 }
 }
 const w = e.w; e.w = null; return w;
}
function loop(ts) {
 let dt = Math.min((ts - last) / 1000, .05); last = ts;
 if (scr == 'select') { const c = $('pvc').getContext('2d'); c.clearRect(0, 0, 240, 320); c.fillStyle = '#3a1a2a'; c.fillRect(0, 0, 240, 320); dr(c, { ch: C[me], x: 120, dir: 1, st: 'idle', anim: ts / 1000, t: 0 }, 305, 1.4) }
 if (scr == 'game') {
  if (st == 'ko') dt *= .4; if (hs > 0) { hs -= dt; dt = 0 } gt += dt;
  if (st == 'fight') {
   const mx = (K.r ? 1 : 0) - (K.l ? 1 : 0); let w = null; if (buf && gt - buf.t < .25) w = buf.mv;
   if (step(p, e, dt, mx, w)) buf = null; step(e, p, dt, e.mx, aiIn(dt));
   timer -= dt; if (timer <= 0) { timer = 0; const w2 = p.hp >= e.hp ? p : e; koRound(w2, w2 === p ? e : p, 'TIME UP!\nसमय ख़त्म') }
  } else [p, e].forEach(f => { f.anim += dt; f.t += dt });
  [p, e].forEach(f => { f.x = Math.max(50, Math.min(W - 50, f.x)) });
  if (Math.abs(p.x - e.x) < 58) { const m = (p.x + e.x) / 2, s = p.x < e.x ? 1 : -1; p.x = m - s * 29; e.x = m + s * 29 }
  parts = parts.filter(q => (q.l -= dt) > 0); parts.forEach(q => { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 600 * dt });
  cx.save(); if (shake > .5) cx.translate((Math.random() - .5) * shake, (Math.random() - .5) * shake); shake *= .85;
  cx.drawImage(BG, 0, 0); dr(cx, e, GY, S); dr(cx, p, GY, S);
  parts.forEach(q => { cx.fillStyle = q.c; cx.fillRect(q.x, q.y, 5, 5) }); cx.restore();
  [[p, 1], [e, 2]].forEach(([f, n]) => { if (f.tr > f.hp) f.tr = Math.max(f.hp, f.tr - f.ch.hp * .4 * dt); $('b' + n).style.width = f.hp / f.ch.hp * 100 + '%'; $('t' + n).style.width = f.tr / f.ch.hp * 100 + '%' });
  $('tm').textContent = Math.ceil(timer);
 }
 requestAnimationFrame(loop);
}
// ---------- Controls ----------
const KM = { a: 'l', arrowleft: 'l', d: 'r', arrowright: 'r' }, AM = { u: 'lp', i: 'rp', j: 'lk', k: 'rk' };
const atk = m => { if (st == 'fight') buf = { mv: m, t: gt } };
addEventListener('keydown', ev => { const k = ev.key.toLowerCase(); if (KM[k]) { K[KM[k]] = 1; ev.preventDefault() } if (AM[k] && !ev.repeat) { ev.preventDefault(); atk(AM[k]) } if (k == 'm') { mute = !mute; if (BGM) BGM.muted = mute } });
addEventListener('keyup', ev => { const k = ev.key.toLowerCase(); if (KM[k]) K[KM[k]] = 0 });
addEventListener('blur', () => K = {});
document.querySelectorAll('.k').forEach(b => {
 const h = b.dataset.h, a = b.dataset.a;
 if (h) { b.addEventListener('pointerdown', ev => { ev.preventDefault(); ac(); K[h] = 1; b.classList.add('on') }); ['pointerup', 'pointerleave', 'pointercancel'].forEach(n => b.addEventListener(n, () => { K[h] = 0; b.classList.remove('on') })) }
 else b.addEventListener('pointerdown', ev => { ev.preventDefault(); ac(); atk(a) });
});
