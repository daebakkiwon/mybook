/* 내 사랑하는 책 — 성경·원어·사전·자료 앱 (웹/PWA·Electron 공통) */
'use strict';
const BUILD = '2026.10.21-1410';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const main = $('#main'), topEl = $('#top');
const IS_APP = location.protocol === 'app:';

/* ---------- 아이콘 ---------- */
const I = {
  book: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3"/><path d="M12 7v6M9.5 9.5h5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/>',
  dic: '<path d="M3.5 19 8 5l4.5 14"/><path d="M5.2 14h5.6"/><path d="M14.5 12.5c0-1.6 1.2-2.5 3-2.5s3 .9 3 2.6V19"/><path d="M20.5 15.2c-1 .1-6-.4-6 2 0 1.1.8 1.8 2.1 1.8 2.2 0 3.9-1.4 3.9-3.8"/>',
  lib: '<path d="M4 4h4v16H4zM10 4h4v16h-4z"/><path d="m16 5.2 3.8-1 3 14.6-3.8 1z"/>',
  more: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  prev: '<path d="M15 5l-7 7 7 7"/>', next: '<path d="M9 5l7 7-7 7"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  mark: '<path d="M6 3h12v18l-6-4.5L6 21z"/>',
  note: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  orig: '<path d="M5 5h3l8 14h3"/><path d="M5 19 10 11"/><path d="M14 5l-2.5 4"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>', share: '<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v7h14v-7"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  down: '<path d="M6 9l6 6 6-6"/>', panel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/>',
};
const ic = (n, s = '') => `<svg viewBox="0 0 24 24" aria-hidden="true" ${s}>${I[n]}</svg>`;

/* ---------- 저장 ---------- */
const KEY = 'mybook.v1';
const DEF = { pos: { b: 0, c: 1 }, ver: 'krv', par: [], fs: 19, lh: 1.8, theme: 'auto', marks: {}, plan: {}, hist: [], vn: true };
let S;
try { S = Object.assign({}, DEF, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = Object.assign({}, DEF); }
let saveT;
function save() { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('저장 공간이 부족해 저장하지 못했습니다'); } }, 150); }
function applyLook() {
  const r = document.documentElement;
  r.dataset.theme = S.theme; r.style.setProperty('--fs', S.fs + 'px'); r.style.setProperty('--lh', S.lh);
}
applyLook();

function toast(msg, ms = 2200) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), ms);
}

