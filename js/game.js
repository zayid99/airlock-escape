// Core: state, HUD, USE action, close-ups, save/load, screens.
const SAVE_KEY = 'airlockEscape.v2';
const $ = id => document.getElementById(id);
let S;

const G = {
  fresh: () => ({ room: 0, x: ROOMS[0].spawn[0], y: ROOMS[0].spawn[1], view: null, inv: [], sel: null, f: {}, pz: {}, time: 0, times: [], screen: null }),
  load() {
    try {
      if (/[?&]new\b/.test(location.search)) localStorage.removeItem(SAVE_KEY);
      S = JSON.parse(localStorage.getItem(SAVE_KEY)) || G.fresh();
    } catch (e) { S = G.fresh(); }
  },
  save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable */ } },

  room: () => ROOMS[S.room],
  cu() {
    if (!S.view) return null;
    if (S.view.startsWith('item:')) return INV.cu(S.view.slice(5));
    return G.room().cu[S.view] || null;
  },
  open(v) { S.view = v; },
  close() { S.view = null; },
  take(id) { if (!S.inv.includes(id)) S.inv.push(id); G.msg('Got: ' + ITEMS[id].name); G.sfx('pickup'); },
  drop(id) { S.inv = S.inv.filter(x => x !== id); if (S.sel === id) S.sel = null; },
  sfx() { /* sound effects arrive in Phase 3 */ },

  msgTimer: 0,
  msg(t) {
    const el = $('msg');
    el.textContent = t;
    el.classList.add('show');
    clearTimeout(G.msgTimer);
    G.msgTimer = setTimeout(() => el.classList.remove('show'), 2800);
  },

  // USE the station the player is standing at. A held item the station
  // accepts is used automatically (the selected one first).
  use() {
    if (S.view || S.screen || !P.near) return;
    let h = G.room().st[P.near].act;
    if (typeof h === 'function') h = { look: h };
    const u = h.use || {};
    const it = u[S.sel] ? S.sel : S.inv.find(k => u[k]);
    if (it) { S.sel = null; u[it](); }
    else if (h.look) h.look();
    G.save(); G.render();
  },

  // Click inside a close-up panel. code = "id" or "id:arg".
  hit(code) {
    const i = code.indexOf(':'), id = i < 0 ? code : code.slice(0, i), arg = i < 0 ? null : code.slice(i + 1);
    let h = ((G.cu() || {}).hs || {})[id];
    if (!h) return;
    if (typeof h === 'function') h = { look: h };
    if (S.sel && h.use && h.use[S.sel]) { const it = S.sel; S.sel = null; h.use[it](arg); }
    else if (h.look) h.look(arg);
    G.save(); G.render();
  },

  complete() {
    S.times[S.room] = S.time;
    S.screen = 'clear';
    S.view = null; S.sel = null;
    G.sfx('success');
  },
  next() {
    const n = ROOMS[S.room + 1];
    if (n) Object.assign(S, { room: S.room + 1, x: n.spawn[0], y: n.spawn[1], view: null, inv: [], sel: null, f: {}, pz: {}, time: 0, screen: null });
    else S.screen = 'soon';
  },

  fmt(ms) {
    const s = Math.floor(ms / 1000);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  },

  renderHUD() {
    const tasks = G.room().tasks, done = tasks.filter(t => t[1]()).length;
    $('taskfill').style.width = (done / tasks.length * 100) + '%';
    $('tasks').innerHTML = `<b>${G.room().name}</b>` +
      tasks.map(([n, d]) => `<div class="${d() ? 'done' : ''}">${d() ? '&#10003;' : '&#9675;'} ${n}</div>`).join('');
  },

  render() {
    const room = G.room(), cu = G.cu();
    $('map').innerHTML = room.art.map();
    $('props').innerHTML = room.art.props().map(p => `<g data-y="${p.y}">${p.svg}</g>`).join('') + '<g id="player"></g>';
    P.dirty = true; P.lastStep = null;
    $('closeup').classList.toggle('show', !!cu);
    $('cusvg').innerHTML = cu ? cu.draw() : '';
    const sc = $('screen');
    sc.classList.toggle('show', !!S.screen);
    if (S.screen === 'clear') {
      sc.innerHTML = `<div><h1>ROOM ${S.room + 1} CLEAR</h1><p>Time: ${G.fmt(S.times[S.room])}</p><button data-act="next">CONTINUE</button></div>`;
    } else if (S.screen === 'soon') {
      sc.innerHTML = '<div><h1>MORE ROOMS SOON</h1><p>Room 2 arrives in the next phase.</p></div>';
    } else sc.innerHTML = '';
    G.renderHUD();
    INV.render();
    P.draw();
  },

  init() {
    G.load();
    $('stage').addEventListener('click', e => {
      const act = e.target.closest('[data-act]');
      if (act) { if (act.dataset.act === 'next') G.next(); G.save(); G.render(); return; }
      const el = e.target.closest('#closeup [data-hs]');
      if (el) G.hit(el.dataset.hs);
    });
    $('use').onclick = () => G.use();
    $('taskbar').onclick = () => $('hud').classList.toggle('min');
    $('cuclose').onclick = () => { G.close(); G.save(); G.render(); };
    $('inv').addEventListener('click', e => {
      const b = e.target.closest('[data-item]');
      if (b) { INV.click(b.dataset.item); G.save(); G.render(); }
    });
    $('inspect').onclick = () => { if (S.sel) { G.open('item:' + S.sel); G.save(); G.render(); } };
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && S.view) { G.close(); G.save(); G.render(); }
    });
    setInterval(() => {
      if (!S.screen && document.visibilityState === 'visible') { S.time += 1000; G.save(); }
    }, 1000);
    G.render();
    P.init();
  }
};

G.init();
