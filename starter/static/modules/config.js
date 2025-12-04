/**
 * Shared configuration constants for the Sudoku game.
 * Centralizes all magic numbers and configuration values.
 */
export const SUDOKU_CONFIG = {
  SIZE: 9,
  BOX_SIZE: 3,
  EMPTY_CELL: 0,
  DIFFICULTY_LEVELS: {
    easy: 50,
    medium: 35,
    hard: 20
  },
  STORAGE_KEYS: {
    DARK_MODE: 'sudoku-dark-mode',
    LEADERBOARD: 'sudokuLeaderboard'
  },
  CSS_CLASSES: {
    DARK_MODE: 'dark-mode',
    SUDOKU_CELL: 'sudoku-cell',
    PREFILLED: 'prefilled',
    INCORRECT: 'incorrect',
    CONFLICT: 'conflict',
    HINTED: 'hinted'
  }
};
