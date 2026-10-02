// SVG drawing helpers, player robot and room maps. All art is original, drawn in code.
const OL = '#1d2030';
const C = {
  red: '#e8453c', redD: '#a82a24', blue: '#3d6fe0', blueD: '#2747a0',
  yellow: '#f5cf3a', yellowD: '#c29a14', green: '#3fbf5a', greenD: '#278a3c',
  purple: '#9b59d0', purpleD: '#6c3a99',
  wall: '#9aa7b8', wallD: '#7c899c', floor: '#565e70', floorD: '#454b5c',
  metal: '#c8d0dc', metalD: '#97a2b3', panel: '#5a6378', dark: '#2c3142',
  screen: '#7fe3ff', on: '#5ef08a', white: '#f2f5fa', ink: '#2c3142',
  bot: '#f08c2e', botD: '#c0661a', cap: '#2c3142'
};

const A = {
  st: (w = 6) => `stroke="${OL}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`,
  r: (x, y, w, h, f, rx = 10, sw = 6, ex = '') =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}" ${sw ? A.st(sw) : ''} ${ex}/>`,
  c: (x, y, r, f, sw = 6, ex = '') =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${sw ? A.st(sw) : ''} ${ex}/>`,
  p: (d, f, sw = 6, ex = '') => `<path d="${d}" fill="${f}" ${sw ? A.st(sw) : ''} ${ex}/>`,
  line: (x1, y1, x2, y2, col = OL, w = 6) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`,
  t: (x, y, s, txt, f = '#fff', ol = 0) =>
    `<text x="${x}" y="${y}" font-size="${s}" fill="${f}" text-anchor="middle" dominant-baseline="central"` +
    ` font-family="Trebuchet MS, Verdana, sans-serif" font-weight="900"` +
    (ol ? ` stroke="${OL}" stroke-width="${ol}" paint-order="stroke" stroke-linejoin="round"` : '') + `>${txt}</text>`,
  // clickable group; invisible pad enlarges touch target
  hs: (id, inner, pad = '') => `<g class="hs" data-hs="${id}">${pad}${inner}</g>`,
  pad: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#000" fill-opacity="0"/>`,
  star(cx, cy, R, f, sw = 6) {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? R * 0.45 : R, a = -Math.PI / 2 + i * Math.PI / 5;
      pts.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1));
    }
    return `<polygon points="${pts.join(' ')}" fill="${f}" ${A.st(sw)}/>`;
  },
  sym(k, x, y, s, f = C.ink, sw = 5) {
    if (k === 'circ') return A.c(x, y, s * 0.9, f, sw);
    if (k === 'sq') return A.r(x - s * 0.8, y - s * 0.8, s * 1.6, s * 1.6, f, 4, sw);
    if (k === 'tri') return A.p(`M${x} ${y - s}L${x + s * 1.05} ${y + s * 0.8}L${x - s * 1.05} ${y + s * 0.8}Z`, f, sw);
    if (k === 'star') return A.star(x, y, s * 1.15, f, sw);
    return '';
  },
  cuBg: () => A.r(0, 0, 1600, 900, '#1a1d2a', 0, 0),
  // interactive station group: glows when the player is near
  g: (id, inner) => `<g class="st" data-st="${id}">${inner}</g>`,

  // Room shell seen from above: tiled floor, back wall face, dark wall caps.
  room(W, H, c) {
    let o = `<defs><pattern id="tile" width="100" height="100" patternUnits="userSpaceOnUse">` +
      `<rect width="100" height="100" fill="${c.floor}"/><path d="M0 0H100M0 0V100" stroke="${c.line}" stroke-width="5" fill="none"/></pattern></defs>`;
    o += `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#tile)"/>`;
    o += A.r(0, 0, W, 250, c.wall, 0, 0);
    for (let x = 200; x < W; x += 400) o += A.line(x, 40, x, 225, c.wallD, 6);
    o += A.r(0, 225, W, 25, c.wallD, 0, 0) + A.line(0, 250, W, 250, OL, 6);
    o += A.r(60, 253, W - 120, 26, '#000', 0, 0, 'fill-opacity=".12"');
    o += A.r(-10, -10, W + 20, 46, C.cap, 0, 6) + A.r(-10, -10, 70, H + 20, C.cap, 0, 6);
    o += A.r(W - 60, -10, 70, H + 20, C.cap, 0, 6) + A.r(-10, H - 60, W + 20, 70, C.cap, 0, 6);
    return o;
  },

  // Player: small round maintenance robot. Feet at (0,0), facing right.
  // step: -1 idle, 0..3 walk frames.
  bot(step) {
    const lift = step === 0 ? [-10, 0] : step === 2 ? [0, -10] : [0, 0], bob = step % 2 ? -5 : 0;
    let o = '<ellipse cx="0" cy="2" rx="44" ry="13" fill="#000" fill-opacity=".22"/>';
    o += A.r(-30, -34 + lift[0], 22, 34, C.botD, 8, 6) + A.r(8, -34 + lift[1], 22, 34, C.botD, 8, 6);
    o += `<g transform="translate(0 ${bob})">`;
    o += A.r(-58, -78, 20, 32, C.botD, 9, 5);
    o += A.line(0, -112, 0, -134, OL, 6) + A.c(0, -140, 9, C.yellow, 5);
    o += '<clipPath id="botc"><rect x="-46" y="-116" width="92" height="90" rx="34"/></clipPath><g clip-path="url(#botc)">';
    o += A.r(-46, -116, 92, 90, C.bot, 0, 0) + A.r(-46, -48, 92, 30, C.botD, 0, 0) + '</g>';
    o += A.r(-46, -116, 92, 90, 'none', 34, 6);
    o += A.r(-4, -102, 46, 38, OL, 12, 0) + A.c(10, -83, 6, C.screen, 0) + A.c(28, -83, 6, C.screen, 0);
    o += A.c(-22, -60, 7, C.yellow, 4) + '</g>';
    return o;
  },

  doorTop(open, x, sign = 'EXIT') {
    let o = A.r(x, 36, 260, 214, C.panel, 10) + A.r(x + 75, -2, 110, 40, '#2fae57', 8) + A.t(x + 130, 18, 26, sign);
    if (open) return o + A.r(x + 18, 56, 224, 194, '#0c0e16', 4, 5) + A.r(x + 90, 70, 80, 12, C.on, 6, 0) +
      A.r(x + 10, 56, 16, 194, '#c3ccd9', 3, 4) + A.r(x + 234, 56, 16, 194, '#c3ccd9', 3, 4);
    for (const dx of [18, 130]) {
      const hx = x + dx;
      o += A.r(hx, 56, 112, 194, '#c3ccd9', 4, 5) + A.r(hx + 27, 80, 58, 70, C.screen, 10, 5);
      o += `<clipPath id="hz${hx}"><rect x="${hx + 6}" y="200" width="100" height="34"/></clipPath>`;
      o += A.r(hx + 6, 200, 100, 34, C.yellow, 0, 0) + `<g clip-path="url(#hz${hx})">`;
      for (let i = 0; i < 3; i++) o += A.p(`M${hx + 6 + i * 40} 234 L${hx + 22 + i * 40} 234 L${hx + 42 + i * 40} 200 L${hx + 26 + i * 40} 200Z`, OL, 0);
      o += '</g>' + A.r(hx + 6, 200, 100, 34, 'none', 0, 4);
    }
    return o;
  }
};

