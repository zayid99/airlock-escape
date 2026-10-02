// Reusable puzzle widgets. Each takes a config object and keeps its
// scratch state in S.pz[cfg.key]. cfg.solved() / cfg.done() link to room flags.
const PUZ = {
  st: key => S.pz[key] || (S.pz[key] = {}),

  // ---- Wire matching: connect each left wire to a right port ----
  // cfg: { key, left:[colors], ans:[right index per left], label(j,x,y), solved(), done() }
  wires: {
    draw(cfg) {
      const p = PUZ.st(cfg.key), n = cfg.left.length, gap = 560 / n, y = i => 260 + gap * (i + 0.5);
      const links = cfg.solved() ? Object.assign({}, cfg.ans) : (p.links || {});
      let o = '';
      cfg.left.forEach((c, i) => o += A.r(170, y(i) - 18, 160, 36, C[c], 0, 6));
      for (const i in links) {
        const d = `M330 ${y(+i)} C800 ${y(+i)} 800 ${y(links[i])} 1270 ${y(links[i])}`;
        o += `<path d="${d}" fill="none" stroke="${OL}" stroke-width="28" stroke-linecap="round"/>`;
        o += `<path d="${d}" fill="none" stroke="${C[cfg.left[i]]}" stroke-width="16" stroke-linecap="round"/>`;
      }
      cfg.left.forEach((c, i) => {
        const ring = p.sel === i ? `<circle cx="330" cy="${y(i)}" r="46" fill="none" stroke="#fff" stroke-width="8" stroke-dasharray="14 10"/>` : '';
        o += A.hs('wl:' + i, ring + A.c(330, y(i), 30, C[c], 6), A.pad(260, y(i) - gap / 2, 140, gap));
      });
      cfg.left.forEach((_, j) => {
        o += A.hs('wr:' + j, A.c(1270, y(j), 30, '#262b3d', 6) + A.c(1270, y(j), 12, C.metalD, 4), A.pad(1200, y(j) - gap / 2, 140, gap));
        o += A.r(1330, y(j) - 42, 84, 84, C.white, 14, 6) + cfg.label(j, 1372, y(j));
      });
      return o;
    },
    on(cfg, id, a) {
      if (cfg.solved()) return;
      const p = PUZ.st(cfg.key);
      p.links = p.links || {};
      a = +a;
      if (id === 'wl') { p.sel = a; G.sfx('click'); return; }
      if (p.sel == null) { G.msg('Pick a wire on the left first.'); return; }
      for (const k in p.links) if (p.links[k] === a) delete p.links[k];
      p.links[p.sel] = a;
      p.sel = null;
      G.sfx('click');
      if (Object.keys(p.links).length < cfg.left.length) return;
      if (cfg.ans.every((r, i) => p.links[i] === r)) { cfg.done(); G.sfx('success'); }
      else { p.links = {}; G.msg('Bzzt! Wrong connections. The wires pop loose.'); G.sfx('error'); }
    },
    hs: cfg => ({ wl: a => PUZ.wires.on(cfg, 'wl', a), wr: a => PUZ.wires.on(cfg, 'wr', a) })
  },

  // ---- Keypad: enter a numeric code ----
  // cfg: { key, code, powered(), solved(), done() }
  keypad: {
    draw(cfg) {
      const p = PUZ.st(cfg.key), pw = cfg.powered(), v = p.v || '';
      let o = A.r(540, 40, 520, 820, C.panel, 30, 8) + A.r(590, 90, 420, 130, pw ? '#103a2a' : '#11131c', 16, 6);
      if (pw) o += A.t(800, 155, 80, cfg.solved() ? 'OPEN' : v.padEnd(cfg.code.length, '_').split('').join(' '), C.on);
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'].forEach((k, i) => {
        const x = 590 + (i % 3) * 145, y = 255 + Math.floor(i / 3) * 145;
        const f = k === 'C' ? C.red : k === 'OK' ? C.on : C.white;
        o += A.hs('k:' + k, A.r(x, y, 125, 125, f, 18, 6) + A.t(x + 62, y + 64, k === 'OK' ? 48 : 64, k, OL));
      });
      return o;
    },
    on(cfg, k) {
      const p = PUZ.st(cfg.key);
      if (!cfg.powered()) { G.msg('No power.'); G.sfx('error'); return; }
      if (cfg.solved()) return;
      p.v = p.v || '';
      if (k === 'C') p.v = '';
      else if (k === 'OK') {
        if (p.v === cfg.code) { cfg.done(); G.sfx('success'); return; }
        p.v = ''; G.msg('Wrong code.'); G.sfx('error'); return;
      } else if (p.v.length < cfg.code.length) p.v += k;
      G.sfx('click');
    },
    hs: cfg => ({ k: a => PUZ.keypad.on(cfg, a) })
  },

  // ---- Symbol sequence: press symbol buttons in the right order ----
  // cfg: { key, syms:[...], ans:[...], active(), solved(), done(), off:'message' }
  symbols: {
    draw(cfg, x0, y0, w) {
      const p = PUZ.st(cfg.key), seq = p.seq || [], n = cfg.ans.length, on = cfg.active();
      let o = A.r(x0, y0, w, 150, '#11131c', 18, 6);
      if (cfg.solved()) o += A.t(x0 + w / 2, y0 + 75, 70, 'OPEN', C.on);
      else if (!on) o += A.t(x0 + w / 2, y0 + 75, 46, cfg.off || 'LOCKED', C.red);
      else for (let i = 0; i < n; i++) {
        const x = x0 + (w / n) * (i + 0.5);
        o += seq[i] ? A.sym(seq[i], x, y0 + 75, 34, C.on, 4) : A.c(x, y0 + 75, 10, '#3a4054', 0);
      }
      const m = cfg.syms.length, bw = Math.min(150, w / m - 20);
      cfg.syms.forEach((k, i) => {
        const x = x0 + (w / m) * (i + 0.5), y = y0 + 300;
        o += A.hs('sy:' + k, A.r(x - bw / 2, y - bw / 2, bw, bw, on ? C.white : C.metalD, 22, 6) + A.sym(k, x, y, bw * 0.3, C.ink, 5));
      });
      return o;
    },
    on(cfg, k) {
      if (cfg.solved()) return;
      if (!cfg.active()) { G.msg('Nothing happens. It needs something first.'); G.sfx('error'); return; }
      const p = PUZ.st(cfg.key);
      p.seq = (p.seq || []).concat(k);
      G.sfx('click');
      if (p.seq.length < cfg.ans.length) return;
      if (p.seq.every((s, i) => s === cfg.ans[i])) { cfg.done(); G.sfx('success'); }
      else { p.seq = []; G.msg('Wrong sequence. The pad resets.'); G.sfx('error'); }
    },
    hs: cfg => ({ sy: a => PUZ.symbols.on(cfg, a) })
  }
};
