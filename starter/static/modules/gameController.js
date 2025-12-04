/**
 * GameController: Orchestrates game flow, coordinates between board, timer,
 * validation, and server communication.
 */
import { SUDOKU_CONFIG } from './config.js';
import { BoardManager } from './boardManager.js';
import { TimerManager } from './timerManager.js';
import { LeaderboardManager } from './leaderboardManager.js';

export class GameController {
  constructor(boardElement, timerElement, messageElement, difficultySelector) {
    this.boardManager = new BoardManager(boardElement);
    this.timerManager = new TimerManager(timerElement);
    this.leaderboardManager = new LeaderboardManager();
    this.messageElement = messageElement;
    this.difficultySelector = difficultySelector;
    this.hintsUsed = 0;
    this.currentDifficulty = 'medium';
  }

  /**
   * Start a new game at the selected difficulty.
   * @async
   */
  async startNewGame() {
    this.hintsUsed = 0;
    this.currentDifficulty = this.difficultySelector.value;
    const clues = SUDOKU_CONFIG.DIFFICULTY_LEVELS[this.currentDifficulty];

    try {
      const response = await fetch(`/new?clues=${clues}`);
      const data = await response.json();
      this.boardManager.renderPuzzle(data.puzzle);
      this.timerManager.start();
      this.clearMessage();
    } catch (error) {
      this.showError('Failed to start new game');
      console.error(error);
    }
  }

  /**
   * Check the current board state against the server solution.
   * @async
   */
  async checkSolution() {
    const board = this.boardManager.getBoardState();

    try {
      const response = await fetch('/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board })
      });

      const data = await response.json();

      if (data.error) {
        this.showError(data.error);
        return;
      }

      const incorrectIndices = new Set(
        data.incorrect.map(([row, col]) => row * SUDOKU_CONFIG.SIZE + col)
      );

      this.boardManager.clearHighlighting();
      this.boardManager.highlightIncorrect(incorrectIndices);

      if (incorrectIndices.size === 0) {
        this.onSolutionCorrect();
      } else {
        this.showError('Some cells are incorrect and/or missing.');
      }
    } catch (error) {
      this.showError('Failed to check solution');
      console.error(error);
    }
  }

  /**
   * Request a hint from the server.
   * @async
   */
  async getHint() {
    const board = this.boardManager.getBoardState();

    try {
      const response = await fetch('/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board })
      });

      const data = await response.json();

      if (data.error) {
        this.showError(data.error);
        return;
      }

      this.boardManager.fillHintCell(data.row, data.col, data.value);
      this.hintsUsed++;
      this.showSuccess(`Hint: Cell [${data.row + 1}, ${data.col + 1}] filled.`);
    } catch (error) {
      this.showError('Failed to get hint');
      console.error(error);
    }
  }

  /**
   * Update conflict highlighting in real-time as user types.
   */
  updateConflicts() {
    const conflicts = this.boardManager.getConflictingCells();
    this.boardManager.highlightConflicts(conflicts);
  }

  /**
   * Handle successful solution completion.
   * @private
   */
  onSolutionCorrect() {
    this.timerManager.stop();
    this.showSuccess('Congratulations! You solved it!');

    setTimeout(() => {
      const playerName = window.prompt('You made the leaderboard! Enter your name:') || '';
      const name = playerName.trim() || 'Anonymous';
      const elapsed = this.timerManager.getElapsedSeconds();

      this.leaderboardManager.saveEntry(elapsed, this.currentDifficulty, this.hintsUsed, name);
      this.leaderboardManager.render();
    }, 300);
  }

  /**
   * Show a success message.
   * @param {string} message - Message to display
   * @private
   */
  showSuccess(message) {
    this.messageElement.style.color = '#388e3c';
    this.messageElement.innerText = message;
  }

  /**
   * Show an error message.
   * @param {string} message - Error message to display
   * @private
   */
  showError(message) {
    this.messageElement.style.color = '#d32f2f';
    this.messageElement.innerText = message;
  }

  /**
   * Clear the message display.
   * @private
   */
  clearMessage() {
    this.messageElement.innerText = '';
  }
}
