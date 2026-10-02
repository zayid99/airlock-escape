// Player movement, collision, camera, depth sorting, station proximity,
// keyboard / joystick / click-to-walk input.
const SPEED = 430;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const P = {
  keys: {}, joy: { x: 0, y: 0 }, target: null, auto: null, near: null,
  face: 1, phase: 0, moving: false, stuck: 0, last: 0, lastStep: null, el: null, dirty: true,

  init() {
    const MOVE_KEYS = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '];
    addEventListener('keydown', e => {
      const k = e.key.toLowerCase();
      if (MOVE_KEYS.includes(k)) e.preventDefault();
      P.keys[k] = true;
      if ((k === 'e' || k === ' ') && !e.repeat) G.use();
    });
    addEventListener('keyup', e => { P.keys[e.key.toLowerCase()] = false; });
    addEventListener('blur', () => { P.keys = {}; });

    // click / tap to walk; tapping a station walks there and uses it
    $('scene').addEventListener('pointerdown', e => {
      if (S.view || S.screen) return;
      const st = e.target.closest('[data-st]');
      if (st) {
        const s = G.room().st[st.dataset.st];
        P.target = { x: s.at[0], y: s.at[1] };
        P.auto = st.dataset.st;
      } else {
        P.target = P.toWorld(e);
        P.auto = null;
      }
    });

    // on-screen joystick (touch devices)
    const joy = $('joy'), knob = $('knob');
    let jid = null;
    const jmove = e => {
      const b = joy.getBoundingClientRect(), R = b.width / 2;
      let dx = (e.clientX - b.left - R) / R, dy = (e.clientY - b.top - R) / R;
      const m = Math.hypot(dx, dy);
      if (m > 1) { dx /= m; dy /= m; }
      P.joy = m < 0.15 ? { x: 0, y: 0 } : { x: dx, y: dy };
      knob.style.transform = `translate(${dx * 50}%, ${dy * 50}%)`;
    };
    joy.addEventListener('pointerdown', e => { jid = e.pointerId; joy.setPointerCapture(jid); jmove(e); });
    joy.addEventListener('pointermove', e => { if (e.pointerId === jid) jmove(e); });
    const jend = e => {
      if (e.pointerId !== jid) return;
      jid = null; P.joy = { x: 0, y: 0 }; knob.style.transform = '';
    };
    joy.addEventListener('pointerup', jend);
    joy.addEventListener('pointercancel', jend);

    requestAnimationFrame(P.loop);
  },

  toWorld(e) {
    const svg = $('scene'), p = svg.createSVGPoint();
    p.x = e.clientX; p.y = e.clientY;
    const w = p.matrixTransform(svg.getScreenCTM().inverse());
    return { x: w.x, y: w.y };
  },

  // feet box overlaps any wall rectangle?
  blocked(room) {
    const x0 = S.x - 28, x1 = S.x + 28, y0 = S.y - 18, y1 = S.y + 4;
    return room.walls.some(([x, y, w, h]) => x1 > x && x0 < x + w && y1 > y && y0 < y + h);
  },

  loop(t) {
    const dt = Math.min(0.05, (t - (P.last || t)) / 1000);
    P.last = t;
    P.step(dt);
    P.draw();
    requestAnimationFrame(P.loop);
  },

  step(dt) {
    P.moving = false;
    if (S.view || S.screen) { P.target = null; P.auto = null; return; }
    const room = G.room(), k = P.keys;
    let dx = P.joy.x, dy = P.joy.y;
    if (k.a || k.arrowleft) dx--;
    if (k.d || k.arrowright) dx++;
    if (k.w || k.arrowup) dy--;
    if (k.s || k.arrowdown) dy++;
    if (dx || dy) { P.target = null; P.auto = null; }
    else if (P.target) {
      if (P.auto && P.near === P.auto) { P.target = null; P.auto = null; G.use(); return; }
      const tx = P.target.x - S.x, ty = P.target.y - S.y, d = Math.hypot(tx, ty);
      if (d < 8) { P.target = null; P.auto = null; return; }
      dx = tx / d; dy = ty / d;
    }
    const m = Math.hypot(dx, dy);
    if (!m) return;
    if (m > 1) { dx /= m; dy /= m; }
    const ox = S.x, oy = S.y, sp = SPEED * dt;
    S.x += dx * sp;
    if (P.blocked(room)) S.x = ox;
    S.y += dy * sp;
    if (P.blocked(room)) S.y = oy;
    if (Math.abs(dx) > 0.2) P.face = dx > 0 ? 1 : -1;
    P.moving = S.x !== ox || S.y !== oy;
    if (P.moving) { P.phase += dt * 9; P.stuck = 0; }
    else if (P.target && (P.stuck += dt) > 0.25) { P.target = null; P.auto = null; }
  },

  draw() {
    const room = G.room(), el = $('player');
    if (!el || !room) return;
    el.setAttribute('transform', `translate(${S.x.toFixed(1)} ${S.y.toFixed(1)}) scale(${P.face} 1)`);
    const step = P.moving ? Math.floor(P.phase) % 4 : -1;
    if (step !== P.lastStep || el !== P.el) { el.innerHTML = A.bot(step); P.lastStep = step; P.el = el; }

    // depth: player goes before the first prop whose base line is below the player
    let before = null;
    for (const c of el.parentNode.children) if (c !== el && +c.dataset.y > S.y) { before = c; break; }
    if (el.nextElementSibling !== before) el.parentNode.insertBefore(el, before);

    // camera follows player
    const cx = clamp(S.x - 800, 0, room.W - 1600), cy = clamp(S.y - 520, 0, room.H - 900);
    $('scene').setAttribute('viewBox', `${cx.toFixed(1)} ${cy.toFixed(1)} 1600 900`);

    // nearest station in reach
    let best = null, bd = 1e9;
    for (const id in room.st) {
      const s = room.st[id], d = Math.hypot(s.at[0] - S.x, s.at[1] - S.y);
      if (d < (s.r || 160) && d < bd) { bd = d; best = id; }
    }
    if (best !== P.near || P.dirty) {
      document.querySelectorAll('#scene .near').forEach(n => n.classList.remove('near'));
      if (best) document.querySelectorAll(`#scene [data-st="${best}"]`).forEach(n => n.classList.add('near'));
      $('use').classList.toggle('on', !!best);
      P.near = best; P.dirty = false;
    }
  }
};