/* ---------- 자료 읽기 ---------- */
const CACHE = new Map();
function J(p) {
  if (CACHE.has(p)) return CACHE.get(p);
  const pr = fetch(dpath(p)).then(r => { if (!r.ok) throw new Error(p + ' ' + r.status); return r.json(); });
  CACHE.set(p, pr); pr.catch(() => CACHE.delete(p));
  return pr;
}
const dpath = p => 'data/' + p.replace(/\//g, '_');   // 자료는 data/ 한 폴더에 평평하게
let META, BK, VER = {}, LIB = {};

/* ---------- 성경 장절 표기 ---------- */
const ALIAS = { '아가서': 21, '애가': 24, '요한계시록': 65, '계시록': 65 };
let REF_RE, REF_RE_LOOSE, NAME2B = {};
function initRefs() {
  BK.forEach((b, i) => { NAME2B[b.ab] = i; NAME2B[b.name] = i; });
  for (const k in ALIAS) NAME2B[k] = ALIAS[k];
  const names = Object.keys(NAME2B).sort((a, b) => b.length - a.length).join('|');
  const tail = '\\s?(\\d{1,3})\\s?[:：]\\s?(\\d{1,3})(?:\\s?[-~]\\s?(\\d{1,3}))?((?:\\s?,\\s?\\d{1,3}(?:\\s?-\\s?\\d{1,3})?)*)';
  REF_RE = new RegExp(`(?<![가-힣A-Za-z])(${names})${tail}`, 'g');
  REF_RE_LOOSE = new RegExp(`^\\s*(${names})\\s?(\\d{1,3})(?:\\s?[:：장]\\s?(\\d{1,3})(?:\\s?[-~]\\s?(\\d{1,3}))?)?`);
}
function vcount(b, c) { return BK[b] && BK[b].vc[c - 1] || 0; }
function refsFromMatch(m) {
  const b = NAME2B[m[1]], c = +m[2], v = +m[3];
  const out = [];
  if (b == null || !vcount(b, c) || v < 1 || v > vcount(b, c)) return out;
  out.push({ b, c, v, e: Math.min(m[4] ? +m[4] : v, vcount(b, c)) });
  if (m[5]) for (const p of m[5].split(',').map(s => s.trim()).filter(Boolean)) {
    const [x, y] = p.split('-').map(Number);
    if (x >= 1 && x <= vcount(b, c)) out.push({ b, c, v: x, e: Math.min(y || x, vcount(b, c)) });
  }
  return out;
}
function parseRefs(text) {
  const out = []; REF_RE.lastIndex = 0; let m;
  while ((m = REF_RE.exec(text))) out.push(...refsFromMatch(m));
  return out;
}
function parseLoose(text) { // "창1", "창 1:3" 같이 장만 있어도
  const m = REF_RE_LOOSE.exec(text || ''); if (!m) return null;
  const b = NAME2B[m[1]], c = +m[2];
  if (b == null || !vcount(b, c)) return null;
  return { b, c, v: m[3] ? +m[3] : 0, e: m[4] ? +m[4] : (m[3] ? +m[3] : 0) };
}
const encR = rs => rs.map(r => [r.b, r.c, r.v, r.e].join('.')).join(';');
const decR = s => s.split(';').map(x => { const [b, c, v, e] = x.split('.').map(Number); return { b, c, v, e }; });
const refName = (r, short) => (short ? BK[r.b].ab : BK[r.b].name + ' ') + r.c + (r.v ? ':' + r.v + (r.e && r.e !== r.v ? '-' + r.e : '') : (short ? '' : '장'));
/** 이미 esc 된 글에 성구 링크를 단다 */
function linkify(html) {
  REF_RE.lastIndex = 0;
  return html.replace(REF_RE, (...a) => {
    const rs = refsFromMatch(a); return rs.length ? `<a class="ref" data-r="${encR(rs)}">${a[0]}</a>` : a[0];
  });
}

/* ---------- 화면 틀 ---------- */
const TABS = [['r', '성경', 'book'], ['s', '검색', 'search'], ['d', '사전', 'dic'], ['l', '자료', 'lib'], ['m', '더보기', 'more']];
function buildNav() {
  const html = TABS.map(([k, t, i]) => `<a href="#/${k}" data-k="${k}">${ic(i)}<span>${t}</span></a>`).join('');
  $('#tabs').innerHTML = html;
  $('#side').innerHTML = `<div class="logo"><img src="icons/icon-192.png" alt=""></div>` + html;
}
function setNav(k) { $$('#tabs a,#side a').forEach(a => a.classList.toggle('on', a.dataset.k === k)); }
function setTop(html) { topEl.innerHTML = html; }
const back = () => `<button class="ib" onclick="history.length>1?history.back():go('#/m')" aria-label="뒤로">${ic('prev')}</button>`;

/* ---------- 라우터 ---------- */
function go(h) { if (location.hash === h) route(); else location.hash = h; }
function parseHash() {
  const [p, q] = location.hash.replace(/^#\/?/, '').split('?');
  return { parts: p.split('/').filter(Boolean).map(decodeURIComponent), q: new URLSearchParams(q || '') };
}
let CUR = '';
async function route() {
  const { parts, q } = parseHash();
  const k = parts[0] || 'r';
  if (CUR !== 'r' || k !== 'r') clearSel();
  CUR = k; setNav(['r', 's', 'd', 'l'].includes(k) ? k : (k === 'h' ? 'l' : 'm'));
  if (!wide()) closePanel();
  try {
    if (k === 'r') {
      const b = parts[1] ? +parts[1] - 1 : S.pos.b, c = parts[2] ? +parts[2] : S.pos.c;
      await viewRead(BK[b] ? b : 0, c, parts[3] ? +parts[3] : 0);
    } else if (k === 's') await viewSearch(q);
    else if (k === 'd' || k === 'l' || k === 'h') {
      if (parts[1] === 'sh' || parts[1] === 'sg') await (parts[2] ? viewStrongPage(parts[1][1], +parts[2]) : viewStrongList(parts[1][1], q));
      else if (k === 'h' && !parts[1]) await viewLibList('hymn', q);
      else if (k === 'h') await viewLibEntry('hymn', +parts[1]);
      else if (!parts[1]) viewLibHome(k);
      else if (parts[2] != null) await viewLibEntry(parts[1], +parts[2]);
      else await viewLibList(parts[1], q);
    } else if (k === 'm') viewMore();
    else if (k === 'plan') await viewPlan();
    else if (k === 'subj') await viewSubj(q);
    else if (k === 'notes') viewNotes(q);
    else if (k === 'set') viewSettings();
    else if (k === 'about') viewAbout();
    else go('#/r');
  } catch (e) {
    console.error(e);
    main.innerHTML = `<div class="wrap"><div class="card"><b>자료를 불러오지 못했습니다.</b><p class="muted small">${esc(e.message)}</p><p class="small">인터넷 연결을 확인한 뒤 다시 시도해 주세요.</p><button class="btn pri" onclick="route()">다시 시도</button></div></div>`;
  }
}
const wide = () => matchMedia('(min-width:1000px)').matches;
const loadingHTML = (t = '불러오는 중…') => `<div class="loading"><span class="spin"></span> ${t}</div>`;

/* ---------- 성경 읽기 ---------- */
function verOK(id, b) { const v = VER[id]; return v && !(v.ot && b > 38) && !(v.nt && b < 39); }
function activeVers(b) {
  let list = [S.ver, ...S.par].filter((x, i, a) => VER[x] && a.indexOf(x) === i);
  const ok = list.filter(id => verOK(id, b));
  if (!ok.length) ok.push('krv');
  return ok;
}
function fmtText(id, s, hl) {
  const v = VER[id];
  if (v.orig) {
    const tag = v.id === 'heb' ? 'H' : 'G';
    return s.split(' ').map(t => {
      const i = t.lastIndexOf('|');
      if (i < 0) return esc(t);
      const n = t.slice(i + 1), w = t.slice(0, i);
      return `<span class="w${hl && hl === tag + n ? ' on' : ''}" data-s="${tag}${n}">${esc(w)}</span>`;
    }).join(' ');
  }
  let h = esc(s);
  if (id === 'kjv' || id === 'webster') h = h.replace(/\[([^\]]+)\]/g, '<i>$1</i>');
  return h;
}
const langCls = id => ({ he: 'heb', el: 'grk', en: 'en' }[VER[id].lang] || '');
const mkey = (b, c, v) => b + ':' + c + ':' + v;
let SEL = new Set(), RD = null;   // RD: 지금 읽는 장 {b,c,vers,data}

async function viewRead(b, c, flashV) {
  c = Math.max(1, Math.min(c, BK[b].vc.length));
  const vers = activeVers(b);
  setTop(`<button class="pick" id="bcPick">${esc(BK[b].name)} ${c}<small>장</small>${ic('down', 'style="width:16px;height:16px"')}</button>
    <button class="pick ver" id="vPick">${esc(VER[vers[0]].short)}${vers.length > 1 ? ' <small>+' + (vers.length - 1) + '</small>' : ''}</button>
    <span class="grow"></span>
    <button class="ib" id="pv" aria-label="이전 장">${ic('prev')}</button><button class="ib" id="nx" aria-label="다음 장">${ic('next')}</button>`);
  $('#bcPick').onclick = () => bookPicker(b, c);
  $('#vPick').onclick = verPicker;
  $('#pv').onclick = () => step(-1); $('#nx').onclick = () => step(1);
  if (!RD || !vers.every(id => CACHE.has('bible/' + id + '.json'))) main.innerHTML = loadingHTML('성경 본문을 불러오는 중…');
  const data = await Promise.all(vers.map(id => J('bible/' + id + '.json')));
  RD = { b, c, vers, data };
  S.pos = { b, c }; addHist(b, c); save();
  const n = BK[b].vc[c - 1];
  const par = vers.length > 1;
  let h = `<div class="chap" id="chap"><h2>${esc(BK[b].name)} ${c}장</h2>`;
  if (vers.some(id => !verOK(id, b))) h += `<div class="vpara-note">일부 역본은 이 책에 없습니다</div>`;
  for (let v = 1; v <= n; v++) {
    const m = S.marks[mkey(b, c, v)] || {};
    const cls = 'v' + (par ? ' par' : '') + (m.h ? ' h' + m.h : '') + (SEL.has(v) ? ' sel' : '');
    const marks = (m.bm ? '<span class="mk" title="책갈피">🔖</span>' : '') + (m.note ? '<span class="mk" title="메모">📝</span>' : '');
    h += `<div class="${cls}" data-v="${v}" id="v${v}"><span class="vn">${S.vn ? v : ''}</span>`;
    if (!par) {
      const id = vers[0], t = (data[0][b][c - 1] || [])[v - 1] || '';
      h += `<span class="t ${langCls(id)}">${fmtText(id, t)}</span>${marks}`;
    } else {
      vers.forEach((id, i) => {
        const t = (data[i][b][c - 1] || [])[v - 1] || '';
        h += `<div class="pl"><span class="vl">${esc(VER[id].short)}</span><span class="t ${langCls(id)}">${fmtText(id, t)}</span>${i === 0 ? marks : ''}</div>`;
      });
    }
    h += `</div>`;
  }
  h += `</div><div class="nav2"><button class="btn" onclick="step(-1)">${ic('prev')} 이전 장</button><button class="btn" onclick="step(1)">다음 장 ${ic('next')}</button></div>`;
  main.innerHTML = h;
  if (flashV) {
    const el = $('#v' + flashV);
    if (el) { el.scrollIntoView({ block: 'center' }); el.classList.add('flash'); }
  } else if (readScroll.key === b + ':' + c) window.scrollTo(0, readScroll.y);
  else window.scrollTo(0, 0);
  updSel();
}
let readScroll = { key: '', y: 0 };
addEventListener('scroll', () => { if (CUR === 'r' && RD) readScroll = { key: RD.b + ':' + RD.c, y: scrollY }; }, { passive: true });
function step(d) {
  if (!RD) return;
  let { b, c } = RD; c += d;
  if (c < 1) { if (b === 0) return toast('성경의 처음입니다'); b--; c = BK[b].vc.length; }
  else if (c > BK[b].vc.length) { if (b === 65) return toast('성경의 마지막입니다'); b++; c = 1; }
  clearSel(); go(`#/r/${b + 1}/${c}`);
}
function addHist(b, c) {
  const k = b + ':' + c;
  S.hist = [k, ...S.hist.filter(x => x !== k)].slice(0, 30);
}
// 절 누르기
main.addEventListener('click', e => {
  const r = e.target.closest('a.ref[data-r]');
  if (r) { e.preventDefault(); showRefs(decR(r.dataset.r)); return; }
  const w = e.target.closest('.w[data-s]');
  if (w && CUR === 'r') { e.stopPropagation(); openStrong(w.dataset.s[0].toLowerCase(), +w.dataset.s.slice(1)); return; }
  const v = e.target.closest('.v[data-v]');
  if (v && CUR === 'r') {
    const n = +v.dataset.v;
    if (getSelection && String(getSelection()).length > 1) return;
    SEL.has(n) ? SEL.delete(n) : SEL.add(n);
    v.classList.toggle('sel', SEL.has(n)); updSel();
    if (wide() && !$('#panel').hidden && SEL.has(n) && PSTACK.length && PSTACK[PSTACK.length - 1].follow) verseTools(RD.b, RD.c, n, true);
  }
});
// 휴대폰: 좌우로 밀어 장 넘기기
let tx0 = null;
main.addEventListener('touchstart', e => { if (CUR === 'r' && e.touches.length === 1) tx0 = [e.touches[0].clientX, e.touches[0].clientY, Date.now()]; }, { passive: true });
main.addEventListener('touchend', e => {
  if (!tx0) return; const t = e.changedTouches[0]; const dx = t.clientX - tx0[0], dy = t.clientY - tx0[1], dt = Date.now() - tx0[2]; tx0 = null;
  if (Math.abs(dx) > 90 && Math.abs(dy) < 45 && dt < 600) step(dx < 0 ? 1 : -1);
}, { passive: true });
addEventListener('keydown', e => {
  if (e.target.closest('input,textarea,select')) return;
  if (e.key === 'Escape') { if ($('.picker')) $('.picker').remove(); else if (!$('#panel').hidden) closePanel(); else clearSel(); }
  if (CUR === 'r' && !e.metaKey && !e.ctrlKey && !$('.picker')) {
    if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1);
  }
  if ((e.metaKey || e.ctrlKey) && e.key === 'f') { e.preventDefault(); go('#/s'); }
});

