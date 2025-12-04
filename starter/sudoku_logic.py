import copy
import random
import config

SIZE = 9
EMPTY = 0

def deep_copy(board):
    return copy.deepcopy(board)

def create_empty_board():
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]

def is_safe(board, row, col, num):
    """Check if placing num at (row, col) violates Sudoku rules."""
    # Check row and column constraints
    for x in range(SIZE):
        if board[row][x] == num or board[x][col] == num:
            return False
    # Check 3x3 box constraint
    start_row = row - row % 3
    start_col = col - col % 3
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False
    return True

def fill_board(board):
    """Backtracking solver to fill empty board with valid numbers."""
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                # Try candidates in random order for puzzle diversity
                possible = list(range(1, SIZE + 1))
                random.shuffle(possible)
                for candidate in possible:
                    if is_safe(board, row, col, candidate):
                        board[row][col] = candidate
                        if fill_board(board):
                            return True
                        # Backtrack if this path doesn't lead to solution
                        board[row][col] = EMPTY
                return False
    return True

def remove_cells(board, clues):
    """Remove cells from board while maintaining unique solution.
    Args: clues - number of clues to keep in final puzzle"""
    attempts = SIZE * SIZE - clues  # Number of cells to remove
    cells = [(r, c) for r in range(SIZE) for c in range(SIZE)]
    random.shuffle(cells)
    idx = 0
    while attempts > 0 and idx < len(cells):
        row, col = cells[idx]
        idx += 1
        if board[row][col] != EMPTY:
            backup = board[row][col]
            board[row][col] = EMPTY
            # Only keep removal if puzzle still has unique solution
            if has_unique_solution(board):
                attempts -= 1
            else:
                # Restore cell if removal breaks uniqueness
                board[row][col] = backup

def generate_puzzle(clues=35):
    board = create_empty_board()
    fill_board(board)
    solution = deep_copy(board)
    remove_cells(board, clues)
    puzzle = deep_copy(board)
    return puzzle, solution

# --- Unique solution checker ---
def count_solutions(board, limit=2):
    """Count number of solutions (stops at limit for efficiency).
    Returns count capped at limit value."""
    def helper(b):
        for row in range(SIZE):
            for col in range(SIZE):
                if b[row][col] == EMPTY:
                    for num in range(1, SIZE + 1):
                        if is_safe(b, row, col, num):
                            b[row][col] = num
                            if helper(b):
                                return True
                            b[row][col] = EMPTY
                    return False
        return True

    solutions = [0]

    def backtrack(b):
        for row in range(SIZE):
            for col in range(SIZE):
                if b[row][col] == EMPTY:
                    for num in range(1, SIZE + 1):
                        if is_safe(b, row, col, num):
                            b[row][col] = num
                            backtrack(b)
                            b[row][col] = EMPTY
                            if solutions[0] >= limit:
                                return
                    return
        solutions[0] += 1

    backtrack(deep_copy(board))
    return solutions[0]

def has_unique_solution(board):
    """Check if board has exactly one solution."""
    return count_solutions(board, limit=2) == 1


# ============================================================================
# Modular utility classes for cleaner abstraction
# ============================================================================

class SudokuBoard:
    """Encapsulates board operations and validation."""

    def __init__(self, size=SIZE):
        """Initialize with board size."""
        self.size = size
        self.board = [[EMPTY for _ in range(size)] for _ in range(size)]

    @staticmethod
    def create_empty():
        """Create a new empty board."""
        return create_empty_board()

    @staticmethod
    def is_valid_placement(board, row, col, num):
        """
        Check if a number can be placed at a position.

        Args:
            board (list): 9x9 2D list
            row, col (int): Position
            num (int): Number to place (1-9)

        Returns:
            bool: True if placement is valid
        """
        return is_safe(board, row, col, num)

    @staticmethod
    def solve(board):
        """
        Solve a Sudoku puzzle using backtracking.

        Args:
            board (list): 9x9 2D list (modifies in place)

        Returns:
            bool: True if solvable
        """
        return fill_board(board)


class PuzzleGenerator:
    """Generates Sudoku puzzles with varying difficulty."""

    @staticmethod
    def generate(clues=35):
        """
        Generate a new puzzle with specified number of clues.

        Args:
            clues (int): Number of clues to include (17-81)

        Returns:
            tuple: (puzzle, solution) - both 9x9 2D lists
        """
        return generate_puzzle(clues)

    @staticmethod
    def has_unique_solution(board):
        """
        Check if a puzzle has exactly one solution.

        Args:
            board (list): 9x9 2D list

        Returns:
            bool: True if puzzle has unique solution
        """
        return has_unique_solution(board)


class SolutionValidator:
    """Validates and checks puzzle solutions."""

    @staticmethod
    def validate(board, solution):
        """
        Check if board matches solution.

        Args:
            board (list): User-submitted board
            solution (list): Correct solution

        Returns:
            dict: Result with 'valid' bool and 'incorrect' cells list
        """
        incorrect = []
        for i in range(SIZE):
            for j in range(SIZE):
                if board[i][j] != solution[i][j]:
                    incorrect.append([i, j])

        return {
            'valid': len(incorrect) == 0,
            'incorrect': incorrect
        }

    @staticmethod
    def find_empty_cells(board):
        """
        Find all empty cells in a board.

        Args:
            board (list): 9x9 2D list

        Returns:
            list: List of [row, col] for empty cells
        """
        empty_cells = []
        for i in range(SIZE):
            for j in range(SIZE):
                if board[i][j] == EMPTY:
                    empty_cells.append([i, j])
        return empty_cells
