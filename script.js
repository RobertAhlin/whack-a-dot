const BOARD_SIZE = 5;
const TOTAL_TRIES = 20;
const DOT_VISIBLE_MS = 700;
const ROUND_GAP_MS = 250;
const COUNTDOWN_START = 5;

const boardEl = document.getElementById("board");
const hitsEl = document.getElementById("hits");
const missesEl = document.getElementById("misses");
const triesEl = document.getElementById("tries");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

const cells = [];
let hits = 0;
let misses = 0;
let tries = 0;
let activeIndex = null;
let isRoundHit = false;
let isPlaying = false;
let gameTimeout = null;
let countdownInterval = null;

function createBoard() {
  boardEl.innerHTML = "";
  cells.length = 0;

  for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i += 1) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "cell";
    cell.setAttribute("aria-label", `Grid cell ${i + 1}`);
    cell.disabled = true;

    cell.addEventListener("click", () => {
      if (!isPlaying || activeIndex !== i || isRoundHit) {
        return;
      }

      isRoundHit = true;
      hits += 1;
      updateHUD();
      clearActiveCell();
      statusEl.textContent = "Nice hit!";
    });

    cells.push(cell);
    boardEl.appendChild(cell);
  }
}

function updateHUD() {
  hitsEl.textContent = String(hits);
  missesEl.textContent = String(misses);
  triesEl.textContent = `${tries} / ${TOTAL_TRIES}`;
}

function clearActiveCell() {
  if (activeIndex === null) {
    return;
  }

  cells[activeIndex].classList.remove("active");
  activeIndex = null;
}

function setBoardEnabled(enabled) {
  cells.forEach((cell) => {
    cell.disabled = !enabled;
  });
}

function endGame() {
  isPlaying = false;
  clearTimeout(gameTimeout);
  clearActiveCell();
  setBoardEnabled(false);
  startBtn.disabled = false;
  statusEl.textContent = `Game over! You made ${hits} successful hits out of ${TOTAL_TRIES} tries.`;
}

function playRound() {
  if (!isPlaying) {
    return;
  }

  if (tries >= TOTAL_TRIES) {
    endGame();
    return;
  }

  tries += 1;
  isRoundHit = false;

  let nextIndex = Math.floor(Math.random() * cells.length);
  if (activeIndex !== null && cells.length > 1) {
    while (nextIndex === activeIndex) {
      nextIndex = Math.floor(Math.random() * cells.length);
    }
  }

  clearActiveCell();
  activeIndex = nextIndex;
  cells[activeIndex].classList.add("active");
  updateHUD();
  statusEl.textContent = `Round ${tries}: click the glowing dot!`;

  gameTimeout = setTimeout(() => {
    if (!isRoundHit) {
      misses += 1;
      updateHUD();
    }

    clearActiveCell();

    if (tries >= TOTAL_TRIES) {
      endGame();
      return;
    }

    gameTimeout = setTimeout(playRound, ROUND_GAP_MS);
  }, DOT_VISIBLE_MS);
}

function startCountdown() {
  let count = COUNTDOWN_START;
  statusEl.textContent = `Get ready... ${count}`;

  countdownInterval = setInterval(() => {
    count -= 1;

    if (count > 0) {
      statusEl.textContent = `Get ready... ${count}`;
      return;
    }

    clearInterval(countdownInterval);
    countdownInterval = null;
    statusEl.textContent = "Go!";
    playRound();
  }, 1000);
}

function resetGameState() {
  clearTimeout(gameTimeout);
  clearInterval(countdownInterval);
  gameTimeout = null;
  countdownInterval = null;

  hits = 0;
  misses = 0;
  tries = 0;
  isRoundHit = false;
  isPlaying = false;

  clearActiveCell();
  updateHUD();
  setBoardEnabled(false);
  startBtn.disabled = false;
  statusEl.textContent = "Press Start to begin.";
}

startBtn.addEventListener("click", () => {
  if (isPlaying) {
    return;
  }

  resetGameState();
  isPlaying = true;
  startBtn.disabled = true;
  setBoardEnabled(true);
  startCountdown();
});

resetBtn.addEventListener("click", () => {
  resetGameState();
});

createBoard();
resetGameState();
