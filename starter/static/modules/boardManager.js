/**
 * BoardManager: Manages Sudoku board rendering, state, and cell manipulation.
 */
import { SUDOKU_CONFIG } from './config.js';

export class BoardManager {
  constructor(boardElement) {
    this.boardElement = boardElement;
    this.puzzle = [];
    this.inputElements = [];
    this.onCellInput = null;
  }

  /**
   * Create and render the 9x9 Sudoku grid.
   * Attaches input event listeners to each cell.
   */
  createBoard() {
    this.boardElement.innerHTML = '';
    this.inputElements = [];

    for (let i = 0; i < SUDOKU_CONFIG.SIZE; i++) {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'sudoku-row';

      for (let j = 0; j < SUDOKU_CONFIG.SIZE; j++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 1;
        input.className = SUDOKU_CONFIG.CSS_CLASSES.SUDOKU_CELL;
        input.dataset.row = i;
        input.dataset.col = j;

        // Filter input to only allow digits 1-9
        input.addEventListener('input', (e) => {
          const val = e.target.value.replace(/[^1-9]/g, '');
          e.target.value = val;
          if (this.onCellInput) {
            this.onCellInput(i, j, val);
          }
        });

        rowDiv.appendChild(input);
        this.inputElements.push(input);
      }

      this.boardElement.appendChild(rowDiv);
    }
  }

  /**
   * Render a puzzle onto the board.
   * Prefilled cells are disabled and marked as such.
   * @param {Array<Array<number>>} puzzle - The puzzle to render (9x9 grid with 0 for empty)
   */
  renderPuzzle(puzzle) {
    this.puzzle = puzzle;
    this.createBoard();

    for (let i = 0; i < SUDOKU_CONFIG.SIZE; i++) {
      for (let j = 0; j < SUDOKU_CONFIG.SIZE; j++) {
        const idx = i * SUDOKU_CONFIG.SIZE + j;
        const val = puzzle[i][j];
        const input = this.inputElements[idx];

        if (val !== SUDOKU_CONFIG.EMPTY_CELL) {
          input.value = val;
          input.disabled = true;
          input.classList.add(SUDOKU_CONFIG.CSS_CLASSES.PREFILLED);
        } else {
          input.value = '';
          input.disabled = false;
        }
      }
    }
  }

  /**
   * Get the current state of the board as a 2D array.
   * @returns {Array<Array<number>>} Current board state
   */
  getBoardState() {
    const board = [];
    for (let i = 0; i < SUDOKU_CONFIG.SIZE; i++) {
      board[i] = [];
      for (let j = 0; j < SUDOKU_CONFIG.SIZE; j++) {
        const idx = i * SUDOKU_CONFIG.SIZE + j;
        const val = this.inputElements[idx].value;
        board[i][j] = val ? parseInt(val, 10) : SUDOKU_CONFIG.EMPTY_CELL;
      }
    }
    return board;
  }

  /**
   * Clear all highlighting (conflict, incorrect) from the board.
   */
  clearHighlighting() {
    this.inputElements.forEach((input) => {
      if (!input.disabled) {
        input.classList.remove(SUDOKU_CONFIG.CSS_CLASSES.CONFLICT);
        input.classList.remove(SUDOKU_CONFIG.CSS_CLASSES.INCORRECT);
      }
    });
  }

  /**
   * Highlight incorrect cells.
   * @param {Set<number>} incorrectIndices - Set of cell indices that are incorrect
   */
  highlightIncorrect(incorrectIndices) {
    this.inputElements.forEach((input, idx) => {
      if (!input.disabled) {
        if (input.value && incorrectIndices.has(idx)) {
          input.classList.add(SUDOKU_CONFIG.CSS_CLASSES.INCORRECT);
        }
      }
    });
  }

  /**
   * Highlight conflicting cells (violating Sudoku rules).
   * @param {Set<number>} conflictIndices - Set of cell indices with conflicts
   */
  highlightConflicts(conflictIndices) {
    this.inputElements.forEach((input, idx) => {
      if (!input.disabled) {
        if (conflictIndices.has(idx)) {
          input.classList.add(SUDOKU_CONFIG.CSS_CLASSES.CONFLICT);
        } else {
          input.classList.remove(SUDOKU_CONFIG.CSS_CLASSES.CONFLICT);
        }
      }
    });
  }

  /**
   * Fill a cell as a hint and disable it.
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @param {number} value - Value to fill
   */
  fillHintCell(row, col, value) {
    const idx = row * SUDOKU_CONFIG.SIZE + col;
    const input = this.inputElements[idx];
    input.value = value;
    input.disabled = true;
    input.classList.add(SUDOKU_CONFIG.CSS_CLASSES.HINTED);
  }

  /**
   * Get conflicting cells based on Sudoku rules.
   * @returns {Set<number>} Set of cell indices that have conflicts
   */
  getConflictingCells() {
    const conflicts = new Set();
    const board = this.getBoardState();

    for (let i = 0; i < SUDOKU_CONFIG.SIZE; i++) {
      for (let j = 0; j < SUDOKU_CONFIG.SIZE; j++) {
        const val = board[i][j];
        if (!val) continue; // Skip empty cells
        if (this.inputElements[i * SUDOKU_CONFIG.SIZE + j].disabled) continue; // Skip prefilled

        let hasConflict = false;

        // Check row
        for (let col = 0; col < SUDOKU_CONFIG.SIZE; col++) {
          if (col !== j && board[i][col] === val) {
            hasConflict = true;
            break;
          }
        }

        // Check column
        if (!hasConflict) {
          for (let row = 0; row < SUDOKU_CONFIG.SIZE; row++) {
            if (row !== i && board[row][j] === val) {
              hasConflict = true;
              break;
            }
          }
        }

        // Check 3x3 box
        if (!hasConflict) {
          const boxRowStart = Math.floor(i / SUDOKU_CONFIG.BOX_SIZE) * SUDOKU_CONFIG.BOX_SIZE;
          const boxColStart = Math.floor(j / SUDOKU_CONFIG.BOX_SIZE) * SUDOKU_CONFIG.BOX_SIZE;
          for (let row = boxRowStart; row < boxRowStart + SUDOKU_CONFIG.BOX_SIZE; row++) {
            for (let col = boxColStart; col < boxColStart + SUDOKU_CONFIG.BOX_SIZE; col++) {
              if ((row !== i || col !== j) && board[row][col] === val) {
                hasConflict = true;
                break;
              }
            }
            if (hasConflict) break;
          }
        }

        if (hasConflict) {
          conflicts.add(i * SUDOKU_CONFIG.SIZE + j);
        }
      }
    }

    return conflicts;
  }

  /**
   * Set callback for cell input events.
   * @param {Function} callback - Callback function to call on cell input
   */
  setOnCellInputCallback(callback) {
    this.onCellInput = callback;
  }
}
