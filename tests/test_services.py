"""
Unit tests for service classes: GameService and ValidationService.
Tests the modular components independently of Flask routes.
"""
import pytest
import sys
from pathlib import Path

# Add the starter directory to the path
starter_path = Path(__file__).parent.parent / 'starter'
sys.path.insert(0, str(starter_path))

from services import GameService
from validation_service import ValidationService
from sudoku_logic import PuzzleGenerator, SudokuBoard, SolutionValidator
import config


class TestGameService:
    """Tests for GameService - game state management."""

    def test_game_service_initialization(self):
        """Test that GameService initializes with no active game."""
        service = GameService()
        assert not service.has_active_game()
        assert service.get_puzzle() is None
        assert service.get_solution() is None

    def test_start_new_game(self):
        """Test starting a new game creates puzzle and solution."""
        service = GameService()
        puzzle = service.start_new_game(35)
        
        assert service.has_active_game()
        assert puzzle is not None
        assert service.get_puzzle() is not None
        assert service.get_solution() is not None

    def test_puzzle_is_9x9(self):
        """Test that generated puzzle is 9x9."""
        service = GameService()
        puzzle = service.start_new_game(35)
        
        assert len(puzzle) == 9
        for row in puzzle:
            assert len(row) == 9

    def test_clues_clamping(self):
        """Test that clues are clamped to valid range."""
        service = GameService()
        
        # Test too low
        puzzle = service.start_new_game(5)
        assert service.get_puzzle() is not None
        
        # Test too high
        puzzle = service.start_new_game(100)
        assert service.get_puzzle() is not None

    def test_reset_clears_game_state(self):
        """Test that reset clears the game state."""
        service = GameService()
        service.start_new_game(35)
        assert service.has_active_game()
        
        service.reset()
        assert not service.has_active_game()
        assert service.get_puzzle() is None
        assert service.get_solution() is None


class TestValidationService:
    """Tests for ValidationService - solution validation."""

    def test_check_solution_with_empty_board(self):
        """Test checking empty board returns many incorrect cells."""
        board = [[0] * 9 for _ in range(9)]
        solution = [[1] * 9 for _ in range(9)]  # All 1s for simplicity
        
        result = ValidationService.check_solution(board, solution)
        assert 'incorrect' in result
        assert len(result['incorrect']) > 0

    def test_check_solution_with_correct_board(self):
        """Test checking correct board returns no incorrect cells."""
        board = [[1, 2, 3, 4, 5, 6, 7, 8, 9] for _ in range(9)]
        solution = board  # Same board
        
        result = ValidationService.check_solution(board, solution)
        assert 'incorrect' in result
        assert result['incorrect'] == []

    def test_is_solved_with_matching_boards(self):
        """Test is_solved returns true for matching boards."""
        board = [[1] * 9 for _ in range(9)]
        solution = [[1] * 9 for _ in range(9)]
        
        assert ValidationService.is_solved(board, solution)

    def test_is_solved_with_different_boards(self):
        """Test is_solved returns false for different boards."""
        board = [[1] * 9 for _ in range(9)]
        solution = [[2] * 9 for _ in range(9)]
        
        assert not ValidationService.is_solved(board, solution)

    def test_get_hint_cells_finds_empty_cells(self):
        """Test finding empty cells in a board."""
        board = [[0] * 9 for _ in range(9)]
        board[0][0] = 1  # Fill one cell
        
        empty_cells = ValidationService.get_hint_cells(board)
        assert len(empty_cells) == 80  # 81 - 1 filled cell


class TestPuzzleGenerator:
    """Tests for PuzzleGenerator utility class."""

    def test_generate_creates_puzzle_and_solution(self):
        """Test that generate returns both puzzle and solution."""
        puzzle, solution = PuzzleGenerator.generate(35)
        
        assert puzzle is not None
        assert solution is not None
        assert len(puzzle) == 9
        assert len(solution) == 9

    def test_puzzle_has_fewer_clues_than_solution(self):
        """Test that puzzle has fewer clues than solution."""
        puzzle, solution = PuzzleGenerator.generate(35)
        
        puzzle_clues = sum(1 for row in puzzle for cell in row if cell != 0)
        solution_clues = sum(1 for row in solution for cell in row if cell != 0)
        
        assert puzzle_clues <= solution_clues

    def test_solution_is_complete(self):
        """Test that solution has all cells filled."""
        puzzle, solution = PuzzleGenerator.generate(35)
        
        solution_clues = sum(1 for row in solution for cell in row if cell != 0)
        assert solution_clues == 81  # Complete solution


class TestSudokuBoard:
    """Tests for SudokuBoard utility class."""

    def test_create_empty_board(self):
        """Test creating an empty board."""
        board = SudokuBoard.create_empty()
        
        assert len(board) == 9
        for row in board:
            assert len(row) == 9
            assert all(cell == 0 for cell in row)

    def test_is_valid_placement_accepts_valid_placements(self):
        """Test that valid placements are accepted."""
        board = SudokuBoard.create_empty()
        
        # Placing 1 in empty cell should be valid
        assert SudokuBoard.is_valid_placement(board, 0, 0, 1)

    def test_is_valid_placement_rejects_duplicate_in_row(self):
        """Test that duplicate placements in row are rejected."""
        board = SudokuBoard.create_empty()
        board[0][0] = 1
        
        # Placing 1 in same row should be invalid
        assert not SudokuBoard.is_valid_placement(board, 0, 1, 1)

    def test_is_valid_placement_rejects_duplicate_in_column(self):
        """Test that duplicate placements in column are rejected."""
        board = SudokuBoard.create_empty()
        board[0][0] = 1
        
        # Placing 1 in same column should be invalid
        assert not SudokuBoard.is_valid_placement(board, 1, 0, 1)

    def test_is_valid_placement_rejects_duplicate_in_box(self):
        """Test that duplicate placements in 3x3 box are rejected."""
        board = SudokuBoard.create_empty()
        board[0][0] = 1
        
        # Placing 1 in same 3x3 box should be invalid
        assert not SudokuBoard.is_valid_placement(board, 1, 1, 1)


class TestSolutionValidator:
    """Tests for SolutionValidator utility class."""

    def test_validate_returns_valid_key(self):
        """Test that validate returns valid key in result."""
        board = [[1] * 9 for _ in range(9)]
        solution = [[1] * 9 for _ in range(9)]
        
        result = SolutionValidator.validate(board, solution)
        assert 'valid' in result
        assert result['valid'] is True

    def test_validate_with_incorrect_board(self):
        """Test validate with incorrect board."""
        board = [[0] * 9 for _ in range(9)]
        solution = [[1] * 9 for _ in range(9)]
        
        result = SolutionValidator.validate(board, solution)
        assert 'valid' in result
        assert 'incorrect' in result
        assert result['valid'] is False
        assert len(result['incorrect']) > 0

    def test_find_empty_cells_empty_board(self):
        """Test finding empty cells in completely empty board."""
        board = [[0] * 9 for _ in range(9)]
        empty = SolutionValidator.find_empty_cells(board)
        
        assert len(empty) == 81

    def test_find_empty_cells_full_board(self):
        """Test finding empty cells in full board."""
        board = [[1] * 9 for _ in range(9)]
        empty = SolutionValidator.find_empty_cells(board)
        
        assert len(empty) == 0
