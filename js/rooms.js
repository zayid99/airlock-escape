// Room data: hotspot handlers and close-up views. Wall art lives in art.js.
// Hotspot = function (look) or { look, use: { itemId: fn } }.
const F = () => S.f;

// ---------- Room 1: Crew Quarters ----------
const R1W = {
  key: 'w1', left: ['red', 'blue', 'yellow', 'green'], right: ['circ', 'star', 'tri', 'sq'], ans: [1, 2, 3, 0],
  label: (j, x, y) => A.sym(R1W.right[j], x, y, 24),
  solved: () => !!F().wires,
  done() { F().wires = 1; G.close(); G.msg('Power restored! The keypad by the locker lights up.'); }
};
const R1K = {
  key: 'k1', code: '4729', powered: () => !!F().wires, solved: () => !!F().locker,
  done() { F().locker = 1; G.close(); G.msg('Click! The storage locker swings open.'); }
};
const R1S = {
  key: 's1', syms: ['tri', 'circ', 'sq', 'star'], ans: ['tri', 'sq', 'circ', 'star'], off: 'INSERT CARD',
  active: () => !!F().cardIn, solved: () => !!F().door,
  done() { F().door = 1; G.close(); G.msg('The exit door slides open!'); }
};

function r1Fuse() {
  G.drop('fuse'); F().fuse = 1; G.sfx('click'); G.open('fusebox');
  G.msg('The fuse clicks into place. Now fix the wiring.');
}
function r1Card() {
  G.drop('keycard'); F().cardIn = 1; G.sfx('click'); G.open('door');
  G.msg('Card accepted. The symbol pad lights up.');
}

const ROOMS = [{
  name: 'CREW QUARTERS',
  walls: ART.r1,
  hs: {
    bunk: () => G.msg('Neatly made bunks. Nothing hidden in the sheets.'),
    sticker: () => G.open('sticker'),
    porthole: () => G.msg('Just stars out there. No way out.'),
    poster: () => G.open('poster'),
    locker: () => G.msg('Welded shut. Only a big painted number.'),
    fusebox: { look: () => G.open('fusebox'), use: { fuse: r1Fuse } },
    keypad: () => G.open('keypad'),
    storage: () => G.msg(F().wires ? 'Locked. Try the keypad beside it.' : 'Locked. The keypad beside it has no power.'),
    keycard: () => { F().cardTaken = 1; G.take('keycard'); },
    panel: () => { F().panel = 1; G.sfx('click'); G.msg('The loose panel slides aside!'); },
    fuse: () => { F().fuseTaken = 1; G.take('fuse'); },
    door: { look: () => G.open('door'), use: { keycard: r1Card } },
    exit: () => G.complete()
  },
  cu: {
    sticker: {
      draw() {
        let o = A.cuBg() + A.r(450, 110, 700, 680, '#fdfdf2', 24, 8) + A.t(800, 185, 54, 'WIRING', OL);
        [['red', 'star'], ['blue', 'tri'], ['yellow', 'sq'], ['green', 'circ']].forEach(([c, k], i) => {
          const y = 300 + i * 125;
          o += A.r(540, y - 25, 260, 50, C[c], 25, 6) + A.line(840, y, 930, y, OL, 8) + A.p(`M905 ${y - 20} L935 ${y} L905 ${y + 20}`, 'none', 8);
          o += A.sym(k, 1020, y, 40);
        });
        return o;
      }
    },
    poster: {
      draw() {
        let o = A.cuBg() + A.r(250, 150, 1100, 600, '#24305a', 30, 8) + A.r(290, 190, 1020, 520, 'none', 20, 5);
        ['yellow', 'red', 'blue', 'green'].forEach((c, i) => o += A.star(425 + i * 250, 450, 90, C[c], 8));
        return o;
      }
    },
    fusebox: {
      draw() {
        let o = A.cuBg() + A.r(120, 30, 1360, 840, C.metal, 30, 8) + A.r(160, 210, 1280, 620, '#3a4054', 20, 6);
        let sock = A.r(620, 70, 360, 120, '#262b3d', 16, 6);
        if (F().fuse) sock += A.r(700, 105, 200, 50, '#bfe9ff', 20, 5) + A.r(670, 98, 40, 64, C.yellow, 6, 5) + A.r(890, 98, 40, 64, C.yellow, 6, 5);
        else sock += A.r(660, 100, 30, 60, C.metalD, 4, 5) + A.r(910, 100, 30, 60, C.metalD, 4, 5) + A.t(800, 130, 30, 'FUSE', C.metalD);
        o += A.hs('socket', sock);
        if (F().fuse) o += PUZ.wires.draw(R1W);
        else o += A.t(800, 520, 52, 'NO POWER', C.red);
        return o;
      },
      hs: Object.assign({
        socket: { look: () => G.msg(F().fuse ? 'The fuse is snug in its socket.' : 'An empty fuse socket.'), use: { fuse: r1Fuse } }
      }, PUZ.wires.hs(R1W))
    },
    keypad: { draw: () => A.cuBg() + PUZ.keypad.draw(R1K), hs: PUZ.keypad.hs(R1K) },
    door: {
      draw() {
        let o = A.cuBg() + A.r(100, 60, 1400, 780, C.panel, 30, 8) + A.r(200, 200, 460, 440, '#3a4054', 20, 6);
        let slot = '';
        if (F().cardIn) slot += A.r(330, 240, 200, 120, C.white, 10, 6) + A.r(330, 262, 200, 22, C.blue, 0, 0);
        slot += A.r(260, 330, 340, 50, '#11131c', 10, 6) + A.c(430, 500, 30, F().door ? C.on : F().cardIn ? C.yellow : C.red, 6);
        o += A.hs('slot', slot) + A.t(430, 580, 34, 'CARD', '#cfd6e2');
        return o + PUZ.symbols.draw(R1S, 760, 180, 640);
      },
      hs: Object.assign({
        slot: { look: () => G.msg(F().cardIn ? 'The card is in.' : 'A card slot.'), use: { keycard: r1Card } }
      }, PUZ.symbols.hs(R1S))
    }
  }
}];
