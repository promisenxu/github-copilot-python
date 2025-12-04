/**
 * Main entry point for the Sudoku application.
 * Initializes all components and wires event listeners.
 */
import { ThemeManager } from './modules/themeManager.js';
import { GameController } from './modules/gameController.js';

// Initialize components on page load
window.addEventListener('load', () => {
  // Set up theme manager
  const themeManager = new ThemeManager();
  themeManager.initialize();
  themeManager.setThemeButton(document.getElementById('theme-toggle-btn'));

  // Set up game controller
  const gameController = new GameController(
    document.getElementById('sudoku-board'),
    document.getElementById('timer'),
    document.getElementById('message'),
    document.getElementById('difficulty')
  );

  // Wire button event listeners
  document.getElementById('new-game').addEventListener('click', () => {
    gameController.startNewGame();
  });

  document.getElementById('check-solution').addEventListener('click', () => {
    gameController.checkSolution();
  });

  document.getElementById('hint-button').addEventListener('click', () => {
    gameController.getHint();
  });

  // Set up real-time conflict detection
  gameController.boardManager.setOnCellInputCallback(() => {
    gameController.updateConflicts();
  });

  // Initialize the first game and leaderboard
  gameController.startNewGame();
  gameController.leaderboardManager.render();
});