/* ---------- 선택 막대 ---------- */
function clearSel() { SEL.clear(); $$('.v.sel').forEach(x => x.classList.remove('sel')); updSel(); }
function selRefs() { return [...SEL].sort((a, b) => a - b); }
function updSel() {
  const bar = $('#selbar');
  if (!SEL.size || CUR !== 'r') { bar.hidden = true; return; }
  const vs = selRefs();
  bar.innerHTML = `<span class="cnt">${esc(BK[RD.b].ab)}${RD.c}:${vs.length > 3 ? vs[0] + '…' + vs[vs.length - 1] : vs.join(',')}</span>
   <button data-a="copy">${ic('copy')}복사</button>
   <button data-a="bm">${ic('mark')}책갈피</button><button data-a="note">${ic('note')}메모</button>
   <button data-a="xref">${ic('link')}관주</button><button data-a="orig">${ic('orig')}원어</button>
   ${navigator.share ? `<button data-a="share">${ic('share')}보내기</button>` : ''}
   <button data-a="x">${ic('x')}닫기</button>
   <span class="sep"></span>
   <span class="hls">${['y', 'g', 'b', 'p'].map(c => `<button data-a="h${c}" aria-label="형광펜 칠하기"><span class="dot" style="background:var(--hl-${c})"></span><span class="lb">칠하기</span></button>`).join('')}
   <button data-a="h0" aria-label="형광펜 지우기"><span class="dot" style="background:none;border-style:dashed"></span><span class="lb">지우기</span></button></span>`;
  bar.hidden = false;
}
$('#selbar').addEventListener('click', e => {
  const a = e.target.closest('button')?.dataset.a; if (!a || !RD) return;
  const vs = selRefs(), { b, c } = RD;
  if (a === 'copy' || a === 'share') {
    const txt = selText(b, c, vs);
    if (a === 'share') navigator.share({ text: txt }).catch(() => { });
    else copyText(txt);
    if (a === 'copy') clearSel();
  } else if (a[0] === 'h' && a.length === 2) {
    vs.forEach(v => setMark(b, c, v, { h: a[1] === '0' ? undefined : a[1] }));
    clearSel(); rerender();
  } else if (a === 'bm') {
    const on = !vs.every(v => (S.marks[mkey(b, c, v)] || {}).bm);
    vs.forEach(v => setMark(b, c, v, { bm: on ? 1 : undefined }));
    toast(on ? '책갈피를 달았습니다' : '책갈피를 뗐습니다'); clearSel(); rerender();
  } else if (a === 'note') noteEditor(b, c, vs[0]);
  else if (a === 'xref' || a === 'orig') verseTools(b, c, vs[vs.length - 1], false, a);
  else if (a === 'x') clearSel();
});
function selText(b, c, vs) {
  const out = [];
  RD.vers.forEach((id, i) => {
    if (!verOK(id, b)) return;
    const lines = vs.map(v => v + ' ' + plain(id, (RD.data[i][b][c - 1] || [])[v - 1] || ''));
    out.push(`${BK[b].name} ${c}:${rangeStr(vs)} (${VER[id].short})\n${lines.join('\n')}`);
  });
  return out.join('\n\n');
}
const plain = (id, s) => VER[id].orig ? s.split(' ').map(t => t.split('|')[0]).join(' ') : s;
function rangeStr(vs) {
  const out = []; let s = vs[0], p = vs[0];
  for (const v of vs.slice(1).concat([null])) { if (v === p + 1) { p = v; continue; } out.push(s === p ? s : s + '-' + p); s = p = v; }
  return out.join(',');
}
async function copyText(t) {
  try { await navigator.clipboard.writeText(t); toast('복사했습니다'); }
  catch (e) { const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast('복사했습니다'); }
}
function setMark(b, c, v, patch) {
  const k = mkey(b, c, v); const m = Object.assign({}, S.marks[k], patch);
  for (const x in m) if (m[x] === undefined || m[x] === '') delete m[x];
  delete m.t;
  if (Object.keys(m).length) S.marks[k] = Object.assign(m, { t: Date.now() }); else delete S.marks[k];
  save();
}
function rerender() { if (CUR === 'r' && RD) { const y = scrollY; viewRead(RD.b, RD.c).then(() => scrollTo(0, y)); } }

/* ---------- 보조 창 ---------- */
let PSTACK = [];
function openPanel(title, render, opts = {}) {
  if (!opts.push) PSTACK = [];
  PSTACK.push({ title, render, follow: !!opts.follow });
  drawPanel();
}
async function drawPanel() {
  const p = $('#panel'), top_ = PSTACK[PSTACK.length - 1];
  if (!top_) return closePanel();
  p.hidden = false; document.body.classList.add('haspanel');
  $('#ov').hidden = wide();
  $('#pTitle').textContent = top_.title;
  $('#pBack').hidden = PSTACK.length < 2;
  const body = $('#pBody'); body.innerHTML = loadingHTML(); body.scrollTop = 0;
  try { await top_.render(body); } catch (e) { console.error(e); body.innerHTML = `<p class="muted">불러오지 못했습니다: ${esc(e.message)}</p>`; }
}
function closePanel() { $('#panel').hidden = true; $('#ov').hidden = true; PSTACK = []; document.body.classList.remove('haspanel'); }
$('#pClose').onclick = closePanel; $('#ov').onclick = closePanel;
$('#pBack').onclick = () => { PSTACK.pop(); drawPanel(); };
$('#pBody').addEventListener('click', e => {
  const r = e.target.closest('a.ref[data-r]'); if (r) { e.preventDefault(); showRefs(decR(r.dataset.r), true); return; }
  const s = e.target.closest('[data-s]'); if (s) { openStrong(s.dataset.s[0].toLowerCase(), +s.dataset.s.slice(1), true); return; }
  const g = e.target.closest('[data-go]'); if (g) { const r2 = decR(g.dataset.go)[0]; if (!wide()) closePanel(); goRef(r2); }
});
function goRef(r) { clearSel(); go(`#/r/${r.b + 1}/${r.c}${r.v ? '/' + r.v : ''}`); }
function readVer() { return VER[S.ver] && !VER[S.ver].orig ? S.ver : 'krv'; }
async function verseHTML(r, id = readVer()) {
  const d = await J('bible/' + id + '.json');
  const ch = d[r.b] && d[r.b][r.c - 1] || [];
  const e = r.e || r.v;
  const out = [];
  for (let v = r.v || 1; v <= (r.v ? e : ch.length); v++) out.push(`${r.v && e === r.v ? '' : `<b>${v}</b>`}${esc(plain(id, ch[v - 1] || ''))}`);
  return out.join(' ');
}
async function showRefs(rs, push) {
  openPanel(rs.length === 1 ? refName(rs[0]) : '성구 ' + rs.length + '곳', async body => {
    const parts = await Promise.all(rs.map(async r => `<div class="xr" data-go="${encR([r])}"><b>${esc(refName(r, true))}</b><span class="tx">${await verseHTML(r)}</span></div>`));
    body.innerHTML = parts.join('') + `<p class="muted small">성구를 누르면 그 자리로 갑니다 · ${esc(VER[readVer()].short)}</p>`;
  }, { push });
}

/* 관주·원어·메모를 한 창에 */
function verseTools(b, c, v, keep, focus) {
  const title = `${BK[b].name} ${c}:${v}`;
  const render = async body => {
    const hasOrig = b < 39 ? 'heb' : 'grk';
    const [txt, xr, od] = await Promise.all([verseHTML({ b, c, v, e: v }), J('xref/' + b + '.json').catch(() => ({})), J('bible/' + hasOrig + '.json')]);
    let h = `<div class="xr" style="cursor:default"><span class="tx">${txt}</span></div>`;
    const raw = (od[b][c - 1] || [])[v - 1] || '';
    const toks = raw.split(' ').filter(Boolean).map(t => { const i = t.lastIndexOf('|'); return i < 0 ? [t, 0] : [t.slice(0, i), +t.slice(i + 1)]; });
    const tag = b < 39 ? 'h' : 'g';
    const gl = await glosses(tag, toks.map(t => t[1]).filter(Boolean));
    h += `<h2 class="sec" id="tOrig" style="margin-top:14px">원어 · ${b < 39 ? '히브리어' : '헬라어'} <span class="small muted">(단어를 누르면 스트롱 사전)</span></h2>
      <div class="tokrow ${b < 39 ? 'heb' : 'grk'}">${toks.map(([w, n]) => `<div class="tok" ${n ? `data-s="${tag.toUpperCase()}${n}"` : ''}><span class="tw">${esc(w)}</span>${n ? `<span class="tn">${tag.toUpperCase()}${n}</span><span class="tm">${esc(gl[n] || '')}</span>` : ''}</div>`).join('')}</div>`;
    let x = xr[c + ':' + v];
    h += `<h2 class="sec" id="tXref">관주</h2>`;
    if (x) {
      let sub = ''; if (Array.isArray(x)) { sub = x[1]; x = x[0]; }
      const rs = parseRefs(x);
      if (sub) h += `<p class="small"><b>${esc(sub)}</b></p>`;
      const vs = await Promise.all(rs.slice(0, 80).map(async r => `<div class="xr" data-go="${encR([r])}"><b>${esc(refName(r, true))}</b><span class="tx">${await verseHTML(r)}</span></div>`));
      h += vs.join('') + (rs.length > 80 ? `<p class="muted small">외 ${rs.length - 80}곳</p>` : '');
    } else h += `<p class="muted small">이 절에는 관주가 없습니다.</p>`;
    const m = S.marks[mkey(b, c, v)];
    h += `<h2 class="sec">메모</h2>${m && m.note ? `<div class="card" style="white-space:pre-wrap">${linkify(esc(m.note))}</div>` : ''}<button class="btn" id="tNote">${ic('note')} ${m && m.note ? '메모 고치기' : '메모 쓰기'}</button>`;
    body.innerHTML = h;
    $('#tNote', body).onclick = () => noteEditor(b, c, v, true);
    if (focus === 'xref') $('#tXref', body).scrollIntoView();
  };
  openPanel(title, render, { follow: true });
}
async function glosses(tag, nums) {
  const ks = [...new Set(nums.map(n => Math.floor(n / 1000)))];
  const parts = await Promise.all(ks.map(k => J(`strong/${tag}${k}.json`).catch(() => ({}))));
  const all = Object.assign({}, ...parts), out = {};
  for (const n of nums) { const e = all[n]; if (e) out[n] = gloss(e); }
  return out;
}
function gloss(e) {
  const t = e[2] || '';
  // 헬라어: "…>품사. english; 한글 뜻, …" 의 한글 뜻
  const g = />[가-힣]{1,3}\.\s*[^;<>]{1,80};\s*([^\n]+)/.exec(t);
  if (g) {
    const w = g[1].replace(/\([^)]*\)|【[^】]*】|<[^>]*>/g, '').split(/[,;]/).map(x => x.trim()).find(x => x && x !== '불변화' && /[가-힣]/.test(x));
    if (w) return w.slice(0, 16);
  }
  const m = /[‘'"“]([^’'"”]{1,18})[’'"”]/.exec(t);
  return m ? m[1] : (e[1] || '');
}
function noteEditor(b, c, v, push) {
  const k = mkey(b, c, v);
  openPanel(`메모 — ${BK[b].ab} ${c}:${v}`, async body => {
    body.innerHTML = `<p class="small muted">${await verseHTML({ b, c, v, e: v })}</p>
      <textarea id="nt" placeholder="묵상, 설교 아이디어, 기도 제목…">${esc((S.marks[k] || {}).note || '')}</textarea>
      <div class="row" style="margin-top:10px"><button class="btn pri" id="ns">저장</button><button class="btn" id="nd">지우기</button></div>`;
    const ta = $('#nt', body); setTimeout(() => ta.focus(), 50);
    $('#ns', body).onclick = () => { setMark(b, c, v, { note: ta.value.trim() || undefined }); toast('메모를 저장했습니다'); closePanel(); clearSel(); rerender(); };
    $('#nd', body).onclick = () => { setMark(b, c, v, { note: undefined }); closePanel(); rerender(); };
  }, { push });
}

