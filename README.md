# Whack-a-Dot

A fast-paced browser game built with plain HTML, CSS, and JavaScript.

Click active dots before they disappear and maximize your score before time runs out.

## Latest Version Highlights

- 5x5 board (25 cells)
- 3-second pre-game countdown
- 10-second game duration
- Real-time HUD with:
  - hits
  - misses
  - score
  - time left
- Dynamic points per hit based on reaction speed:
  - fast hit = up to +10
  - slow hit = minimum +1
- Miss penalty: -5 points
- Adaptive intensity:
  - game can show 1 or 2 active dots
  - chance of 2 dots increases with good hit speed
- Start and Reset controls
- Mobile-friendly input handling (`click`, `touchend`, `pointerup`)
- Timer fallback for Safari/iOS compatibility (`performance.now()` with `Date.now()` fallback)

## How to Run

1. Open this project folder.
2. Open `index.html` in a browser.

No build step or dependencies are required.

## How to Play

1. Click **Start Game**.
2. Wait for the 3-second countdown.
3. Hit active glowing dots as quickly as possible.
4. Keep playing until the 10-second timer ends.
5. Review your final score summary.

Use **Reset** any time to return to the initial state.

## Scoring Rules

- **Hit**: Click an active dot before it times out.
- **Hit points**: From +1 to +10 depending on how quickly you react.
- **Miss**: If a dot expires, you get +1 miss and -5 score.

## Project Structure

- `index.html`: App layout, HUD, controls, and board container.
- `style.css`: Visual design, responsive behavior, animations, and dot states.
- `script.js`: Game logic (countdown, timing, spawning, scoring, reset, end state).

## Notes

This project stays lightweight and framework-free so it is easy to read, tweak, and extend.
