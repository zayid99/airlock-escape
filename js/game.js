// Core: state, navigation, input, render, save/load, screens.
const SAVE_KEY = 'airlockEscape.v1';
const WALLS = ['NORTH', 'EAST', 'SOUTH', 'WEST'];
const $ = id => document.getElementById(id);
let S;

const G = {
  fresh: () => ({ room: 0, wall: 0, view: null, inv: [], sel: null, f: {}, pz: {}, time: 0, times: [], screen: null }),
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
  turn(d) { S.wall = (S.wall + d + 4) % 4; G.sfx('click'); },
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

  // Click on a hotspot. code = "id" or "id:arg".
  hit(code, inCu) {
    const i = code.indexOf(':'), id = i < 0 ? code : code.slice(0, i), arg = i < 0 ? null : code.slice(i + 1);
    const set = inCu ? (G.cu() || {}).hs || {} : G.room().hs;
    let h = set[id];
    if (!h) return;
    if (typeof h === 'function') h = { look: h };
    const it = S.sel;
    if (it && h.use && h.use[it]) { S.sel = null; h.use[it](arg); }
    else if (it && !inCu) { S.sel = null; G.msg("That doesn't work here."); G.sfx('error'); }
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
    if (ROOMS[S.room + 1]) {
      Object.assign(S, { room: S.room + 1, wall: 0, view: null, inv: [], sel: null, f: {}, pz: {}, time: 0, screen: null });
    } else S.screen = 'soon';
  },

  fmt(ms) {
    const s = Math.floor(ms / 1000);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  },

  render() {
    const room = G.room(), cu = G.cu();
    $('scene').innerHTML = room.walls[S.wall]();
    $('wallname').textContent = room.name + ' · ' + WALLS[S.wall];
    $('closeup').classList.toggle('show', !!cu);
    $('cusvg').innerHTML = cu ? cu.draw() : '';
    for (const n of ['left', 'right']) $(n).classList.toggle('hidden', !!cu);
    const sc = $('screen');
    sc.classList.toggle('show', !!S.screen);
    if (S.screen === 'clear') {
      sc.innerHTML = `<div><h1>ROOM ${S.room + 1} CLEAR</h1><p>Time: ${G.fmt(S.times[S.room])}</p><button data-act="next">CONTINUE</button></div>`;
    } else if (S.screen === 'soon') {
      sc.innerHTML = '<div><h1>MORE ROOMS SOON</h1><p>Room 2 arrives in the next phase.</p></div>';
    } else sc.innerHTML = '';
    INV.render();
  },

  init() {
    G.load();
    $('stage').addEventListener('click', e => {
      const act = e.target.closest('[data-act]');
      if (act) { if (act.dataset.act === 'next') G.next(); G.save(); G.render(); return; }
      const el = e.target.closest('[data-hs]');
      if (el) G.hit(el.dataset.hs, !!el.closest('#closeup'));
    });
    $('left').onclick = () => { G.turn(-1); G.save(); G.render(); };
    $('right').onclick = () => { G.turn(1); G.save(); G.render(); };
    $('cuclose').onclick = () => { G.close(); G.save(); G.render(); };
    $('inv').addEventListener('click', e => {
      const b = e.target.closest('[data-item]');
      if (b) { INV.click(b.dataset.item); G.save(); G.render(); }
    });
    $('inspect').onclick = () => { if (S.sel) { G.open('item:' + S.sel); G.save(); G.render(); } };
    document.addEventListener('keydown', e => {
      if (S.screen) return;
      if (e.key === 'Escape' && S.view) G.close();
      else if (e.key === 'ArrowLeft' && !S.view) G.turn(-1);
      else if (e.key === 'ArrowRight' && !S.view) G.turn(1);
      else return;
      G.save(); G.render();
    });
    setInterval(() => {
      if (!S.screen && document.visibilityState === 'visible') { S.time += 1000; G.save(); }
    }, 1000);
    G.render();
  }
};

G.init();
