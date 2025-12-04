## Modular Components Reference Guide

This document serves as a quick reference for the modular, reusable components in the Sudoku application.

---

## Quick Component Overview

### Frontend Modules (ES6 Classes)

| Module | Class | Purpose | Reusable For |
|--------|-------|---------|--------------|
| `config.js` | N/A | Configuration constants | Any web application |
| `themeManager.js` | `ThemeManager` | Dark/light mode switching | Any app with theme support |
| `timerManager.js` | `TimerManager` | Game timing and elapsed tracking | Timer-based apps |
| `boardManager.js` | `BoardManager` | Grid rendering and cell management | Grid-based games (Minesweeper, Chess, etc.) |
| `leaderboardManager.js` | `LeaderboardManager` | High score tracking & display | Competitive games |
| `gameController.js` | `GameController` | Game flow orchestration | Game logic coordination |
| `main.js` | N/A | Application entry point | Glue between modules |

### Backend Modules (Python Classes)

| Module | Class | Purpose | Reusable For |
|--------|-------|---------|--------------|
| `config.py` | N/A | Configuration constants | Any Python Sudoku variant |
| `sudoku_logic.py` | `SudokuBoard` | Board operations | Sudoku puzzle solving |
| `sudoku_logic.py` | `PuzzleGenerator` | Puzzle creation | Puzzle generation systems |
| `sudoku_logic.py` | `SolutionValidator` | Solution checking | Sudoku validation systems |
| `services.py` | `GameService` | Game state management | Game servers |
| `validation_service.py` | `ValidationService` | Solution validation | Game validation logic |
| `app.py` | N/A | Flask routes (thin layer) | Web server endpoints |

---

## Frontend Component API Reference

### ThemeManager

```javascript
import { ThemeManager } from './modules/themeManager.js';

const manager = new ThemeManager();
manager.initialize();           // Load saved or system preference
manager.toggle();              // Switch theme
manager.setThemeButton(btn);   // Wire up button element
```

### TimerManager

```javascript
import { TimerManager } from './modules/timerManager.js';

const timer = new TimerManager(displayElement);
timer.start();                      // Begin timing
timer.stop();                       // Stop timer
timer.getElapsedSeconds();         // Get current time
TimerManager.formatTime(120);      // Returns "0:02:00"
```

### BoardManager

```javascript
import { BoardManager } from './modules/boardManager.js';

const board = new BoardManager(boardElement);
board.createBoard();               // Generate 9x9 grid
board.renderPuzzle(puzzle);       // Display puzzle
board.getBoardState();            // Get user input as array
board.getConflictingCells();      // Get rule violations
board.highlightIncorrect(indices); // Highlight wrong cells
board.highlightConflicts(indices); // Highlight violations
board.fillHintCell(row, col, val); // Fill and disable cell
board.setOnCellInputCallback(fn);  // Attach input listener
```

### LeaderboardManager

```javascript
import { LeaderboardManager } from './modules/leaderboardManager.js';

const leaderboard = new LeaderboardManager();
leaderboard.saveEntry(seconds, 'easy', 2, 'Alice');
leaderboard.render();             // Display leaderboard
leaderboard.clear();              // Reset leaderboard
```

### GameController

```javascript
import { GameController } from './modules/gameController.js';

const game = new GameController(boardEl, timerEl, msgEl, diffEl);
await game.startNewGame();        // Start new puzzle
await game.checkSolution();       // Validate answer
await game.getHint();             // Request hint
game.updateConflicts();           // Update highlighting
game.leaderboardManager.render(); // Show leaderboard
```

---

## Backend Component API Reference

### GameService

```python
from services import GameService

service = GameService()
puzzle = service.start_new_game(35)      # Create puzzle with 35 clues
service.has_active_game()               # Returns True/False
service.get_puzzle()                    # Get current puzzle
service.get_solution()                  # Get solution
service.reset()                         # Clear state
```

### ValidationService

```python
from validation_service import ValidationService

result = ValidationService.check_solution(board, solution)
# Returns: {'incorrect': [[row, col], ...]}

solved = ValidationService.is_solved(board, solution)
# Returns: True/False

empty = ValidationService.get_hint_cells(board)
# Returns: [[row, col], ...]
```

### SudokuBoard

```python
from sudoku_logic import SudokuBoard

board = SudokuBoard.create_empty()
valid = SudokuBoard.is_valid_placement(board, 0, 0, 1)
solved = SudokuBoard.solve(board)  # Modifies board in place
```

### PuzzleGenerator

```python
from sudoku_logic import PuzzleGenerator

puzzle, solution = PuzzleGenerator.generate(35)
has_unique = PuzzleGenerator.has_unique_solution(board)
```

### SolutionValidator

```python
from sudoku_logic import SolutionValidator

result = SolutionValidator.validate(board, solution)
# Returns: {'valid': True/False, 'incorrect': [[row, col], ...]}

empty_cells = SolutionValidator.find_empty_cells(board)
# Returns: [[row, col], ...]
```

---

## Integration Patterns

### Using Multiple Components Together

**Frontend Example:**
```javascript
// Create instances
const board = new BoardManager(boardEl);
const timer = new TimerManager(timerEl);
const leaderboard = new LeaderboardManager();

// Connect callbacks
board.setOnCellInputCallback(() => {
  updateConflicts();  // Real-time validation
});

// Coordinate via GameController
const game = new GameController(boardEl, timerEl, msgEl, diffEl);
game.leaderboardManager.saveEntry(time, difficulty, hints, name);
```