/* ---------- 스트롱 사전 ---------- */
async function strong(tag, n) { const d = await J(`strong/${tag}${Math.floor(n / 1000)}.json`); return d[n]; }
function strongBody(tag, n, e) {
  if (!e) return `<p class="muted">사전에 ${tag.toUpperCase()}${n} 항목이 없습니다.</p>`;
  const T = tag.toUpperCase();
  let ko = linkify(esc(e[2]));
  ko = ko.replace(/(?<![\d:.\-])(\d{1,4})(?=(?:\)|와|과|의|에서|을|를|\s?참조|\s?비교))/g, `<a class="ref" data-s="${T}$1">$1</a>`);
  return `<div class="strong"><h3 class="${tag === 'h' ? 'heb' : 'grk'}">${esc(e[0])}</h3>
    <div class="meta">${T}${n} · ${esc(e[1] || '')} · ${tag === 'h' ? '히브리어' : '헬라어'}</div>
    <div class="ko">${ko}</div>
    <details ${wide() ? 'open' : ''}><summary>영어 해설 (Strong·TWOT/TDNT)</summary><pre>${esc(e[3])}</pre></details>
    <div class="row" style="margin-top:14px"><button class="btn" data-find="${T}${n}">${ic('search')} 성경에서 이 단어 찾기</button></div></div>`;
}
function openStrong(tag, n, push) {
  openPanel(`스트롱 ${tag.toUpperCase()}${n}`, async body => {
    body.innerHTML = strongBody(tag, n, await strong(tag, n));
    const f = $('[data-find]', body); if (f) f.onclick = () => { if (!wide()) closePanel(); go('#/s?q=' + f.dataset.find); };
  }, { push });
}

