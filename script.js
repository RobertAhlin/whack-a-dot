const BOARD_SIZE = 5;
const GAME_DURATION_MS = 10000;
const DOT_VISIBLE_MS = 2000;
const COUNTDOWN_START = 3;

const boardEl = document.getElementById("board");
const appEl = document.querySelector(".app");
const hitsEl = document.getElementById("hits");
const missesEl = document.getElementById("misses");
const scoreEl = document.getElementById("score");
const timeLeftEl = document.getElementById("timeLeft");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

const cells = [];
let hits = 0;
let misses = 0;
let score = 0;
let isPlaying = false;
let isCountingDown = false;
let timeRemainingMs = GAME_DURATION_MS;
let gameEndTimeout = null;
let gameTimerInterval = null;
let countdownInterval = null;
let gameStartedAt = 0;
let speedMomentum = 0;

const activeTargets = new Map();

function nowMs() {
  if (window.performance && typeof window.performance.now === "function") {
    return window.performance.now();
  }

  return Date.now();
}

function formatTime(ms) {
  return `${(Math.max(0, ms) / 1000).toFixed(1)}s`;
}

function calculatePoints(hitElapsedMs) {
  const clampedElapsed = Math.min(DOT_VISIBLE_MS, Math.max(0, hitElapsedMs));
  const lifeRatio = clampedElapsed / DOT_VISIBLE_MS;

  return Math.max(1, 10 - Math.floor(lifeRatio * 9));
}

function handleCellHit(cellIndex) {
  if (!isPlaying) {
    return;
  }

  const target = activeTargets.get(cellIndex);
  if (!target) {
    return;
  }

  clearTarget(cellIndex);

  const hitElapsedMs = nowMs() - target.spawnedAt;
  const gainedPoints = calculatePoints(hitElapsedMs);
  const speedQuality = 1 - Math.min(1, hitElapsedMs / DOT_VISIBLE_MS);

  hits += 1;
  score += gainedPoints;
  speedMomentum = Math.min(1, speedMomentum * 0.6 + speedQuality * 0.7);

  updateHUD();
  flashHitFrame();
  statusEl.textContent = `Nice hit! +${gainedPoints} points`;

  refillTargets();
}

function createBoard() {
  boardEl.innerHTML = "";
  cells.length = 0;

  for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i += 1) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "cell";
    cell.setAttribute("aria-label", `Grid cell ${i + 1}`);
    cell.disabled = true;

    const cellIndex = i;

    cell.addEventListener("click", () => {
      handleCellHit(cellIndex);
    });

    cell.addEventListener("touchend", (event) => {
      event.preventDefault();
      handleCellHit(cellIndex);
    }, { passive: false });

    cell.addEventListener("pointerup", (event) => {
      handleCellHit(cellIndex);
    });

    cells.push(cell);
    boardEl.appendChild(cell);
  }
}

function updateHUD() {
  hitsEl.textContent = String(hits);
  missesEl.textContent = String(misses);
  scoreEl.textContent = String(score);
  timeLeftEl.textContent = formatTime(timeRemainingMs);
}

function flashHitFrame() {
  if (!appEl) {
    return;
  }

  appEl.classList.remove("hit-flash");
  void appEl.offsetWidth;
  appEl.classList.add("hit-flash");

  window.setTimeout(() => {
    appEl.classList.remove("hit-flash");
  }, 170);
}

function clearTarget(index) {
  const target = activeTargets.get(index);
  if (!target) {
    return;
  }

  window.clearTimeout(target.timeoutId);
  activeTargets.delete(index);
  cells[index].classList.remove("active");
}

function clearAllTargets() {
  Array.from(activeTargets.keys()).forEach((index) => {
    clearTarget(index);
  });
}

function setBoardEnabled(enabled) {
  cells.forEach((cell) => {
    cell.disabled = !enabled;
  });
}

function getDesiredActiveCount() {
  const twoDotChance = 0.2 + speedMomentum * 0.6;
  return Math.random() < twoDotChance ? 2 : 1;
}

function getRandomInactiveIndex() {
  const available = [];

  for (let i = 0; i < cells.length; i += 1) {
    if (!activeTargets.has(i)) {
      available.push(i);
    }
  }

  if (available.length === 0) {
    return null;
  }

  return available[Math.floor(Math.random() * available.length)];
}

