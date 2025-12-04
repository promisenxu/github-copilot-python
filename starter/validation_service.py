"""
ValidationService: Handles solution validation and checking logic.
Provides reusable validation operations for game endpoints.
"""
import config


class ValidationService:
    """Service for validating board states against solutions."""

    @staticmethod
    def check_solution(board, solution):
        """
        Compare board against solution and identify incorrect cells.

        Args:
            board (list): 9x9 2D list with user-filled values (0 for empty)
            solution (list): 9x9 2D list with correct solution

        Returns:
            dict: Result with 'incorrect' key containing list of [row, col] pairs
        """
        if not board or not solution:
            return {'error': 'Invalid board or solution'}

        incorrect = []
        for i in range(config.SUDOKU_SIZE):
            for j in range(config.SUDOKU_SIZE):
                if board[i][j] != solution[i][j]:
                    incorrect.append([i, j])

        return {'incorrect': incorrect}

    @staticmethod
    def is_solved(board, solution):
        """
        Check if board matches solution (puzzle completely and correctly solved).

        Args:
            board (list): 9x9 2D list
            solution (list): 9x9 2D list

        Returns:
            bool: True if board matches solution exactly
        """
        if not board or not solution:
            return False

        for i in range(config.SUDOKU_SIZE):
            for j in range(config.SUDOKU_SIZE):
                if board[i][j] != solution[i][j]:
                    return False
        return True

    @staticmethod
    def get_hint_cells(board):
        """
        Find all empty cells in the board.

        Args:
            board (list): 9x9 2D list with 0 for empty cells

        Returns:
            list: List of [row, col] pairs for empty cells
        """
        empty_cells = []
        for i in range(config.SUDOKU_SIZE):
            for j in range(config.SUDOKU_SIZE):
                if board[i][j] == config.EMPTY_CELL:
                    empty_cells.append([i, j])
        return empty_cells