/* ---------- 책·장 고르개, 역본 고르개 ---------- */
function picker(title, html) {
  $$('.picker').forEach(x => x.remove());
  const d = document.createElement('div'); d.className = 'picker';
  d.innerHTML = `<div class="ph"><button class="ib" data-x aria-label="닫기">${ic('x')}</button><h2>${title}</h2></div><div class="pb">${html}</div>`;
  document.body.appendChild(d); d.querySelector('[data-x]').onclick = () => d.remove();
  return d;
}
function bookPicker(cb, cc) {
  const nt = cb >= 39;
  const d = picker('성경 고르기', `<div class="row" style="justify-content:space-between;margin-bottom:12px"><div class="seg"><button data-t="0" class="${nt ? '' : 'on'}">구약 39</button><button data-t="1" class="${nt ? 'on' : ''}">신약 27</button></div>
     <span class="small muted">최근: ${S.hist.slice(1, 4).map(k => { const [b, c] = k.split(':').map(Number); return `<a href="#/r/${b + 1}/${c}" data-close>${BK[b].ab}${c}</a>`; }).join(' · ')}</span></div>
     <div class="bgrid" id="bg"></div><h2 class="sec" id="chT"></h2><div class="cgrid" id="cg"></div>`);
  const drawB = t => {
    $('#bg', d).innerHTML = BK.map((b, i) => (t ? i >= 39 : i < 39) ? `<button data-b="${i}" class="${i === cb ? 'on' : ''}"><b>${esc(b.ab)}</b><span>${esc(b.name)}</span></button>` : '').join('');
    $$('.seg button', d).forEach(x => x.classList.toggle('on', +x.dataset.t === t));
  };
  const drawC = b => {
    $('#chT', d).textContent = BK[b].name + ' — 장 고르기';
    $('#cg', d).innerHTML = BK[b].vc.map((_, i) => `<button data-c="${i + 1}" class="${b === cb && i + 1 === cc ? 'on' : ''}">${i + 1}</button>`).join('');
    $$('#bg button', d).forEach(x => x.classList.toggle('on', +x.dataset.b === b));
    d.dataset.b = b;
  };
  drawB(nt ? 1 : 0); drawC(cb);
  d.addEventListener('click', e => {
    const t = e.target.closest('[data-t]'); if (t) return drawB(+t.dataset.t);
    const b = e.target.closest('[data-b]'); if (b) { drawC(+b.dataset.b); if (BK[+b.dataset.b].vc.length === 1) { d.remove(); go(`#/r/${+b.dataset.b + 1}/1`); } else $('#chT', d).scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    const c = e.target.closest('[data-c]'); if (c) { d.remove(); clearSel(); go(`#/r/${+d.dataset.b + 1}/${c.dataset.c}`); }
    if (e.target.closest('[data-close]')) d.remove();
  });
}
function verPicker() {
  const vs = META.versions;
  const row = (v, type) => `<label><input type="${type}" name="${type === 'radio' ? 'mv' : 'pv'}" value="${v.id}" ${type === 'radio' ? (S.ver === v.id ? 'checked' : '') : (S.par.includes(v.id) ? 'checked' : '')}><span class="t"><b>${esc(v.name)}</b><span>${esc(v.note)}</span></span></label>`;
  const d = picker('역본 고르기', `<h2 class="sec" style="margin-top:4px">본문 역본</h2><div class="list vlist">${vs.map(v => row(v, 'radio')).join('')}</div>
    <h2 class="sec">함께 볼 역본 (대조, 3개까지)</h2><div class="list vlist">${vs.map(v => row(v, 'checkbox')).join('')}</div>
    <div class="row" style="margin-top:16px"><button class="btn pri" id="vOk">적용</button><button class="btn" id="vNo">대조 끄기</button></div>`);
  d.addEventListener('change', e => {
    if (e.target.name === 'pv' && $$('input[name=pv]:checked', d).length > 3) { e.target.checked = false; toast('대조 역본은 3개까지 고를 수 있습니다'); }
  });
  $('#vOk', d).onclick = () => {
    S.ver = $('input[name=mv]:checked', d).value;
    S.par = $$('input[name=pv]:checked', d).map(x => x.value).filter(x => x !== S.ver);
    save(); d.remove(); route();
  };
  $('#vNo', d).onclick = () => { S.par = []; save(); d.remove(); route(); };
}

/* ---------- 검색 ---------- */
const bare = s => s.normalize('NFD').replace(/[̀-֑ͯ-ׇ]/g, '').toLowerCase().replace(/ς/g, 'σ');
async function viewSearch(q) {
  const qs = q.get('q') || '', vid = VER[q.get('v')] ? q.get('v') : (/^[HG]\d+$/i.test(qs) ? (qs[0].toUpperCase() === 'H' ? 'heb' : 'grk') : readVer());
  const sc = q.get('sc') || 'all', fb = q.has('b') ? +q.get('b') : -1;
  setTop(`<h1>성경 검색</h1>`);
  main.innerHTML = `<div class="wrap">
    <form class="sbox" id="sf"><input type="search" id="sq" value="${esc(qs)}" placeholder="낱말 (띄어 쓰면 모두 포함) · 스트롱 H430, G26" enterkeyhint="search" autocomplete="off"><button class="btn pri">찾기</button></form>
    <div class="row" style="margin-top:10px"><select id="sv" style="width:auto">${META.versions.map(v => `<option value="${v.id}" ${v.id === vid ? 'selected' : ''}>${esc(v.name)}</option>`).join('')}</select>
    <div class="seg" id="ssc">${[['all', '전체'], ['ot', '구약'], ['nt', '신약'], ['bk', '이 책']].map(([k, t]) => `<button type="button" data-k="${k}" class="${k === sc ? 'on' : ''}">${t}</button>`).join('')}</div></div>
    <div id="sr"></div></div>`;
  const submit = (extra = {}) => {
    const p = new URLSearchParams({ q: $('#sq').value.trim(), v: $('#sv').value, sc: $('.seg#ssc .on').dataset.k, ...extra });
    go('#/s?' + p);
  };
  $('#sf').onsubmit = e => { e.preventDefault(); submit(); };
  $('#ssc').onclick = e => { const b = e.target.closest('button'); if (!b) return; $$('#ssc button').forEach(x => x.classList.toggle('on', x === b)); if (qs) submit(); };
  $('#sv').onchange = () => { if (qs) submit(); };
  if (!qs) {
    $('#sr').innerHTML = `<div class="card small muted" style="line-height:1.8">· 여러 낱말을 띄어 쓰면 모두 들어간 절을 찾습니다.<br>· 따옴표로 묶으면 그대로 붙은 말을 찾습니다: <b>"하나님의 사랑"</b><br>· 원어 역본에서는 스트롱 번호로 찾습니다: <b>H430</b>(엘로힘), <b>G26</b>(아가페)<br>· 사전·예화·설교 자료는 아래 [사전]·[자료] 탭에서 찾습니다.</div>
      ${S.lastQ && S.lastQ.length ? `<h2 class="sec">최근 찾은 말</h2><div class="row">${S.lastQ.map(x => `<a class="chip" href="#/s?q=${encodeURIComponent(x)}">${esc(x)}</a>`).join('')}</div>` : ''}`;
    setTimeout(() => $('#sq').focus(), 30); return;
  }
  S.lastQ = [qs, ...(S.lastQ || []).filter(x => x !== qs)].slice(0, 12); save();
  $('#sr').innerHTML = loadingHTML('찾는 중…');
  const data = await J('bible/' + vid + '.json');
  const v = VER[vid];
  const terms = []; qs.replace(/"([^"]+)"|(\S+)/g, (_, a, b) => terms.push(a || b));
  const strongQ = v.orig && terms.length === 1 && /^[HG]?\d+$/i.test(terms[0]) ? terms[0].replace(/^[HG]/i, '') : null;
  const tl = terms.map(t => v.orig ? bare(t) : t.toLowerCase());
  const lo = v.lang === 'ko' ? (s => s) : (v.orig ? bare : (s => s.toLowerCase()));
  const res = []; const cnt = {};
  const b0 = sc === 'nt' ? 39 : (sc === 'bk' ? S.pos.b : 0), b1 = sc === 'ot' ? 38 : (sc === 'bk' ? S.pos.b : 65);
  for (let b = b0; b <= b1; b++) {
    const bk = data[b] || [];
    for (let c = 0; c < bk.length; c++) for (let i = 0; i < bk[c].length; i++) {
      const t = bk[c][i];
      let ok;
      if (strongQ) ok = (' ' + t + ' ').includes('|' + strongQ + ' ');
      else { const s = lo(v.orig ? plain(vid, t) : t); ok = tl.every(x => s.includes(x)); }
      if (ok) { res.push([b, c + 1, i + 1]); cnt[b] = (cnt[b] || 0) + 1; }
    }
  }
  const shown = fb >= 0 ? res.filter(r => r[0] === fb) : res;
  const hlRe = !strongQ && terms.length ? new RegExp('(' + terms.map(t => esc(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', v.lang === 'ko' ? 'g' : 'gi') : null;
  let h = `<div class="cnt-bar"><span class="chip ${fb < 0 ? 'on' : ''}" data-fb="-1">모두 <small>${res.length}</small></span>${Object.keys(cnt).map(b => `<span class="chip ${+b === fb ? 'on' : ''}" data-fb="${b}">${esc(BK[b].ab)} <small>${cnt[b]}</small></span>`).join('')}</div>`;
  if (!res.length) h += `<div class="empty">찾는 말이 들어간 절이 없습니다.</div>`;
  h += `<div class="list" id="rl"></div><div style="text-align:center;margin:14px"><button class="btn" id="more" hidden>더 보기</button></div>`;
  $('#sr').innerHTML = h;
  let k = 0;
  const draw = () => {
    const part = shown.slice(k, k + 150); k += part.length;
    $('#rl').insertAdjacentHTML('beforeend', part.map(([b, c, vv]) => {
      let tx = fmtText(vid, data[b][c - 1][vv - 1], strongQ ? (vid === 'heb' ? 'H' : 'G') + strongQ : null);
      if (hlRe && !v.orig) tx = tx.replace(hlRe, '<mark>$1</mark>');
      return `<div class="res" data-go="${b}.${c}.${vv}"><b>${esc(BK[b].name)} ${c}:${vv}</b><div class="tx ${langCls(vid)}">${tx}</div></div>`;
    }).join(''));
    $('#more').hidden = k >= shown.length;
    if (!shown.length) $('#rl').hidden = true;
  };
  draw();
  $('#more').onclick = draw;
  $('#sr').onclick = e => {
    const c = e.target.closest('[data-fb]'); if (c) { const p = new URLSearchParams(location.hash.split('?')[1]); +c.dataset.fb < 0 ? p.delete('b') : p.set('b', c.dataset.fb); go('#/s?' + p); return; }
    const w = e.target.closest('.w[data-s]'); if (w) { openStrong(w.dataset.s[0].toLowerCase(), +w.dataset.s.slice(1)); return; }
    const g = e.target.closest('[data-go]'); if (g) { const [b, c2, vv] = g.dataset.go.split('.').map(Number); goRef({ b, c: c2, v: vv }); }
  };
}

/* ---------- 사전·자료 ---------- */
const KIND2TAB = { dic: 'd', doc: 'l', hymn: 'h' };
function libLink(lid, i) { const L = LIB[lid]; return i == null ? `#/${KIND2TAB[L.kind]}/${L.kind === 'hymn' ? '' : lid}` : (L.kind === 'hymn' ? `#/h/${i}` : `#/${KIND2TAB[L.kind]}/${lid}/${i}`); }
function viewLibHome(k) {
  const dic = k === 'd';
  setTop(`<h1>${dic ? '사전' : '자료실'}</h1>`);
  const items = META.libs.filter(l => dic ? l.kind === 'dic' : l.kind !== 'dic');
  const emoji = { bibdic: '📖', theo: '🎓', engdic: '🔤', yehwa: '💡', yehwa330: '🕯️', sermon: '📜', sermon2: '🗞️', hymn: '🎵' };
  let h = `<div class="wrap">`;
  if (dic) h += `<div class="list"><a class="li" href="#/d/sh"><span class="ico heb">א</span><span class="t"><b>스트롱 히브리어 사전</b><span>8,600여 낱말 · 한글 뜻 + 영어 해설</span></span><span class="n">${ic('next')}</span></a>
     <a class="li" href="#/d/sg"><span class="ico grk">Ω</span><span class="t"><b>스트롱 헬라어 사전</b><span>5,600여 낱말 · 한글 뜻 + 영어 해설</span></span><span class="n">${ic('next')}</span></a></div><h2 class="sec">낱말 사전</h2>`;
  h += `<div class="list">${items.map(l => `<a class="li" href="${libLink(l.id)}"><span class="ico">${emoji[l.id] || '📁'}</span><span class="t"><b>${esc(l.name)}</b><span>${esc(l.desc)} · ${l.count.toLocaleString()}편</span></span><span class="n">${ic('next')}</span></a>`).join('')}</div>`;
  if (!dic) h += `<h2 class="sec">함께 보기</h2><div class="list"><a class="li" href="#/subj"><span class="ico">🗂️</span><span class="t"><b>주제별 성구</b><span>성경의 큰 사건과 주제 1,500여 개</span></span></a><a class="li" href="#/plan"><span class="ico">📅</span><span class="t"><b>성경 일년 일독표</b><span>날마다 세 장씩</span></span></a></div>`;
  main.innerHTML = h + '</div>';
}
async function libBody(lid, i) {
  const L = LIB[lid]; let k = 0;
  while (k + 1 < L.chunks.length && L.chunks[k + 1] <= i) k++;
  const d = await J(`lib/${lid}/${k}.json`); return d[i - L.chunks[k]];
}
async function libAllBodies(lid, prog) {
  const L = LIB[lid], out = [];
  for (let k = 0; k < L.chunks.length; k++) { out.push(...await J(`lib/${lid}/${k}.json`)); prog && prog(k + 1, L.chunks.length); }
  return out;
}
async function viewLibList(lid, q) {
  const L = LIB[lid]; if (!L) return go('#/l');
  const qs = q.get('q') || '', full = q.get('f') === '1';
  setTop(`${back()}<h1>${esc(L.name)}</h1>`);
  main.innerHTML = `<div class="wrap"><form class="sbox" id="lf"><input type="search" id="lq" value="${esc(qs)}" placeholder="${L.kind === 'dic' ? '낱말 찾기' : L.kind === 'hymn' ? '장 번호, 제목, 가사' : '제목·주제·성구 찾기'}" autocomplete="off" enterkeyhint="search"><button class="btn pri">찾기</button></form>
    ${L.kind === 'doc' ? `<label class="row small muted" style="margin:8px 2px"><input type="checkbox" id="lfu" ${full ? 'checked' : ''}> 본문 내용까지 찾기 (처음 한 번은 시간이 걸립니다)</label>` : ''}
    <div id="lr">${loadingHTML()}</div></div>`;
  const submit = () => { const p = new URLSearchParams({ q: $('#lq').value.trim() }); if ($('#lfu') && $('#lfu').checked) p.set('f', '1'); history.replaceState(null, '', libLink(lid) + '?' + p); route(); };
  $('#lf').onsubmit = e => { e.preventDefault(); submit(); };
  if ($('#lfu')) $('#lfu').onchange = () => { if ($('#lq').value.trim()) submit(); };
  let tm; $('#lq').oninput = () => { if (L.kind === 'doc' && full) return; clearTimeout(tm); tm = setTimeout(submit, 350); };
  const idx = await J(`lib/${lid}/index.json`);
  let hits = idx.map((r, i) => i);
  if (L.kind === 'hymn') hits.sort((a, b) => (+idx[a][1] || 9999) - (+idx[b][1] || 9999));
  if (qs) {
    const terms = qs.toLowerCase().split(/\s+/);
    if (L.kind === 'hymn' && /^\d+$/.test(qs)) hits = hits.filter(i => idx[i][1] === qs);
    else {
      let bodies = null;
      if ((full && L.kind === 'doc') || L.kind === 'hymn') {
        bodies = await libAllBodies(lid, (a, b) => { const el = $('#lr'); if (el) el.innerHTML = loadingHTML(`본문 읽는 중… ${a}/${b}`); });
      }
      const hay = i => (idx[i].join(' ') + (bodies ? ' ' + bodies[i] : '')).toLowerCase();
      hits = hits.filter(i => terms.every(t => hay(i).includes(t)));
      if (L.kind === 'dic') {
        const t0 = terms[0], rank = i => { const w = idx[i][0].toLowerCase(); return w === t0 ? 0 : w.startsWith(t0) ? 1 : w.includes(t0) ? 2 : 3; };
        hits.sort((a, b) => rank(a) - rank(b) || a - b);
      }
    }
  }
  if (!$('#lr')) return;
  let k = 0;
  $('#lr').innerHTML = `<p class="small muted" style="margin:10px 4px">${qs ? `‘${esc(qs)}’ ` : ''}${hits.length.toLocaleString()}편</p><div class="list" id="ll"></div><div style="text-align:center;margin:14px"><button class="btn" id="lm" hidden>더 보기</button></div>`;
  const draw = () => {
    const part = hits.slice(k, k + 200); k += part.length;
    $('#ll').insertAdjacentHTML('beforeend', part.map(i => {
      const r = idx[i];
      const sub = L.kind === 'hymn' ? [r[2], r[3]].filter(Boolean).join(' · ') : r.slice(1).filter(Boolean).join(' · ');
      return `<a class="li" href="${libLink(lid, i)}">${L.kind === 'hymn' ? `<span class="ico">${esc(r[1])}</span>` : ''}<span class="t"><b>${esc(r[0])}</b>${sub ? `<span>${esc(sub)}</span>` : ''}</span></a>`;
    }).join(''));
    $('#lm').hidden = k >= hits.length;
    if (!hits.length) $('#ll').outerHTML = `<div class="empty">찾는 자료가 없습니다.</div>`;
  };
  draw(); $('#lm').onclick = draw;
}
async function viewLibEntry(lid, i) {
  const L = LIB[lid]; if (!L) return go('#/l');
  setTop(`${back()}<h1>${esc(L.name)}</h1><button class="ib" id="ecp" aria-label="복사">${ic('copy')}</button>`);
  main.innerHTML = loadingHTML();
  const [idx, body] = await Promise.all([J(`lib/${lid}/index.json`), libBody(lid, i)]);
  const r = idx[i]; if (!r) return go(libLink(lid));
  const cols = L.cols || [];
  const meta = r.slice(1).map((x, j) => x ? `<span><span class="muted">${esc(cols[j] || '')}</span> ${linkify(esc(x))}</span>` : '').join('');
  let bh = linkify(esc(body || ''));
  if (L.kind === 'hymn') { const [ly, ex] = bh.split('◆◇◆ 해설 ◆◇◆'); bh = `<div class="body lyr">${ly.trim()}</div>${ex ? `<h2 class="sec">해설</h2><div class="body">${ex.trim()}</div>` : ''}`; }
  else bh = `<div class="body">${bh}</div>`;
  main.innerHTML = `<div class="wrap doc"><h1>${L.kind === 'hymn' ? esc(r[1]) + '장 ' : ''}${esc(r[0])}</h1><div class="meta">${meta}</div>${bh}
    <div class="nav2" style="padding:0;margin-top:26px">${i > 0 ? `<a class="btn" href="${libLink(lid, i - 1)}">${ic('prev')} 앞</a>` : '<span></span>'}${i + 1 < idx.length ? `<a class="btn" href="${libLink(lid, i + 1)}">다음 ${ic('next')}</a>` : ''}</div></div>`;
  scrollTo(0, 0);
  $('#ecp').onclick = () => copyText(`${r[0]}\n\n${body}`);
}
async function viewStrongList(tag, q) {
  const qs = (q.get('q') || '').trim();
  const T = tag.toUpperCase();
  setTop(`${back()}<h1>스트롱 ${tag === 'h' ? '히브리어' : '헬라어'} 사전</h1>`);
  main.innerHTML = `<div class="wrap"><form class="sbox" id="xf"><input type="search" id="xq" value="${esc(qs)}" placeholder="번호(예: ${tag === 'h' ? '430' : '26'}) 또는 한글 뜻·발음·원어" autocomplete="off"><button class="btn pri">찾기</button></form><div id="xr">${loadingHTML('사전을 펴는 중…')}</div></div>`;
  $('#xf').onsubmit = e => { e.preventDefault(); history.replaceState(null, '', `#/d/s${tag}?q=` + encodeURIComponent($('#xq').value.trim())); route(); };
  if (/^[HG]?\d+$/i.test(qs)) { const n = +qs.replace(/\D/g, ''); return go(`#/d/s${tag}/${n}`); }
  const files = META.files.filter(f => f.startsWith(`strong/${tag}`));
  const all = Object.assign({}, ...(await Promise.all(files.map(f => J(f)))));
  let nums = Object.keys(all).map(Number).sort((a, b) => a - b);
  if (qs) { const t = bare(qs); nums = nums.filter(n => { const e = all[n]; return bare(e[0]).includes(t) || (e[1] || '').includes(qs) || e[2].includes(qs) || e[3].toLowerCase().includes(qs.toLowerCase()); }); }
  if (!$('#xr')) return;
  let k = 0;
  $('#xr').innerHTML = `<p class="small muted" style="margin:10px 4px">${nums.length.toLocaleString()}낱말</p><div class="list" id="xl"></div><div style="text-align:center;margin:14px"><button class="btn" id="xm" hidden>더 보기</button></div>`;
  const draw = () => {
    const part = nums.slice(k, k + 200); k += part.length;
    $('#xl').insertAdjacentHTML('beforeend', part.map(n => `<a class="li" href="#/d/s${tag}/${n}"><span class="ico" style="width:auto;padding:0 8px;font-size:13px">${T}${n}</span><span class="t"><b class="${tag === 'h' ? 'heb' : 'grk'}" style="text-align:left">${esc(all[n][0])}</b><span>${esc(all[n][1])} · ${esc(gloss(all[n]))}</span></span></a>`).join(''));
    $('#xm').hidden = k >= nums.length;
  };
  draw(); $('#xm').onclick = draw;
}
async function viewStrongPage(tag, n) {
  setTop(`${back()}<h1>스트롱 ${tag.toUpperCase()}${n}</h1>`);
  main.innerHTML = loadingHTML();
  const e = await strong(tag, n);
  main.innerHTML = `<div class="wrap"><div class="card">${strongBody(tag, n, e)}</div>
   <div class="nav2" style="padding:0">${n > 1 ? `<a class="btn" href="#/d/s${tag}/${n - 1}">${ic('prev')} ${tag.toUpperCase()}${n - 1}</a>` : '<span></span>'}<a class="btn" href="#/d/s${tag}/${n + 1}">${tag.toUpperCase()}${n + 1} ${ic('next')}</a></div></div>`;
  const f = $('[data-find]', main); if (f) f.onclick = () => go('#/s?q=' + f.dataset.find);
  $$('.strong a.ref[data-s]', main).forEach(a => a.onclick = ev => { ev.preventDefault(); ev.stopPropagation(); go(`#/d/s${tag}/${a.dataset.s.slice(1)}`); });
}

/* ---------- 더보기 ---------- */
async function viewMore() {
  setTop(`<h1>내 사랑하는 책</h1>`);
  const today = await J('today.json').catch(() => []);
  const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 864e5);
  const tv = today.length ? today[(day - 1) % today.length] : '';
  const nm = Object.keys(S.marks).length;
  const last = S.hist[0] ? S.hist[0].split(':').map(Number) : null;
  main.innerHTML = `<div class="wrap">
    ${tv ? `<div class="card"><div class="small muted" style="margin-bottom:6px">오늘의 말씀</div><div class="today">${linkify(esc(tv))}</div></div>` : ''}
    ${last ? `<a class="card li" style="border-radius:14px" href="#/r/${last[0] + 1}/${last[1]}"><span class="ico">${ic('book')}</span><span class="t"><b>이어 읽기</b><span>${esc(BK[last[0]].name)} ${last[1]}장</span></span>${ic('next')}</a>` : ''}
    <h2 class="sec">말씀 생활</h2><div class="list">
      <a class="li" href="#/h"><span class="ico">🎵</span><span class="t"><b>찬송가</b><span>통일찬송가 가사와 해설</span></span></a>
      <a class="li" href="#/plan"><span class="ico">📅</span><span class="t"><b>성경 일년 일독표</b><span>${planDone()} / 365일 읽음</span></span></a>
      <a class="li" href="#/subj"><span class="ico">🗂️</span><span class="t"><b>주제별 성구</b><span>창조부터 새 하늘 새 땅까지</span></span></a>
      <a class="li" href="#/notes"><span class="ico">🔖</span><span class="t"><b>내 표시</b><span>책갈피·형광펜·메모 ${nm}곳</span></span></a></div>
    <h2 class="sec">앱</h2><div class="list">
      <a class="li" href="#/set"><span class="ico">${ic('gear')}</span><span class="t"><b>설정</b><span>글자 크기, 화면 색, 오프라인 저장, 백업</span></span></a>
      ${installRow()}
      <a class="li" href="#/about"><span class="ico">ℹ️</span><span class="t"><b>앱 정보</b><span>자료 출처와 저작권</span></span></a></div>
    <p class="small muted" style="text-align:center;margin-top:24px">판 ${esc(BUILD)}</p></div>`;
  const ib = $('#instBtn'); if (ib) ib.onclick = doInstall;
}

/* ---------- 읽기표 ---------- */
const planDone = () => Object.keys(S.plan).length;
async function viewPlan() {
  setTop(`${back()}<h1>성경 일년 일독표</h1>`);
  const plan = await J('plan.json');
  const d = new Date(), md = `${d.getMonth() + 1}월 ${d.getDate()}일`;
  const ti = Math.max(0, plan.findIndex(p => p[0] === md));
  const done = planDone();
  main.innerHTML = `<div class="wrap"><div class="card"><div class="row" style="justify-content:space-between"><b>${done}일 읽음</b><span class="muted small">${Math.round(done / 3.65)}%</span></div><div class="prog"><i style="width:${done / 3.65}%"></i></div>
    <div class="small muted">오늘(${md}) 읽을 곳: ${plan[ti][1].map(x => refLinkLoose(x)).join(' · ')}</div></div>
    <div class="list" id="pl">${plan.map((p, i) => `<div class="plan-day ${i === ti ? 'now' : ''}" id="pd${i}"><input type="checkbox" data-i="${i}" ${S.plan[i] ? 'checked' : ''} aria-label="${p[0]} 읽음"><span class="d">${esc(p[0])}</span><span class="rs">${p[1].map(refLinkLoose).join('')}</span></div>`).join('')}</div></div>`;
  $('#pl').onchange = e => { const i = e.target.dataset.i; if (e.target.checked) S.plan[i] = Date.now(); else delete S.plan[i]; save(); };
  const el = $('#pd' + ti); if (el) el.scrollIntoView({ block: 'center' });
}
function refLinkLoose(x) { const r = parseLoose(x); return r ? `<a href="#/r/${r.b + 1}/${r.c}${r.v ? '/' + r.v : ''}">${esc(x)}</a>` : esc(x); }

/* ---------- 주제별 성구 ---------- */
async function viewSubj(q) {
  const qs = q.get('q') || '';
  setTop(`${back()}<h1>주제별 성구</h1>`);
  const s = await J('subj.json');
  main.innerHTML = `<div class="wrap"><input type="search" id="sjq" value="${esc(qs)}" placeholder="주제 찾기 (예: 부활, 기도)"><div class="list" id="sjl" style="margin-top:10px"></div></div>`;
  const draw = () => {
    const t = $('#sjq').value.trim();
    const rows = s.map((r, i) => [r, i]).filter(([r]) => !t || r[0].includes(t) || r[1].includes(t));
    $('#sjl').innerHTML = rows.slice(0, 600).map(([r]) => { const rr = parseLoose(r[1]); return `<a class="li" ${rr ? `href="#/r/${rr.b + 1}/${rr.c}${rr.v ? '/' + rr.v : ''}"` : ''}><span class="t"><b>${esc(r[0])}</b></span><span class="n">${esc(r[1])}</span></a>`; }).join('') || '<div class="empty">없습니다</div>';
  };
  $('#sjq').oninput = () => { history.replaceState(null, '', '#/subj?q=' + encodeURIComponent($('#sjq').value.trim())); draw(); };
  draw();
}

/* ---------- 내 표시 ---------- */
function viewNotes(q) {
  const f = q.get('f') || 'all';
  setTop(`${back()}<h1>내 표시</h1>`);
  let ks = Object.keys(S.marks).sort((a, b) => S.marks[b].t - S.marks[a].t);
  if (f !== 'all') ks = ks.filter(k => f === 'bm' ? S.marks[k].bm : f === 'note' ? S.marks[k].note : S.marks[k].h);
  main.innerHTML = `<div class="wrap"><div class="seg" id="nf">${[['all', '모두'], ['bm', '책갈피'], ['hl', '형광펜'], ['note', '메모']].map(([k, t]) => `<button data-f="${k}" class="${k === f ? 'on' : ''}">${t}</button>`).join('')}</div>
   <div class="list" id="nl" style="margin-top:12px">${ks.length ? '' : '<div class="empty">아직 표시한 곳이 없습니다.<br><span class="small">성경을 읽다가 절을 누르면 책갈피·형광펜·메모를 달 수 있습니다.</span></div>'}</div></div>`;
  $('#nf').onclick = e => { const b = e.target.closest('button'); if (b) go('#/notes?f=' + b.dataset.f); };
  J('bible/' + readVer() + '.json').then(d => {
    $('#nl').insertAdjacentHTML('beforeend', ks.map(k => {
      const [b, c, v] = k.split(':').map(Number), m = S.marks[k];
      const t = (d[b][c - 1] || [])[v - 1] || '';
      return `<a class="li" href="#/r/${b + 1}/${c}/${v}" style="align-items:flex-start"><span class="t"><b>${m.bm ? '🔖 ' : ''}${m.h ? `<span class="dot" style="display:inline-block;width:10px;height:10px;border-radius:50%;background:var(--hl-${m.h})"></span> ` : ''}${esc(BK[b].name)} ${c}:${v}</b><span style="white-space:normal">${esc(t)}</span>${m.note ? `<span style="white-space:pre-wrap;color:var(--ink)">📝 ${esc(m.note)}</span>` : ''}</span><span class="n">${new Date(m.t).toLocaleDateString('ko-KR')}</span></a>`;
    }).join(''));
  });
}

/* ---------- 설정 ---------- */
function viewSettings() {
  setTop(`${back()}<h1>설정</h1>`);
  const canOffline = 'serviceWorker' in navigator && location.protocol.startsWith('http');
  main.innerHTML = `<div class="wrap">
   <h2 class="sec">화면</h2><div class="card">
    <div class="kv"><span>글자 크기 <b id="fsv">${S.fs}</b></span><input type="range" id="fs" min="14" max="32" value="${S.fs}"></div>
    <div class="kv"><span>줄 간격 <b id="lhv">${S.lh}</b></span><input type="range" id="lh" min="1.3" max="2.6" step="0.1" value="${S.lh}"></div>
    <div class="kv"><span>화면 색</span><div class="seg" id="th">${[['auto', '자동'], ['light', '밝게'], ['sepia', '종이'], ['dark', '어둡게']].map(([k, t]) => `<button data-k="${k}" class="${S.theme === k ? 'on' : ''}">${t}</button>`).join('')}</div></div>
    <div class="kv"><span>절 번호 보이기</span><input type="checkbox" id="vn" ${S.vn ? 'checked' : ''} style="width:22px;height:22px;accent-color:var(--acc)"></div>
    <p class="v" style="margin-top:10px;cursor:default"><span class="vn">16</span><span class="t">하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 저를 믿는 자마다 멸망치 않고 영생을 얻게 하려 하심이니라</span></p></div>
   ${canOffline ? `<h2 class="sec">오프라인 저장</h2><div class="card"><p class="small" style="margin-top:0">한 번 연 자료는 저절로 기기에 저장됩니다. 인터넷이 없는 곳에서도 모두 보려면 전체 자료(약 ${Math.round(META.bytes / 1e6)}MB, 실제 내려받는 양은 그보다 적음)를 미리 받아 두세요.</p>
     <button class="btn pri" id="dlAll">전체 자료 받기</button> <span id="dlS" class="small muted"></span></div>` : ''}
   <h2 class="sec">백업</h2><div class="card"><p class="small" style="margin-top:0">책갈피·형광펜·메모·읽기표 기록을 파일로 옮겨 다른 기기(휴대폰↔PC)에서 불러올 수 있습니다.</p>
     <div class="row"><button class="btn" id="bkOut">백업 파일 만들기</button><label class="btn">백업 불러오기<input type="file" id="bkIn" accept=".json,application/json" hidden></label></div></div>
   <h2 class="sec">초기화</h2><div class="card"><button class="btn" id="rst" style="color:var(--warn)">내 기록 모두 지우기</button></div></div>`;
  const live = () => { applyLook(); save(); };
  $('#fs').oninput = e => { S.fs = +e.target.value; $('#fsv').textContent = S.fs; live(); };
  $('#lh').oninput = e => { S.lh = +e.target.value; $('#lhv').textContent = S.lh; live(); };
  $('#th').onclick = e => { const b = e.target.closest('button'); if (!b) return; S.theme = b.dataset.k; $$('#th button').forEach(x => x.classList.toggle('on', x === b)); live(); };
  $('#vn').onchange = e => { S.vn = e.target.checked; save(); };
  if ($('#dlAll')) $('#dlAll').onclick = downloadAll;
  $('#bkOut').onclick = () => {
    const blob = new Blob([JSON.stringify({ app: 'mybook', at: new Date().toISOString(), marks: S.marks, plan: S.plan }, null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `내사랑하는책_백업_${new Date().toISOString().slice(0, 10)}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };
  $('#bkIn').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const d = JSON.parse(await f.text()); if (d.app !== 'mybook') throw new Error();
      const n = Object.keys(d.marks || {}).length;
      if (!confirm(`백업의 표시 ${n}곳과 읽기표 기록을 지금 기록에 합칩니다. 같은 절은 백업 쪽이 남습니다.`)) return;
      Object.assign(S.marks, d.marks || {}); Object.assign(S.plan, d.plan || {}); save(); toast('백업을 불러왔습니다');
    } catch (err) { toast('백업 파일이 아닙니다'); }
  };
  $('#rst').onclick = () => { if (confirm('책갈피·형광펜·메모·읽기표 기록을 모두 지울까요? 되돌릴 수 없습니다.')) { S.marks = {}; S.plan = {}; S.hist = []; save(); toast('지웠습니다'); } };
}
async function downloadAll() {
  const btn = $('#dlAll'), st = $('#dlS'); btn.disabled = true;
  const files = META.files; let n = 0, fail = 0;
  const q = files.slice();
  const worker = async () => { while (q.length) { const f = q.shift(); try { const r = await fetch(dpath(f)); if (!r.ok) throw 0; await r.arrayBuffer(); } catch (e) { fail++; } n++; if (st) st.textContent = `${n} / ${files.length}`; } };
  await Promise.all([worker(), worker(), worker(), worker()]);
  btn.disabled = false;
  if (st) st.textContent = fail ? `${fail}개를 받지 못했습니다. 다시 눌러 주세요.` : '모두 받았습니다. 이제 인터넷 없이도 볼 수 있습니다.';
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist();
}

/* ---------- 앱 정보 ---------- */
function viewAbout() {
  setTop(`${back()}<h1>앱 정보</h1>`);
  main.innerHTML = `<div class="wrap"><div class="card" style="line-height:1.8">
   <b style="font-size:18px">내 사랑하는 책</b><br><span class="muted small">판 ${esc(BUILD)}</span>
   <p>조이풀소프트(허성휘)가 만들어 공개한 윈도우용 성경 프로그램 「내사랑하는책 4.5 공개판」의 자료를 휴대폰과 PC(맥·윈도우)에서 쓸 수 있도록 새로 만든 앱입니다.</p></div>
   <h2 class="sec">들어 있는 자료</h2><div class="list">
   ${META.versions.map(v => `<div class="li"><span class="t"><b>${esc(v.name)}</b><span style="white-space:normal">${esc(v.note)}</span></span></div>`).join('')}
   ${META.libs.map(l => `<div class="li"><span class="t"><b>${esc(l.name)}</b><span style="white-space:normal">${esc(l.desc)} · ${l.count.toLocaleString()}편 · 내사랑하는책 원본 자료</span></span></div>`).join('')}
   <div class="li"><span class="t"><b>스트롱 사전 · 관주 · 주제별 성구 · 일독표 · 오늘의 말씀</b><span style="white-space:normal">내사랑하는책 원본 자료</span></span></div></div>
   <div class="card small muted" style="line-height:1.7">원어 본문은 원본의 옛 글꼴 코드를 유니코드로 바꾸었고, 원본에서 빠진 일부 모음은 Westminster Leningrad Codex 와 맞추어 채웠습니다. 공개 번역본은 scrollmapper/bible_databases(CrossWire SWORD 모듈) 자료를 썼습니다. 원본 자료의 권리는 각 저작권자에게 있습니다.</div></div>`;
}

/* ---------- 설치 ---------- */
let instEvt = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); instEvt = e; });
function installRow() {
  if (IS_APP || matchMedia('(display-mode: standalone)').matches || navigator.standalone) return '';
  return `<button class="li" id="instBtn"><span class="ico">📲</span><span class="t"><b>앱으로 설치하기</b><span>홈 화면·바탕화면에 아이콘 만들기</span></span></button>`;
}
async function doInstall() {
  if (instEvt) { instEvt.prompt(); await instEvt.userChoice.catch(() => { }); instEvt = null; return; }
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  openPanel('앱으로 설치하기', async body => {
    body.innerHTML = ios
      ? `<ol style="line-height:2"><li><b>사파리</b>로 이 페이지를 엽니다.</li><li>아래쪽 <b>공유 버튼</b>(네모에 위 화살표)을 누릅니다.</li><li><b>홈 화면에 추가</b>를 누릅니다.</li></ol>`
      : `<ol style="line-height:2"><li><b>크롬</b>(또는 삼성 인터넷, 엣지)으로 이 페이지를 엽니다.</li><li>오른쪽 위 <b>⋮ 메뉴</b>를 누릅니다.</li><li><b>앱 설치</b> 또는 <b>홈 화면에 추가</b>를 누릅니다.</li></ol><p class="small muted">PC에서는 주소창 오른쪽의 설치 아이콘을 눌러도 됩니다.</p>`;
  });
}

/* ---------- 시작 ---------- */
async function start() {
  buildNav();
  main.innerHTML = loadingHTML('준비하는 중…');
  try { META = await J('meta.json'); }
  catch (e) { main.innerHTML = `<div class="wrap"><div class="card">자료 목록을 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.<br><button class="btn pri" onclick="location.reload()">다시 시도</button></div></div>`; return; }
  BK = META.books; META.versions.forEach(v => VER[v.id] = v); META.libs.forEach(l => LIB[l.id] = l);
  if (!VER[S.ver]) S.ver = 'krv';
  S.par = S.par.filter(x => VER[x]);
  initRefs();
  addEventListener('hashchange', route);
  if (!location.hash) history.replaceState(null, '', `#/r/${S.pos.b + 1}/${S.pos.c}`);
  route();
  addEventListener('resize', () => { if (!$('#panel').hidden) $('#ov').hidden = wide(); });
  if ('serviceWorker' in navigator && location.protocol.startsWith('http') && !['localhost', '127.0.0.1'].includes(location.hostname)) {
    navigator.serviceWorker.register('sw.js').catch(() => { });
  }
}
start();