const ART = {};

// ---------- Room 1: Crew Quarters (2800 x 1400) ----------
ART.r1 = {
  // wall items are shifted right with translate() so the HUD never covers them
  map() {
    const f = S.f;
    let o = A.room(2800, 1400, { floor: '#a9b3c4', line: '#97a1b3', wall: '#6b7790', wallD: '#55607a' });
    // poster: star order clue
    let post = A.r(110, 55, 300, 160, '#24305a', 14) + A.r(124, 69, 272, 132, 'none', 8, 4);
    ['yellow', 'red', 'blue', 'green'].forEach((c, i) => post += A.star(170 + i * 60, 135, 24, C[c], 5));
    o += A.r(120, 36, 26, 214, C.metalD, 4, 5) + A.r(170, 36, 26, 214, C.metalD, 4, 5) + A.r(260, 80, 200, 110, '#3a4054', 12, 5);
    for (const y of [105, 135, 165]) o += A.line(285, y, 435, y, OL, 8);
    o += `<g transform="translate(480 0)">${A.g('poster', post)}</g>`;
    // storage locker + keypad
    let st;
    if (!f.locker) {
      st = A.r(520, 40, 280, 210, '#8e9bb0', 12) + A.line(660, 46, 660, 244, OL, 5);
      st += A.r(640, 120, 12, 50, C.metal, 6, 4) + A.r(668, 120, 12, 50, C.metal, 6, 4);
      for (const y of [70, 90]) st += A.line(550, y, 620, y, OL, 5) + A.line(700, y, 770, y, OL, 5);
    } else {
      st = A.r(520, 40, 280, 210, '#2a3042', 12) + A.r(536, 150, 248, 14, C.metalD, 4, 4);
      st += A.r(700, 100, 50, 50, C.green, 8, 4) + A.r(560, 190, 70, 40, C.red, 8, 4);
      if (!f.cardTaken) st += A.r(570, 112, 90, 40, C.white, 6, 4) + A.r(572, 120, 86, 8, C.blue, 0, 0);
      st += A.p('M520 40 L455 64 L455 262 L520 250Z', '#8e9bb0', 5);
    }
    const lit = f.locker ? C.on : f.wires ? C.screen : '#14161f';
    st += A.r(820, 100, 80, 110, C.panel, 10, 5) + A.r(832, 112, 56, 28, lit, 5, 4);
    for (let i = 0; i < 6; i++) st += A.r(834 + (i % 3) * 18, 152 + Math.floor(i / 3) * 22, 14, 14, C.metal, 3, 3);
    o += `<g transform="translate(440 0)">${A.g('storage', st)}</g>`;
    // exit door + symbol pad
    let dp = A.doorTop(f.door, 1050) + A.r(1325, 90, 90, 120, C.panel, 10, 5);
    dp += A.c(1400, 104, 7, f.door ? C.on : f.cardIn ? C.yellow : C.red, 3) + A.r(1338, 98, 46, 12, '#11131c', 4, 3);
    ['tri', 'circ', 'sq', 'star'].forEach((k, i) => {
      const x = 1350 + (i % 2) * 40, y = 140 + Math.floor(i / 2) * 40;
      dp += A.r(x - 15, y - 15, 30, 30, C.metal, 5, 3) + A.sym(k, x, y, 8, C.ink, 2);
    });
    o += `<g transform="translate(400 0)">${A.g('door', dp)}</g>`;
    // porthole (decor)
    o += '<g transform="translate(390 0)">' + A.c(1500, 130, 62, C.metal, 7) + A.c(1500, 130, 46, '#141a33', 6) + A.c(1515, 145, 14, C.purple, 4);
    for (const [x, y] of [[1480, 110], [1490, 155], [1520, 108]]) o += A.c(x, y, 3, '#fff', 0);
    o += '</g>';
    // numbered crew lockers
    let lk = '';
    [['blue', 2], ['green', 9], ['red', 7], ['yellow', 4]].forEach(([c, n], i) => {
      const x = 1620 + i * 170;
      lk += A.r(x, 40, 150, 210, C[c], 10, 0) + A.r(x + 118, 44, 28, 202, C[c + 'D'], 0, 0) + A.r(x, 40, 150, 210, 'none', 10, 5);
      lk += A.line(x + 30, 62, x + 110, 62, OL, 5) + A.line(x + 30, 80, x + 110, 80, OL, 5);
      lk += A.t(x + 70, 160, 96, n, '#fff', 10) + A.r(x + 14, 140, 14, 50, C.metal, 6, 4);
    });
    o += `<g transform="translate(360 0)">${A.g('lockers', lk)}</g>`;
    // loose floor panel (hidden fuse)
    let pn;
    if (!f.panel) {
      pn = A.r(620, 1120, 200, 110, C.metal, 10);
      for (const x of [660, 700, 740, 780]) pn += A.line(x, 1145, x, 1205, C.metalD, 8);
      pn += A.c(636, 1136, 6, C.metalD, 3) + A.c(804, 1136, 6, C.metalD, 3) + A.c(636, 1214, 6, C.metalD, 3) + A.c(804, 1214, 3, OL, 0);
      pn = `<g transform="rotate(-4 720 1175)">${pn}</g>`;
    } else {
      pn = A.r(620, 1120, 200, 110, '#151826', 10) + A.r(626, 1126, 188, 18, '#0b0d15', 4, 0);
      if (!f.fuseTaken) pn += A.r(684, 1160, 72, 30, '#bfe9ff', 12, 4) + A.r(670, 1156, 20, 38, C.yellow, 4, 4) + A.r(750, 1156, 20, 38, C.yellow, 4, 4);
      pn += A.r(850, 1130, 200, 110, C.metal, 10);
      for (const x of [890, 930, 970, 1010]) pn += A.line(x, 1155, x, 1215, C.metalD, 8);
    }
    return o + `<g transform="translate(0 -100)">${A.g('panel', pn)}</g>`;
  },

  // free-standing furniture, y-sorted with the player: { y: base line, svg }
  props() {
    const f = S.f, out = [];
    const bunk = (y0, id, col, stick) => {
      let o = A.r(80, y0, 380, 200, C.metalD, 14) + A.r(96, y0 + 14, 348, 150, C.white, 18);
      o += A.r(210, y0 + 10, 240, 158, col, 18) + A.r(112, y0 + 34, 80, 104, '#fff', 20);
      o += A.line(92, y0 + 180, 448, y0 + 180, OL, 5);
      if (stick) {
        o += A.r(360, y0 + 166, 84, 44, '#fdfdf2', 6, 4);
        ['red', 'blue', 'yellow', 'green'].forEach((c, i) => o += A.c(374 + i * 19, y0 + 188, 6, C[c], 2));
      }
      out.push({ y: y0 + 200, svg: A.g(id, o) });
    };
    bunk(330, 'sticker', C.blue, true);
    bunk(650, 'bunk', C.green, false);
    let t = A.r(900, 690, 400, 90, '#9c6633', 14) + A.r(900, 600, 400, 140, '#d39a5a', 16);
    t += A.c(980, 650, 22, C.red, 5) + A.c(1220, 690, 22, C.blue, 5) + A.r(1060, 632, 90, 60, C.dark, 8, 5) + A.r(1070, 642, 70, 40, C.screen, 4, 0);
    out.push({ y: 780, svg: `<g transform="translate(250 0)">${A.g('table', t)}</g>` });
    let fb = A.r(1900, 640, 200, 80, '#dfe5ee', 12) + A.r(1900, 700, 200, 160, C.metal, 12);
    fb += A.p('M1995 720 L1965 790 L1992 790 L1978 845 L2030 770 L2002 770 L2018 720Z', C.yellow, 5);
    fb += A.c(2070, 730, 11, f.wires ? C.on : f.fuse ? C.yellow : C.red, 4) + A.r(1925, 660, 150, 30, C.metalD, 8, 4);
    out.push({ y: 860, svg: `<g transform="translate(400 0)">${A.g('fusebox', fb)}</g>` });
    return out;
  }
};