**Backend Example:**
```python
# Create service instances
game = GameService()
validator = ValidationService()

# Use in routes
@app.route('/new')
def new_game():
    puzzle = game.start_new_game(35)
    return jsonify({'puzzle': puzzle})

@app.route('/check', methods=['POST'])
def check():
    result = validator.check_solution(board, game.get_solution())
    return jsonify(result)
```

---

## Testing Modular Components

### Unit Testing (Isolated Components)

```python
# Test GameService independently
from services import GameService

def test_game_service():
    service = GameService()
    puzzle = service.start_new_game(35)
    assert service.has_active_game()

# Test ValidationService independently
from validation_service import ValidationService

def test_validation():
    result = ValidationService.check_solution(board, solution)
    assert 'incorrect' in result
```

### JavaScript Testing

```javascript
// Test BoardManager independently
import { BoardManager } from './modules/boardManager.js';

describe('BoardManager', () => {
  it('renders puzzle', () => {
    const boardEl = document.createElement('div');
    const manager = new BoardManager(boardEl);
    manager.renderPuzzle(puzzle);
    // assertions
  });
});
```

---

## Extending with New Features

### Adding a New Game Mode

**Backend:**
```python
# Extend GameService
class GameService:
    def start_timed_game(self, clues, time_limit):
        """New game mode with time limit"""
        self.time_limit = time_limit
        return self.start_new_game(clues)
```

**Frontend:**
```javascript
// Use existing components in new way
class GameController:
    async startTimedGame(difficulty, timeLimit) {
        this.timeLimit = timeLimit;
        await this.startNewGame();
        this.timerManager.start();
    }
```

### Adding New Validation Rules

```python
# Extend SolutionValidator
class SolutionValidator:
    @staticmethod
    def check_with_time_bonus(board, solution, time):
        """Validation with time-based scoring"""
        result = SolutionValidator.validate(board, solution)
        if result['valid']:
            result['score'] = calculate_score(time)
        return result
```

---

## Configuration Reference

### Frontend (`config.js`)

```javascript
SUDOKU_CONFIG = {
    SIZE: 9,
    BOX_SIZE: 3,
    EMPTY_CELL: 0,
    DIFFICULTY_LEVELS: {
        easy: 50,
        medium: 35,
        hard: 20
    },
    STORAGE_KEYS: {
        DARK_MODE: 'sudoku-dark-mode',
        LEADERBOARD: 'sudokuLeaderboard'
    },
    CSS_CLASSES: {
        DARK_MODE: 'dark-mode',
        SUDOKU_CELL: 'sudoku-cell',
        PREFILLED: 'prefilled',
        INCORRECT: 'incorrect',
        CONFLICT: 'conflict',
        HINTED: 'hinted'
    }
}
```

### Backend (`config.py`)

```python
SUDOKU_SIZE = 9
SUDOKU_BOX_SIZE = 3
EMPTY_CELL = 0

DIFFICULTY_PRESETS = {
    'easy': 50,
    'medium': 35,
    'hard': 20
}

MIN_CLUES = 17
MAX_CLUES = 81
```

---

## Common Tasks

### Task: Create a puzzle with specific difficulty
```python
from services import GameService
service = GameService()
puzzle = service.start_new_game(clues=40)  # Easier puzzle
```

### Task: Check if user solved the puzzle
```python
from validation_service import ValidationService
result = ValidationService.check_solution(board, solution)
is_complete = len(result['incorrect']) == 0
```

### Task: Render puzzle and start timer
```javascript
const game = new GameController(boardEl, timerEl, msgEl, diffEl);
await game.startNewGame();  // Also starts timer
```

### Task: Find where user made mistakes
```python
result = ValidationService.check_solution(user_board, correct_solution)
mistake_locations = result['incorrect']  # [[row, col], ...]
```

### Task: Get random empty cell for hint
```python
from validation_service import ValidationService
empty_cells = ValidationService.get_hint_cells(board)
hint_row, hint_col = random.choice(empty_cells)
```

---

## Performance Considerations

### Optimization Tips

**Frontend:**
- `BoardManager.getBoardState()` is O(81) - cache if called frequently
- `getConflictingCells()` is O(81*9) - consider debouncing input
- `LeaderboardManager` uses localStorage - fine for 10 entries, consider DB for larger scale

**Backend:**
- `PuzzleGenerator.has_unique_solution()` is O(n!) - results cached in puzzle generation
- `ValidationService.check_solution()` is O(81) - very fast
- Consider caching puzzle generation results for common clue counts

---

## Dependency Graph

```
Frontend Modules:
  main.js
    ├── config.js (provides constants)
    ├── themeManager.js (independent)
    ├── timerManager.js (independent)
    ├── boardManager.js (uses SUDOKU_CONFIG)
    ├── leaderboardManager.js (uses TimerManager, SUDOKU_CONFIG)
    └── gameController.js (uses all of above)

Backend Modules:
  app.py (routes)
    ├── services.py (GameService)
    │   └── sudoku_logic.py
    ├── validation_service.py (ValidationService)
    ├── config.py (shared config)
    └── sudoku_logic.py
        ├── SudokuBoard
        ├── PuzzleGenerator
        └── SolutionValidator
```

---

## Migration Checklist

If extending this to new features:

- [ ] Define new constants in `config.py` / `config.js`
- [ ] Create new service class in backend if new state needed
- [ ] Add new validator method if new validation needed
- [ ] Create new manager class in frontend if new UI needed
- [ ] Wire components in `app.py` routes or `gameController.js`
- [ ] Add tests in `test_app.py` or `test_services.py`
- [ ] Update this reference guide

---

*For detailed architecture discussion, see ARCHITECTURE.md*
