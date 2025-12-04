"""
GameService: Manages game state and orchestrates game operations.
Provides clean interface between Flask routes and puzzle/solution logic.
"""
from sudoku_logic import generate_puzzle
import config


class GameService:
    """Service for managing active game state and operations."""

    def __init__(self):
        """Initialize game service with empty state."""
        self.puzzle = None
        self.solution = None

    def start_new_game(self, clues=config.DEFAULT_CLUES):
        """
        Generate and start a new game.

        Args:
            clues (int): Number of clues in the puzzle (17-81).
                        Defaults to config.DEFAULT_CLUES.

        Returns:
            list: The generated puzzle (9x9 2D list with 0 for empty cells)
        """
        # Clamp clues to valid range
        clues = max(config.MIN_CLUES, min(config.MAX_CLUES, clues))

        self.puzzle, self.solution = generate_puzzle(clues)
        return self.puzzle

    def has_active_game(self):
        """
        Check if a game is currently active.

        Returns:
            bool: True if puzzle and solution are loaded
        """
        return self.puzzle is not None and self.solution is not None

    def get_puzzle(self):
        """
        Get the current puzzle.

        Returns:
            list: The current puzzle, or None if no game active
        """
        return self.puzzle

    def get_solution(self):
        """
        Get the solution for the current game (server-side only).

        Returns:
            list: The solution, or None if no game active
        """
        return self.solution

    def reset(self):
        """Reset the game state."""
        self.puzzle = None
        self.solution = None
