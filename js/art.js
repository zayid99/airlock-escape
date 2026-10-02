// SVG drawing helpers and wall art. All art is original, drawn in code.
const OL = '#1d2030';
const C = {
  red: '#e8453c', redD: '#a82a24', blue: '#3d6fe0', blueD: '#2747a0',
  yellow: '#f5cf3a', yellowD: '#c29a14', green: '#3fbf5a', greenD: '#278a3c',
  purple: '#9b59d0', purpleD: '#6c3a99',
  wall: '#9aa7b8', wallD: '#7c899c', floor: '#565e70', floorD: '#454b5c',
  metal: '#c8d0dc', metalD: '#97a2b3', panel: '#5a6378', dark: '#2c3142',
  screen: '#7fe3ff', on: '#5ef08a', white: '#f2f5fa', ink: '#2c3142'
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
  // room shell: ceiling, wall panels, baseboard, floor
  bg(wall = C.wall, wallD = C.wallD) {
    let o = A.r(-10, -10, 1620, 120, '#3b4258', 0, 0);
    for (const x of [470, 1060]) o += A.r(x, 30, 300, 26, '#fff6c8', 13, 5);
    o += A.r(-10, 100, 1620, 600, wall, 0, 0) + A.r(-10, 100, 1620, 26, wallD, 0, 0);
    for (const x of [400, 800, 1200]) o += A.line(x, 126, x, 680, wallD, 6);
    o += A.line(-10, 103, 1610, 103, OL, 6);
    o += A.r(-10, 680, 1620, 30, '#4a5168', 0, 6) + A.r(-10, 710, 1620, 200, C.floor, 0, 0);
    for (const x of [200, 600, 1000, 1400]) o += A.line(x, 710, x + (x - 800) * 0.4, 900, C.floorD, 6);
    o += A.line(-10, 790, 1610, 790, C.floorD, 6);
    return o;
  },
  door(open, hsClosed, hsOpen) {
    let o = A.r(690, 110, 480, 590, C.panel, 16) + A.r(860, 26, 140, 60, '#2fae57', 10) + A.t(930, 57, 36, 'EXIT');
    if (open) {
      const d = A.r(720, 140, 420, 560, '#0c0e16', 6) + A.p('M760 700 L1100 700 L1030 520 L830 520Z', '#262c44', 0) +
        A.r(880, 170, 100, 16, C.on, 8, 0);
      return o + A.hs(hsOpen, d) + A.r(706, 140, 26, 560, '#c3ccd9', 4) + A.r(1128, 140, 26, 560, '#c3ccd9', 4);
    }
    let d = '';
    for (const x of [720, 930]) {
      d += A.r(x, 140, 210, 560, '#c3ccd9', 6) + A.r(x + 50, 210, 110, 170, C.screen, 14);
      d += `<clipPath id="hz${x}"><rect x="${x + 12}" y="616" width="186" height="60"/></clipPath>`;
      d += A.r(x + 12, 616, 186, 60, C.yellow, 4, 0) + `<g clip-path="url(#hz${x})">`;
      for (let i = 0; i < 4; i++) d += A.p(`M${x + 12 + i * 50} 676 L${x + 37 + i * 50} 676 L${x + 62 + i * 50} 616 L${x + 37 + i * 50} 616Z`, OL, 0);
      d += '</g>' + A.r(x + 12, 616, 186, 60, 'none', 4, 5);
    }
    return o + A.hs(hsClosed, d);
  }
};

const ART = {};

