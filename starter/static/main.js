// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
let puzzle = [];
let timerInterval = null;
let startTime = null;
let lastElapsedSeconds = 0;

// Difficulty to clues mapping (more clues = easier)
const DIFFICULTY_LEVELS = {
  easy: 50,
  medium: 35,
  hard: 20
};

let numberOfHintsRequested = 0;
let difficultyLevelLastUsed = 'medium';

// Initialize dark mode from localStorage or system preference
function initializeDarkMode() {
  const savedMode = localStorage.getItem('sudoku-dark-mode');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Use saved preference, else fall back to system preference
  if (savedMode !== null) {
    if (savedMode === 'true') {
      document.body.classList.add('dark-mode');
    }
  } else if (prefersDark) {
    document.body.classList.add('dark-mode');
  }
  
  updateThemeToggleButton();
}

// Update the theme toggle button icon based on current mode
function updateThemeToggleButton() {
  const btn = document.getElementById('theme-toggle-btn');
  if (document.body.classList.contains('dark-mode')) {
    btn.textContent = '☀️';
    btn.title = 'Switch to light mode';
  } else {
    btn.textContent = '🌙';
    btn.title = 'Switch to dark mode';
  }
}

// Toggle dark mode
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDarkMode = document.body.classList.contains('dark-mode');
  localStorage.setItem('sudoku-dark-mode', isDarkMode.toString());
  updateThemeToggleButton();
}


function createBoardElement() {
  // Generate 9x9 grid of input elements; data-row and data-col for tracking
  const boardDiv = document.getElementById('sudoku-board');
  boardDiv.innerHTML = '';
  for (let i = 0; i < SIZE; i++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'sudoku-row';
    for (let j = 0; j < SIZE; j++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.className = 'sudoku-cell';
      input.dataset.row = i;
      input.dataset.col = j;
      input.addEventListener('input', (e) => {
        // Strip non-digit characters (only allow 1-9)
        const val = e.target.value.replace(/[^1-9]/g, '');
        e.target.value = val;
      });
      rowDiv.appendChild(input);
    }
    boardDiv.appendChild(rowDiv);
  }
}

function getConflictingCells() {
  // Real-time conflict detection: highlight cells violating Sudoku rules
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const conflicts = new Set();
  
  // Map cell values by position
  const cellValues = {};
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = inputs[idx].value;
      if (val) {
        cellValues[`${i},${j}`] = parseInt(val, 10);
      }
    }
  }
  
  // Check each cell for conflicts with row, column, or 3x3 box
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const inp = inputs[idx];
      const val = inp.value;
      
      if (!val) continue; // Skip empty cells
      if (inp.disabled) continue; // Skip prefilled cells
      
      const numVal = parseInt(val, 10);
      let hasConflict = false;
      
      // Check row
      for (let col = 0; col < SIZE; col++) {
        if (col === j) continue;
        const otherIdx = i * SIZE + col;
        const otherVal = inputs[otherIdx].value;
        if (otherVal && parseInt(otherVal, 10) === numVal) {
          hasConflict = true;
          break;
        }
      }
      
      // Check column
      if (!hasConflict) {
        for (let row = 0; row < SIZE; row++) {
          if (row === i) continue;
          const otherIdx = row * SIZE + j;
          const otherVal = inputs[otherIdx].value;
          if (otherVal && parseInt(otherVal, 10) === numVal) {
            hasConflict = true;
            break;
          }
        }
      }
      
      // Check 3x3 box
      if (!hasConflict) {
        const boxRowStart = Math.floor(i / 3) * 3;
        const boxColStart = Math.floor(j / 3) * 3;
        for (let row = boxRowStart; row < boxRowStart + 3; row++) {
          for (let col = boxColStart; col < boxColStart + 3; col++) {
            if (row === i && col === j) continue;
            const otherIdx = row * SIZE + col;
            const otherVal = inputs[otherIdx].value;
            if (otherVal && parseInt(otherVal, 10) === numVal) {
              hasConflict = true;
              break;
            }
          }
          if (hasConflict) break;
        }
      }
      
      if (hasConflict) {
        conflicts.add(idx);
      }
    }
  }
  
  return conflicts;
}

function updateConflictHighlighting() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const conflicts = getConflictingCells();
  
  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled) continue; // Don't modify prefilled cells
    
    if (conflicts.has(idx)) {
      if (!inp.className.includes('conflict')) {
        inp.className = inp.className.replace('incorrect', '').trim() + ' conflict';
      }
    } else {
      inp.className = inp.className.replace('conflict', '').trim();
    }
  }
}

function renderPuzzle(puz) {
  puzzle = puz;
  createBoardElement();
  startTimer();
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = puzzle[i][j];
      const inp = inputs[idx];
      if (val !== 0) {
        // Prefilled cells are read-only
        inp.value = val;
        inp.disabled = true;
        inp.className += ' prefilled';
      } else {
        inp.value = '';
        inp.disabled = false;
      }
      // Attach conflict detection listener to user-editable cells
      inp.addEventListener('input', updateConflictHighlighting);
    }
  }
}

// Utility to mark a cell as hinted
function markCellAsHinted(row, col, value) {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const idx = row * SIZE + col;
  const inp = inputs[idx];
  inp.value = value;
  inp.disabled = true;
  inp.className = 'sudoku-cell hinted';
}

