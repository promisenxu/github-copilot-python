// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
let puzzle = [];
let timerInterval = null;
let startTime = null;

// Difficulty to clues mapping
const DIFFICULTY_LEVELS = {
  easy: 50,
  medium: 35,
  hard: 20
};

function createBoardElement() {
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
        const val = e.target.value.replace(/[^1-9]/g, '');
        e.target.value = val;
      });
      rowDiv.appendChild(input);
    }
    boardDiv.appendChild(rowDiv);
  }
}

function getConflictingCells() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const conflicts = new Set();
  
  // Build a map of cell values
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
  
  // Check each cell for conflicts
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
        inp.value = val;
        inp.disabled = true;
        inp.className += ' prefilled';
      } else {
        inp.value = '';
        inp.disabled = false;
      }
      // Add conflict detection on input
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
  // Clear any existing interval
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  startTime = Date.now();
  const timerDisplay = document.getElementById('timer');
  
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    
    const timeString = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    timerDisplay.innerText = `Time: ${timeString}`;
  }, 1000);
}

async function getHint() {
  const res = await fetch('/hint', {method: 'POST'});
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
}
async function newGame() {
  const difficulty = document.getElementById('difficulty').value;
  const clues = DIFFICULTY_LEVELS[difficulty];
  const res = await fetch(`/new?clues=${clues}`);
  const data = await res.json();
  renderPuzzle(data.puzzle);
  document.getElementById('message').innerText = '';
}

async function checkSolution() {
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
  } else {
    msg.style.color = '#d32f2f';
    msg.innerText = 'Some cells are incorrect and/or missing.';
  }
}

// Wire buttons
window.addEventListener('load', () => {
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  document.getElementById('hint-button').addEventListener('click', getHint);
  // initialize
  newGame();
});