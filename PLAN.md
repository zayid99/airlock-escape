# Airlock Escape — Plan (v2: top-down walking)

Solo top-down 2D escape game in the style of a cartoon spaceship task game.
You walk a character around each room, walk up to stations, press USE, and solve
puzzles in a pop-up panel. Solve all 4 tasks in a room to open the exit door.
Flat colors, thick dark outlines, all art original inline SVG (no copied
characters, logos, maps or names).

## Player character (original design)
Small round maintenance robot: round body, dark screen face with two glowing
eyes, short antenna, stubby legs, colored chest panel. Walk cycle (leg swap +
bob), faces left/right. Not a copy of any existing character.

## Controls
- Desktop: WASD / arrow keys to walk, E or Space = USE, click a spot to walk there.
- Mobile: on-screen joystick (bottom-left), USE button (bottom-right).
- USE button lights up when you stand next to something usable.

## HUD / game features
- Task list (top-left) with checkmarks; task progress bar across the top.
- USE button (bottom-right); inventory bar (bottom).
- MAP button: overlay of the current room with your position and task markers.
- Settings gear: mute, restart room, new game.
- Hint button: one nudge per task.
- Pop-up puzzle panels (wires, keypad, symbols, tiles, levers) with close button.
- Title screen, room-clear screen with time, final escape screen.
- Web Audio sounds: click, pickup, success, error, footsteps, door. Save in localStorage.

Not included (they need other players or servers): multiplayer, impostors,
kill/report/vote, chat, cosmetics shop.

## Tech / files
Vanilla HTML/CSS/JS, no build, runs from index.html, static Netlify deploy.
Room = static SVG map; the player is an SVG group moved each frame
(requestAnimationFrame). Camera follows the player inside a 16:9 viewport.
Collision = list of blocking rectangles per room.

```
index.html, style.css
js/art.js        drawing helpers, room maps, character, puzzle-panel art
js/player.js     NEW: movement, collision, camera, joystick, keyboard
js/rooms.js      room layouts: size, walls/colliders, stations, task chains
js/puzzles.js    puzzle widgets (reused from Phase 1)
js/inventory.js  inventory bar, combine, inspect (reused from Phase 1)
js/game.js       state, HUD, task list, map, screens, save/load, sound, hints
```

## Room 1 — Crew Quarters (one room ~2 screens wide)
Stations around the room: bunks with wiring sticker, star poster, 4 numbered
lockers, fuse box, storage locker + keypad, loose wall panel, exit door.
Tasks (same chain and solutions as before):
1. **Find a fuse**: USE loose wall panel → slides aside → Fuse.
2. **Fix wiring**: USE fuse box with Fuse → wires: Red→★, Blue→▲, Yellow→■, Green→●
   (sticker by the bunks).
3. **Open storage**: keypad code **4729** (poster star order Yellow, Red, Blue, Green +
   locker numbers Red=7, Blue=2, Green=9, Yellow=4) → Keycard.
4. **Unlock exit**: USE door with Keycard, enter **▲ ■ ● ★** (back of keycard) → walk out.

## Room 2 — Engine Room
1. **Set levers**: 5 levers to schematic arrows **Up, Down, Up, Up, Down** → coolant
   tank drains → Battery. Toolbox gives empty Flashlight.
2. **Build UV torch**: combine Flashlight + Battery.
3. **Align panel**: USE UV torch on dark wall → shows target picture; solve 3×3
   sliding tiles to match.
4. **Unlock exit**: picture shows **3168** → exit keypad.

## Room 3 — Bridge / Airlock
1. **Move crate**: push crate aside → Chip Half A.
2. **Fix junction**: wires Red→4, Blue→1, Yellow→5, Green→2, Purple→3 (manual on wall)
   → drawer → Chip Half B.
3. **Repair chip**: combine halves → Nav Chip.
4. **Launch airlock**: insert Nav Chip, press **Sun → Planet → Moon → Comet → Star**
   (star chart) → escape.

## Phases
- [x] Plan v1, Phase 1 (point-and-click engine + Room 1; puzzle widgets, inventory,
  save are kept and reused)
- [ ] Phase 1b: top-down engine (character, movement, collision, camera, joystick,
  USE button, task list, progress bar) + Room 1 rebuilt as a walkable map
- [ ] Phase 2: Room 2
- [ ] Phase 3: Room 3, map overlay, settings, hints, title/end screens, sound
- [ ] Phase 4: polish / bug fixes
