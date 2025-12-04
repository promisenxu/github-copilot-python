/**
 * TimerManager: Manages game timer and elapsed time tracking.
 */
export class TimerManager {
  constructor(timerDisplayElement) {
    this.timerDisplay = timerDisplayElement;
    this.timerInterval = null;
    this.startTime = null;
    this.elapsedSeconds = 0;
  }

  /**
   * Start the timer.
   */
  start() {
    this.stop(); // Clear any existing timer
    this.startTime = Date.now();
    this.elapsedSeconds = 0;

    this.timerInterval = setInterval(() => {
      this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
      this.updateDisplay();
    }, 1000);
  }

  /**
   * Stop the timer.
   */
  stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * Update the timer display on the page.
   * @private
   */
  updateDisplay() {
    const hours = Math.floor(this.elapsedSeconds / 3600);
    const minutes = Math.floor((this.elapsedSeconds % 3600) / 60);
    const seconds = this.elapsedSeconds % 60;
    const timeString = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    this.timerDisplay.innerText = `Time: ${timeString}`;
  }

  /**
   * Get the current elapsed time in seconds.
   * @returns {number} Elapsed seconds
   */
  getElapsedSeconds() {
    return this.elapsedSeconds;
  }

  /**
   * Format seconds into HH:MM:SS format.
   * @param {number} seconds - Seconds to format
   * @returns {string} Formatted time string
   */
  static formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