function spawnTarget() {
  if (!isPlaying) {
    return;
  }

  const index = getRandomInactiveIndex();
  if (index === null) {
    return;
  }

  cells[index].classList.add("active");

  const target = {
    spawnedAt: nowMs(),
    timeoutId: window.setTimeout(() => {
      if (!isPlaying || !activeTargets.has(index)) {
        return;
      }

      clearTarget(index);
      misses += 1;
      score -= 5;
      speedMomentum = Math.max(0, speedMomentum - 0.18);
      updateHUD();
      statusEl.textContent = "Miss! -5 points";

      refillTargets();
    }, DOT_VISIBLE_MS),
  };

  activeTargets.set(index, target);
}

function refillTargets() {
  if (!isPlaying) {
    return;
  }

  const desiredCount = getDesiredActiveCount();
  while (activeTargets.size < desiredCount) {
    const beforeSize = activeTargets.size;
    spawnTarget();

    if (activeTargets.size === beforeSize) {
      return;
    }
  }
}

function updateTimeLeftFromClock() {
  if (!isPlaying) {
    return;
  }

  const elapsed = nowMs() - gameStartedAt;
  timeRemainingMs = Math.max(0, GAME_DURATION_MS - elapsed);
  timeLeftEl.textContent = formatTime(timeRemainingMs);
}

function clearGameTimers() {
  window.clearTimeout(gameEndTimeout);
  window.clearInterval(gameTimerInterval);
  gameEndTimeout = null;
  gameTimerInterval = null;
}

function endGame() {
  if (!isPlaying) {
    return;
  }

  isPlaying = false;
  clearGameTimers();
  clearAllTargets();
  setBoardEnabled(false);
  startBtn.disabled = false;
  timeRemainingMs = 0;
  updateHUD();

  statusEl.textContent = `Time! Final score: ${score} (${hits} hits, ${misses} misses).`;
}

function startGameplay() {
  isPlaying = true;
  isCountingDown = false;
  gameStartedAt = nowMs();
  timeRemainingMs = GAME_DURATION_MS;
  speedMomentum = 0;

  setBoardEnabled(true);
  updateHUD();
  statusEl.textContent = "Go!";

  refillTargets();

  gameTimerInterval = window.setInterval(updateTimeLeftFromClock, 50);
  gameEndTimeout = window.setTimeout(endGame, GAME_DURATION_MS);
}

function startCountdown() {
  let count = COUNTDOWN_START;
  statusEl.textContent = `Get ready... ${count}`;

  countdownInterval = window.setInterval(() => {
    count -= 1;

    if (count > 0) {
      statusEl.textContent = `Get ready... ${count}`;
      return;
    }

    window.clearInterval(countdownInterval);
    countdownInterval = null;

    startGameplay();
  }, 1000);
}

function resetGameState() {
  clearGameTimers();
  window.clearInterval(countdownInterval);
  countdownInterval = null;

  hits = 0;
  misses = 0;
  score = 0;
  timeRemainingMs = GAME_DURATION_MS;
  isPlaying = false;
  isCountingDown = false;
  speedMomentum = 0;

  clearAllTargets();
  updateHUD();
  setBoardEnabled(false);
  startBtn.disabled = false;
  statusEl.textContent = "Press Start to begin.";
}

function bindControlActivation(element, handler) {
  let lastActivationAt = 0;

  const activate = () => {
    const now = Date.now();
    if (now - lastActivationAt < 450) {
      return;
    }

    lastActivationAt = now;
    handler();
  };

  element.addEventListener("click", activate, false);
  element.addEventListener(
    "touchstart",
    (event) => {
      event.preventDefault();
      activate();
    },
    { passive: false }
  );
}

function startGame() {
  if (isPlaying || isCountingDown) {
    return;
  }

  resetGameState();
  isCountingDown = true;
  startBtn.disabled = true;
  startCountdown();
}

function resetGame() {
  resetGameState();
}

bindControlActivation(startBtn, startGame);
bindControlActivation(resetBtn, resetGame);

createBoard();
resetGameState();