// ---------- Room 1: Crew Quarters ----------
ART.r1 = [
  // North: bunk, wiring sticker, porthole
  () => {
    let bunk = '';
    for (const y of [280, 550]) {
      bunk += A.r(170, y + 50, 600, 36, C.metalD, 8) + A.r(210, y, 500, 56, C.white, 22);
      bunk += A.r(340, y - 4, 370, 64, y < 400 ? C.blue : C.green, 22) + A.r(228, y - 16, 100, 46, '#fff', 20);
    }
    bunk += A.r(160, 170, 40, 530, C.metal, 8) + A.r(740, 170, 40, 530, C.metal, 8);
    let stick = A.r(830, 330, 130, 96, '#fdfdf2', 10, 5);
    ['red', 'blue', 'yellow', 'green'].forEach((c, i) => stick += A.c(856 + i * 26, 362, 9, C[c], 3));
    stick += A.line(850, 400, 940, 400, '#9aa', 5);
    let port = A.c(1250, 360, 150, C.metal, 8);
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      port += A.c(1250 + 132 * Math.cos(a), 360 + 132 * Math.sin(a), 8, C.metalD, 4);
    }
    port += A.c(1250, 360, 112, '#141a33', 7);
    for (const [x, y] of [[1190, 300], [1230, 420], [1300, 290], [1170, 380], [1320, 340]]) port += A.c(x, y, 4, '#fff', 0);
    port += A.c(1290, 400, 36, C.purple, 5) + A.p('M1245 410 Q1290 380 1335 392', 'none', 5);
    return A.bg() + A.hs('bunk', bunk) + A.hs('sticker', stick, A.pad(800, 300, 190, 156)) + A.hs('porthole', port);
  },
  // East: star poster, numbered crew lockers
  () => {
    let post = A.r(110, 170, 460, 320, '#24305a', 16) + A.r(132, 192, 416, 276, 'none', 10, 4);
    ['yellow', 'red', 'blue', 'green'].forEach((c, i) => post += A.star(190 + i * 100, 330, 40, C[c], 5));
    let lk = '';
    [['blue', 2], ['green', 9], ['red', 7], ['yellow', 4]].forEach(([c, n], i) => {
      const x = 680 + i * 210;
      lk += A.r(x, 150, 190, 540, C[c], 12, 0) + A.r(x + 150, 156, 34, 528, C[c + 'D'], 0, 0) + A.r(x, 150, 190, 540, 'none', 12);
      for (const y of [195, 220, 245]) lk += A.line(x + 40, y, x + 140, y, OL, 6);
      lk += A.t(x + 95, 400, 150, n, '#fff', 12) + A.r(x + 20, 470, 22, 80, C.metal, 8);
    });
    return A.bg() + A.hs('poster', post) + A.hs('locker', lk);
  },
  // South: fuse box, keypad, storage locker
  () => {
    const f = S.f;
    let fb = A.r(320, 100, 40, 110, C.metalD, 0) + A.r(180, 200, 340, 340, C.metal, 16) + A.r(205, 225, 290, 290, 'none', 10, 4);
    fb += A.p('M350 280 L300 380 L345 380 L320 470 L405 350 L358 350 L385 280Z', C.yellow, 6);
    fb += A.c(460, 255, 16, f.wires ? C.on : f.fuse ? C.yellow : C.red, 4);
    const lit = f.locker ? C.on : f.wires ? C.screen : '#14161f';
    let kp = A.r(580, 320, 140, 200, C.panel, 14) + A.r(600, 340, 100, 50, lit, 6, 4);
    for (let i = 0; i < 9; i++) kp += A.r(606 + (i % 3) * 30, 404 + Math.floor(i / 3) * 34, 24, 24, C.metal, 5, 3);
    let st;
    if (!f.locker) {
      st = A.r(760, 130, 420, 560, '#8e9bb0', 16) + A.line(970, 140, 970, 680, OL, 6);
      st += A.r(930, 380, 18, 90, C.metal, 8, 5) + A.r(992, 380, 18, 90, C.metal, 8, 5);
      for (const y of [190, 215, 240]) st += A.line(800, y, 930, y, OL, 6) + A.line(1010, y, 1140, y, OL, 6);
      st = A.hs('storage', st);
    } else {
      st = A.r(760, 130, 420, 560, '#2a3042', 16) + A.r(780, 330, 380, 20, C.metalD, 4, 5) + A.r(780, 510, 380, 20, C.metalD, 4, 5);
      st += A.r(820, 450, 90, 60, C.red, 10, 5) + A.r(1030, 260, 70, 70, C.green, 10, 5);
      if (!f.cardTaken) st += A.hs('keycard', A.r(900, 270, 110, 60, C.white, 8, 5) + A.r(903, 282, 104, 12, C.blue, 0, 0) + A.r(912, 304, 22, 16, C.yellow, 3, 3), A.pad(870, 240, 170, 110));
      st += A.p('M1180 130 L1300 170 L1300 650 L1180 690Z', '#8e9bb0');
    }
    return A.bg() + A.hs('fusebox', fb) + A.hs('keypad', kp, A.pad(570, 310, 160, 220)) + st;
  },
  // West: loose wall panel, exit door
  () => {
    const f = S.f;
    let pn;
    if (!f.panel) {
      pn = A.r(140, 370, 320, 270, C.metal, 10);
      for (const y of [420, 450, 480]) pn += A.line(200, y, 400, y, C.metalD, 8);
      pn += A.c(168, 396, 10, C.metalD, 4) + A.c(432, 396, 10, C.metalD, 4) + A.c(168, 614, 10, C.metalD, 4) + A.c(432, 614, 5, OL, 0);
      pn = A.hs('panel', `<g transform="rotate(-3 300 505)">${pn}</g>`);
    } else {
      pn = A.r(140, 370, 320, 270, '#151826', 10) + A.r(150, 380, 300, 34, '#0b0d15', 4, 0);
      if (!f.fuseTaken) pn += A.hs('fuse', A.r(255, 540, 100, 44, '#bfe9ff', 14, 5) + A.r(236, 536, 30, 52, C.yellow, 6, 5) + A.r(344, 536, 30, 52, C.yellow, 6, 5), A.pad(200, 500, 210, 120));
      pn += A.p('M110 760 L470 760 L510 830 L70 830Z', C.metal);
    }
    let dp = A.r(1220, 300, 180, 240, C.panel, 14) + A.r(1250, 330, 100, 26, '#11131c', 6, 5);
    dp += A.c(1375, 343, 11, f.door ? C.on : f.cardIn ? C.yellow : C.red, 3);
    ['tri', 'circ', 'sq', 'star'].forEach((k, i) => {
      const x = 1275 + (i % 2) * 70, y = 410 + Math.floor(i / 2) * 70;
      dp += A.r(x - 26, y - 26, 52, 52, C.metal, 8, 4) + A.sym(k, x, y, 13, C.ink, 3);
    });
    return A.bg() + pn + A.door(f.door, 'door', 'exit') + A.hs('door', dp);
  }
];
