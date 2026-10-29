'use strict';
/*
 * Browser-only interactive adaptation of a CSC 220 Java Game of Life project.
 * These initial patterns were recovered from the student's original submission.
 * This is not the submitted Java source or a compiled version of it.
 */
(() => {
  const canvas = document.getElementById('life-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const patternSelect = document.getElementById('life-pattern');
  const toggleButton = document.getElementById('life-toggle');
  const stepButton = document.getElementById('life-step');
  const resetButton = document.getElementById('life-reset');
  const generationOutput = document.getElementById('life-generation');
  const aliveOutput = document.getElementById('life-alive');
  const feedback = document.getElementById('life-feedback');
  const GRID_SIZE = 25;
  const CELL_SIZE = canvas.width / GRID_SIZE;
  const TICK_MS = 240;

  // Original text-file pattern grids (0 = dead, 1 = alive).
  const patterns = {
    glider: [
      '000000',
      '000100',
      '010100',
      '001100',
      '000000',
      '000000'
    ],
    blinker: [
      '00000',
      '00000',
      '01110',
      '00000',
      '00000'
    ],
    beacon: [
      '000000',
      '011000',
      '010000',
      '000010',
      '000110',
      '000000'
    ],
    toad: [
      '000000',
      '000000',
      '001110',
      '011100',
      '000000',
      '000000'
    ],
    pulsar: [
      '00000000000000000',
      '00000000000000000',
      '00001110001110000',
      '00000000000000000',
      '00100001010000100',
      '00100001010000100',
      '00100001010000100',
      '00001110001110000',
      '00000000000000000',
      '00001110001110000',
      '00100001010000100',
      '00100001010000100',
      '00100001010000100',
      '00000000000000000',
      '00001110001110000',
      '00000000000000000',
      '00000000000000000'
    ]
  };

  let grid = emptyGrid();
  let generation = 0;
  let timer = null;

  function emptyGrid() {
    return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
  }

  function resetGrid() {
    stop();
    grid = emptyGrid();
    generation = 0;
    const source = patterns[patternSelect.value] || patterns.glider;
    const yOffset = Math.floor((GRID_SIZE - source.length) / 2);
    const xOffset = Math.floor((GRID_SIZE - source[0].length) / 2);
    for (let row = 0; row < source.length; row++) {
      for (let col = 0; col < source[row].length; col++) {
        grid[row + yOffset][col + xOffset] = Number(source[row][col]);
      }
    }
    render();
    feedback.textContent = 'Pattern loaded. Press Start or Step +1 to advance it.';
  }

  function stepGrid(current) {
    const next = emptyGrid();
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        let neighbors = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const r = row + dr;
            const c = col + dc;
            if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
              neighbors += current[r][c];
            }
          }
        }
        next[row][col] = current[row][col] === 1
          ? (neighbors === 2 || neighbors === 3 ? 1 : 0)
          : (neighbors === 3 ? 1 : 0);
      }
    }
    return next;
  }

  function render() {
    ctx.fillStyle = '#0e1b2c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#2a3e54';
    ctx.beginPath();
    for (let line = 0; line <= GRID_SIZE; line++) {
      const at = line * CELL_SIZE;
      ctx.moveTo(at, 0);
      ctx.lineTo(at, canvas.height);
      ctx.moveTo(0, at);
      ctx.lineTo(canvas.width, at);
    }
    ctx.stroke();
    let population = 0;
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!grid[row][col]) continue;
        population++;
        ctx.fillStyle = '#89eed4';
        ctx.fillRect(col * CELL_SIZE + 2, row * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
      }
    }
    generationOutput.textContent = String(generation);
    aliveOutput.textContent = String(population);
    canvas.setAttribute('aria-label', 'Game of Life pattern at generation ' + generation + ' with ' + population + ' live cells.');
  }

  function step() {
    grid = stepGrid(grid);
    generation++;
    render();
    if (!grid.some(row => row.includes(1))) {
      stop();
      feedback.textContent = 'All cells are dead. Choose Reset or a new pattern to try again.';
    }
  }

  function stop() {
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
    toggleButton.innerHTML = 'Start <span aria-hidden="true">▶</span>';
    toggleButton.setAttribute('aria-pressed', 'false');
  }

  toggleButton.addEventListener('click', () => {
    if (timer !== null) {
      stop();
      feedback.textContent = 'Paused. Use Step +1 to examine a generation.';
    } else {
      toggleButton.innerHTML = 'Pause <span aria-hidden="true">Ⅱ</span>';
      toggleButton.setAttribute('aria-pressed', 'true');
      timer = window.setInterval(step, TICK_MS);
      feedback.textContent = 'Simulation running.';
    }
  });
  stepButton.addEventListener('click', () => {
    stop();
    step();
    if (grid.some(row => row.includes(1))) feedback.textContent = 'Advanced one generation.';
  });
  resetButton.addEventListener('click', resetGrid);
  patternSelect.addEventListener('change', resetGrid);
  canvas.addEventListener('click', event => {
    stop();
    const rect = canvas.getBoundingClientRect();
    const col = Math.floor(((event.clientX - rect.left) / rect.width) * GRID_SIZE);
    const row = Math.floor(((event.clientY - rect.top) / rect.height) * GRID_SIZE);
    if (row < 0 || col < 0 || row >= GRID_SIZE || col >= GRID_SIZE) return;
    grid[row][col] = 1 - grid[row][col];
    render();
    feedback.textContent = 'Cell toggled. Start or step to explore your custom pattern.';
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && timer !== null) {
      stop();
      feedback.textContent = 'Paused because the tab is in the background.';
    }
  });

  resetGrid();
})();
