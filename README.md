# Whack-a-Dot

A small browser game built with plain HTML, CSS, and JavaScript.

The goal is simple: click the glowing square before it disappears.

## Features

- 5x5 game board (25 cells)
- Random active cell each round
- 5-second countdown before the game starts
- Score tracking for:
  - successful hits
  - misses
  - tries used
- Game ends after 20 tries
- Final result message showing total successful hits
- Start and Reset controls

## How to Run

1. Open this project folder.
2. Open `index.html` in a browser.

No build tools or dependencies are required.

## How to Play

1. Click **Start Game**.
2. Wait for the 5-second countdown.
3. Click the glowing square as quickly as possible.
4. Continue until all 20 tries are completed.
5. Read your final score.

Use **Reset** at any time to restart the game state.

## Scoring Rules

- **Hit**: You clicked the currently glowing square before it disappeared.
- **Miss**: The glowing square disappeared before you clicked it.
- **Tries**: One glowing appearance counts as one try.

Total tries are fixed at **20**.

## Project Structure

- `index.html`: Page layout, score display, game board, and buttons.
- `style.css`: Visual style, responsive layout, and active cell effects.
- `script.js`: Game logic (countdown, rounds, scoring, end-game, reset).

## Notes

This project is intentionally lightweight and framework-free to keep the logic easy to understand and modify.
