# Airlock Escape — Plan

2D point-and-click escape room. 3 rooms × 4 walls, 4 chained puzzles per room.
Flat sci-fi art drawn in inline SVG (original, no external images).

## File structure

```
index.html        page shell: title screen, scene, inventory bar, overlays
style.css         layout, 16:9 scaling stage, buttons, overlays
js/art.js         SVG drawing helpers + all wall/object/close-up art
js/rooms.js       room data: 4 walls per room, hotspots, close-up definitions
js/puzzles.js     puzzle logic (keypad, wires, tiles, levers, symbols, panel)
js/inventory.js   inventory bar, select item, combine items, use-on-target
js/game.js        state, navigation, save/load (localStorage), screens, sound, hints
```

Engine: one `<svg viewBox="0 0 1600 900">` scene scaled to fit (letterboxed).
Hotspots are SVG shapes with click/touch handlers. Close-ups are an overlay with
their own SVG. Left/right arrows rotate N→E→S→W. State saved after every action.

## Room 1 — Crew Quarters

| Wall | Contents |
|------|----------|
| North | Bunk beds; color-code sticker on bunk frame |
| East | Poster with 4 colored stars in a row; 4 numbered lockers |
| South | Fuse box (dead), storage locker with keypad |
| West | Loose wall panel; EXIT door with symbol pad + card slot |

Chain:
1. **Hidden panel** (West): click loose panel → it slides aside → **Fuse**.
2. **Wire matching** (South): use Fuse on fuse box → box opens, 4 wires
   (Red, Blue, Yellow, Green) to 4 symbol ports. Sticker (North) says:
   **Red→★, Blue→▲, Yellow→■, Green→●**. Correct → locker keypad powers on.
3. **Keypad** (South locker): Poster star order (East) = **Yellow, Red, Blue, Green**;
   locker numbers painted in those colors: Red=7, Blue=2, Green=9, Yellow=4.
   Code **4729** → locker opens → **Keycard**.
4. **Symbol sequence** (West exit): use Keycard on door slot → symbol pad unlocks.
   Back of keycard (inspect in inventory) shows **▲ ■ ● ★**. Correct → door opens.

## Room 2 — Engine Room

| Wall | Contents |
|------|----------|
| North | Schematic: 5 gauges with arrows (up/down) |
| East | Toolbox (open) with empty flashlight; 5 levers |
| South | Coolant tank (full); sliding tile panel (3×3) |
| West | Dark wall (blank under normal light); EXIT door with keypad |

Chain:
1. **Lever combination** (East): schematic (North) arrows give
   **Up, Down, Up, Up, Down** → coolant tank drains → **Battery** visible in tank.
   Toolbox gives **Flashlight (empty)** anytime.
2. **Item combination**: Flashlight + Battery → **UV Torch**.
3. **Sliding tiles** (South): use UV Torch on dark West wall → glowing mural
   shows the finished tile picture (reactor emblem with "3168").
   Solve the 3×3 slide panel to match (start is a fixed solvable shuffle).
4. **Keypad** (West exit): solved tile picture shows **3168** → door opens.

## Room 3 — Bridge / Airlock

| Wall | Contents |
|------|----------|
| North | Wiring manual on wall (color → terminal number) |
| East | Wire junction box (5 wires, 5 numbered terminals) + drawer |
| South | Star chart: 5 symbols connected by a numbered line |
| West | Cargo crate (movable); AIRLOCK door with chip slot + 5 symbol buttons |

Chain:
1. **Hidden panel** (West): push crate aside → **Chip Half A** on floor behind it.
2. **Wire matching** (East): manual (North): **Red→4, Blue→1, Yellow→5,
   Green→2, Purple→3** → drawer pops open → **Chip Half B**.
3. **Item combination**: Chip A + Chip B → **Nav Chip**.
4. **Symbol sequence** (West airlock): use Nav Chip on slot → 5 buttons active.
   Star chart order (South): **Sun → Planet → Moon → Comet → Star** → escape.

## Hints (one nudge per puzzle)
- R1: "That west wall panel looks loose." / "Fuse box needs power… and the bunk sticker." /
  "Poster colors, locker colors." / "Flip the keycard over."
- R2: "The schematic arrows match the levers." / "Flashlights need batteries." /
  "Shine UV on the blank wall." / "The finished picture holds the number."
- R3: "That crate isn't bolted down." / "Read the manual on the north wall." /
  "Two halves make a whole." / "Follow the numbered line on the star chart."

## Screens / systems
- Title (Start / Continue), room-complete (time taken), final escape (total time).
- Web Audio beeps: click, pickup, success, error. Mute toggle.
- localStorage: room, wall, inventory, solved flags, timers, mute.

## Phases
- [x] Plan
- [x] Phase 1: engine + Room 1 (nav, close-ups, inventory select/use/inspect/combine,
  save/load, wires/keypad/symbol widgets, basic room-clear screen).
  Dev tip: open `index.html?new` to wipe the save.
- [ ] Phase 2: Room 2
- [ ] Phase 3: Room 3, title/end screens, sound, hints
- [ ] Phase 4: polish / bug fixes
