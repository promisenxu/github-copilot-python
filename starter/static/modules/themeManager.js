/**
 * ThemeManager: Handles dark/light mode switching with localStorage persistence
 * and system preference detection.
 */
import { SUDOKU_CONFIG } from './config.js';

export class ThemeManager {
  constructor() {
    this.darkModeButton = null;
  }

  /**
   * Initialize dark mode from localStorage or system preference.
   */
  initialize() {
    const savedMode = localStorage.getItem(SUDOKU_CONFIG.STORAGE_KEYS.DARK_MODE);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedMode !== null) {
      if (savedMode === 'true') {
        document.body.classList.add(SUDOKU_CONFIG.CSS_CLASSES.DARK_MODE);
      }
    } else if (prefersDark) {
      document.body.classList.add(SUDOKU_CONFIG.CSS_CLASSES.DARK_MODE);
    }
  }

  /**
   * Set up the theme toggle button with event listener.
   * @param {HTMLElement} button - The button element to listen to
   */
  setThemeButton(button) {
    this.darkModeButton = button;
    this.updateButtonAppearance();
    this.darkModeButton.addEventListener('click', () => this.toggle());
  }

  /**
   * Toggle between dark and light modes.
   */
  toggle() {
    document.body.classList.toggle(SUDOKU_CONFIG.CSS_CLASSES.DARK_MODE);
    const isDarkMode = document.body.classList.contains(SUDOKU_CONFIG.CSS_CLASSES.DARK_MODE);
    localStorage.setItem(SUDOKU_CONFIG.STORAGE_KEYS.DARK_MODE, isDarkMode.toString());
    this.updateButtonAppearance();
  }

  /**
   * Update the theme toggle button icon based on current mode.
   * @private
   */
  updateButtonAppearance() {
    if (!this.darkModeButton) return;

    const isDarkMode = document.body.classList.contains(SUDOKU_CONFIG.CSS_CLASSES.DARK_MODE);
    this.darkModeButton.textContent = isDarkMode ? '☀️' : '🌙';
    this.darkModeButton.title = isDarkMode ? 'Switch to light mode' : 'Switch to dark mode';
  }
}