function startTimer() {
  // Reset and start elapsed time counter
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  startTime = Date.now();
  lastElapsedSeconds = 0;
  const timerDisplay = document.getElementById('timer');
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    lastElapsedSeconds = elapsed;
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    const timeString = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    timerDisplay.innerText = `Time: ${timeString}`;
  }, 1000);
}

async function getHint() {
  // Request hint from server (fills one random empty cell)
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const board = [];
  for (let i = 0; i < SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = inputs[idx].value;
      board[i][j] = val ? parseInt(val, 10) : 0;
    }
  }
  const res = await fetch('/hint', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({board})
  });
  const data = await res.json();
  const msg = document.getElementById('message');
  if (data.error) {
    msg.style.color = '#d32f2f';
    msg.innerText = data.error;
    return;
  }
  markCellAsHinted(data.row, data.col, data.value);
  msg.style.color = '#388e3c';
  msg.innerText = `Hint: Cell [${data.row+1}, ${data.col+1}] filled.`;
  numberOfHintsRequested++;
}

async function newGame() {
  const difficulty = document.getElementById('difficulty').value;
  const clues = DIFFICULTY_LEVELS[difficulty];
  const res = await fetch(`/new?clues=${clues}`);
  const data = await res.json();
  renderPuzzle(data.puzzle);
  document.getElementById('message').innerText = '';
  numberOfHintsRequested = 0;
  difficultyLevelLastUsed = difficulty;
}

async function checkSolution() {
  // POST current board state to server for validation
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const board = [];
  for (let i = 0; i < SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = inputs[idx].value;
      board[i][j] = val ? parseInt(val, 10) : 0;
    }
  }
  const res = await fetch('/check', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({board})
  });
  const data = await res.json();
  const msg = document.getElementById('message');
  if (data.error) {
    msg.style.color = '#d32f2f';
    msg.innerText = data.error;
    return;
  }
  // Highlight incorrect cells returned by server
  const incorrect = new Set(data.incorrect.map(x => x[0]*SIZE + x[1]));
  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled) continue;
    inp.className = 'sudoku-cell';
    if (inp.value && incorrect.has(idx)) {
      inp.className = 'sudoku-cell incorrect';
    }
  }
  if (incorrect.size === 0) {
    msg.style.color = '#388e3c';
    msg.innerText = 'Congratulations! You solved it!';
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    // Prompt for leaderboard entry
    setTimeout(() => {
      let playerName = window.prompt('You made the leaderboard! Enter your name:');
      if (playerName === null) playerName = '';
      playerName = playerName.trim();
      if (!playerName) playerName = 'Anonymous';
      saveTimeToLeaderboard(lastElapsedSeconds, difficultyLevelLastUsed, numberOfHintsRequested, playerName);
      renderLeaderboard();
    }, 300);
  } else {
    msg.style.color = '#d32f2f';
    msg.innerText = 'Some cells are incorrect and/or missing.';
  }
}

function saveTimeToLeaderboard(seconds, difficulty, hints, name) {
  let leaderboard = [];
  try {
    leaderboard = JSON.parse(localStorage.getItem('sudokuLeaderboard')) || [];
  } catch (e) {
    leaderboard = [];
  }
  leaderboard.push({
    time: seconds,
    difficulty: difficulty,
    hints: hints,
    name: name || 'Anonymous'
  });
  leaderboard.sort((a, b) => a.time - b.time);
  leaderboard = leaderboard.slice(0, 10);
  localStorage.setItem('sudokuLeaderboard', JSON.stringify(leaderboard));
}

function renderLeaderboard() {
  // Display top 10 fastest times from localStorage
  let leaderboard = [];
  try {
    leaderboard = JSON.parse(localStorage.getItem('sudokuLeaderboard')) || [];
  } catch (e) {
    leaderboard = [];
  }
  let leaderboardDiv = document.getElementById('leaderboard');
  if (!leaderboardDiv) {
    leaderboardDiv = document.createElement('div');
    leaderboardDiv.id = 'leaderboard';
    leaderboardDiv.className = 'leaderboard';
    const container = document.getElementById('sudoku-container') || document.body;
    container.appendChild(leaderboardDiv);
  }
  if (leaderboard.length === 0) {
    leaderboardDiv.innerHTML = '<h3>Top 10 Fastest Times</h3><p>No records yet.</p>';
    return;
  }
  let html = '<h3>Top 10 Fastest Times</h3>';
  html += `<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Name</th><th>Time</th><th>Level</th><th>Hints</th></tr></thead><tbody>`;
  leaderboard.forEach((entry, idx) => {
    html += `<tr><td>${idx + 1}</td><td>${entry.name || 'Anonymous'}</td><td>${formatTime(entry.time)}</td><td>${entry.difficulty}</td><td>${entry.hints}</td></tr>`;
  });
  html += '</tbody></table>';
  leaderboardDiv.innerHTML = html;
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Wire event listeners and initialize on page load
window.addEventListener('load', () => {
  initializeDarkMode();
  document.getElementById('theme-toggle-btn').addEventListener('click', toggleDarkMode);
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  document.getElementById('hint-button').addEventListener('click', getHint);
  // Load first game
  newGame();
  renderLeaderboard();
});