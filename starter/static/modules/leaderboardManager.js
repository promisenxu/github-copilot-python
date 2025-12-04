/**
 * LeaderboardManager: Manages leaderboard persistence and rendering.
 * Stores top 10 fastest times in localStorage.
 */
import { SUDOKU_CONFIG } from './config.js';
import { TimerManager } from './timerManager.js';

export class LeaderboardManager {
  constructor() {
    this.leaderboardElement = null;
  }

  /**
   * Save a completed game to the leaderboard.
   * @param {number} seconds - Time taken in seconds
   * @param {string} difficulty - Difficulty level
   * @param {number} hints - Number of hints used
   * @param {string} playerName - Name of the player
   */
  saveEntry(seconds, difficulty, hints, playerName) {
    let leaderboard = this.loadLeaderboard();
    leaderboard.push({
      time: seconds,
      difficulty: difficulty,
      hints: hints,
      name: playerName || 'Anonymous'
    });
    leaderboard.sort((a, b) => a.time - b.time);
    leaderboard = leaderboard.slice(0, 10);
    localStorage.setItem(SUDOKU_CONFIG.STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));
  }

  /**
   * Load leaderboard from localStorage.
   * @returns {Array<Object>} Array of leaderboard entries
   * @private
   */
  loadLeaderboard() {
    try {
      return JSON.parse(localStorage.getItem(SUDOKU_CONFIG.STORAGE_KEYS.LEADERBOARD)) || [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Render the leaderboard to the page.
   */
  render() {
    const leaderboard = this.loadLeaderboard();

    if (!this.leaderboardElement) {
      this.leaderboardElement = document.createElement('div');
      this.leaderboardElement.id = 'leaderboard';
      this.leaderboardElement.className = 'leaderboard';
      const container = document.getElementById('sudoku-container') || document.body;
      container.appendChild(this.leaderboardElement);
    }

    if (leaderboard.length === 0) {
      this.leaderboardElement.innerHTML = '<h3>Top 10 Fastest Times</h3><p>No records yet.</p>';
      return;
    }

    let html = '<h3>Top 10 Fastest Times</h3>';
    html += `<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Name</th><th>Time</th><th>Level</th><th>Hints</th></tr></thead><tbody>`;
    leaderboard.forEach((entry, idx) => {
      const formattedTime = TimerManager.formatTime(entry.time);
      html += `<tr><td>${idx + 1}</td><td>${entry.name || 'Anonymous'}</td><td>${formattedTime}</td><td>${entry.difficulty}</td><td>${entry.hints}</td></tr>`;
    });
    html += '</tbody></table>';
    this.leaderboardElement.innerHTML = html;
  }

  /**
   * Clear all leaderboard entries.
   */
  clear() {
    localStorage.removeItem(SUDOKU_CONFIG.STORAGE_KEYS.LEADERBOARD);
  }
}
