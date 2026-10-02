// Items, inventory bar, item selection and combining.
const ITEMS = {
  fuse: {
    name: 'Fuse',
    icon: () => A.r(26, 36, 48, 28, '#bfe9ff', 12, 5) + A.r(10, 32, 20, 36, C.yellow, 4, 5) + A.r(70, 32, 20, 36, C.yellow, 4, 5),
    big: () => A.r(600, 380, 400, 140, '#bfe9ff', 60, 8) + A.p('M640 450 L700 420 L760 480 L820 420 L880 480 L940 450', 'none', 6) +
      A.r(540, 365, 100, 170, C.yellow, 20, 8) + A.r(960, 365, 100, 170, C.yellow, 20, 8) + A.line(660, 405, 760, 405, '#fff', 8)
  },
  keycard: {
    name: 'Keycard',
    icon: () => A.r(10, 24, 80, 52, C.white, 8, 0) + A.r(10, 34, 80, 10, C.blue, 0, 0) + A.r(18, 52, 18, 14, C.yellow, 3, 3) + A.r(10, 24, 80, 52, 'none', 8, 5),
    big: () => {
      let o = A.t(475, 190, 40, 'FRONT', '#cfd6e2') + A.t(1125, 190, 40, 'BACK', '#cfd6e2');
      o += A.r(200, 250, 550, 350, C.white, 30, 0) + A.r(200, 300, 550, 60, C.blue, 0, 0) + A.r(200, 250, 550, 350, 'none', 30, 8);
      o += A.r(260, 430, 100, 80, C.yellow, 12, 6) + A.line(420, 450, 680, 450, C.metalD, 10) + A.line(420, 490, 600, 490, C.metalD, 10);
      o += A.r(850, 250, 550, 350, C.white, 30, 8);
      ['tri', 'sq', 'circ', 'star'].forEach((k, i) => o += A.sym(k, 919 + i * 137, 425, 46, C.ink, 6));
      return o;
    }
  }
};

// [itemA, itemB, result, message]
const RECIPES = [];

const INV = {
  slots: 6,
  render() {
    let h = '';
    for (let i = 0; i < INV.slots; i++) {
      const id = S.inv[i];
      h += id
        ? `<button class="slot${S.sel === id ? ' sel' : ''}" data-item="${id}" title="${ITEMS[id].name}"><svg viewBox="0 0 100 100">${ITEMS[id].icon()}</svg></button>`
        : '<div class="slot"></div>';
    }
    document.getElementById('inv').innerHTML = h;
    document.getElementById('invname').textContent = S.sel
      ? ITEMS[S.sel].name + ' selected'
      : S.inv.length ? 'Items are used automatically with USE' : '';
    document.getElementById('inspect').disabled = !S.sel;
  },
  click(id) {
    if (S.sel === id) S.sel = null;
    else if (S.sel) {
      const r = RECIPES.find(([a, b]) => (a === S.sel && b === id) || (a === id && b === S.sel));
      if (r) {
        G.drop(r[0]); G.drop(r[1]); G.take(r[2]); G.msg(r[3]); G.sfx('success');
      } else {
        G.msg("Those don't combine."); G.sfx('error');
      }
      S.sel = null;
    } else S.sel = id;
    G.sfx('click');
  },
  cu: id => ({ draw: () => A.cuBg() + A.t(800, 90, 54, ITEMS[id].name.toUpperCase(), C.yellow, 10) + ITEMS[id].big(), hs: {} })
};
