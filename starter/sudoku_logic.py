import copy
import random

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
