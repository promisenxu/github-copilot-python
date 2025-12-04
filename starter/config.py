"""
Shared configuration for the Sudoku game backend.
Centralizes magic numbers and game constants.
"""

# Game board dimensions
SUDOKU_SIZE = 9
SUDOKU_BOX_SIZE = 3
EMPTY_CELL = 0

# Default clue counts for difficulty levels
DEFAULT_CLUES = 35
DIFFICULTY_PRESETS = {
    'easy': 50,
    'medium': 35,
    'hard': 20
}

# Validation thresholds
MIN_CLUES = 17  # Theoretical minimum for unique solution
MAX_CLUES = 81  # Maximum (full board)
