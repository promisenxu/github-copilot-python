## Architecture Refactoring

This document describes the modular, reusable component architecture implemented for the Sudoku game application.

### Overview

The application has been refactored into modular, reusable components to improve maintainability, testability, and separation of concerns. Both frontend (JavaScript) and backend (Python) now follow clear component patterns.

---

## Frontend Architecture (JavaScript)

### Modules Structure

The frontend is now organized into modular ES6 modules in `/static/modules/`:

#### **config.js**
Centralized configuration file containing:
- `SUDOKU_CONFIG` object with all magic numbers and constants
- Game size, difficulty levels, CSS class names, and storage keys
- **Benefit**: Single source of truth for configuration; easy to modify game rules

#### **themeManager.js** → `ThemeManager` class
Handles all theme switching and dark/light mode functionality:
- `initialize()` - Sets up initial theme from localStorage or system preference
- `toggle()` - Switches between dark and light modes
- `setThemeButton(button)` - Attaches event listener to theme toggle button

**Reusability**: Can be extracted and used in other web applications needing theme support.

#### **timerManager.js** → `TimerManager` class
Encapsulates game timer logic:
- `start()` - Begins the timer
- `stop()` - Stops the timer
- `getElapsedSeconds()` - Returns current elapsed time
- `formatTime(seconds)` - Static utility for time formatting

**Reusability**: Can be used in any time-tracking applications (cooking timers, workout apps, etc.).

#### **boardManager.js** → `BoardManager` class
Manages the Sudoku board DOM and state:
- `createBoard()` - Generates 9x9 grid of input elements
- `renderPuzzle(puzzle)` - Populates board with puzzle data
- `getBoardState()` - Returns current user input as 2D array
- `getConflictingCells()` - Real-time conflict detection
- `highlightIncorrect(indices)` - Highlights wrong cells
- `highlightConflicts(indices)` - Highlights rule violations
- `fillHintCell(row, col, value)` - Fills a hinted cell

**Reusability**: Core board logic can be adapted for other grid-based puzzles (Minesweeper, Nonogram, etc.).

#### **leaderboardManager.js** → `LeaderboardManager` class
Handles leaderboard persistence and display:
- `saveEntry(seconds, difficulty, hints, name)` - Saves a completed game
- `loadLeaderboard()` - Retrieves leaderboard from localStorage
- `render()` - Displays leaderboard on page
- `clear()` - Clears all entries

**Reusability**: Generic leaderboard system applicable to any competitive game.

#### **gameController.js** → `GameController` class
Orchestrates the overall game flow:
- `startNewGame()` - Initiates a new puzzle
- `checkSolution()` - Validates user's answer against server
- `getHint()` - Requests a hint from server
- `updateConflicts()` - Updates real-time conflict highlighting

**Benefit**: Single coordinator class that manages interactions between all other components.

#### **main.js**
Entry point that:
- Imports all modules
- Initializes managers and controllers
- Wires up event listeners
- Orchestrates startup

### Usage Pattern

```javascript
// Components are cleanly separated and testable
import { ThemeManager } from './modules/themeManager.js';
import { GameController } from './modules/gameController.js';

const themeManager = new ThemeManager();
const gameController = new GameController(boardEl, timerEl, msgEl, difficultyEl);

themeManager.initialize();
gameController.startNewGame();
```

---

## Backend Architecture (Python)

### Module Structure

#### **config.py** → Configuration Module
Centralized configuration:
- `SUDOKU_SIZE`, `SUDOKU_BOX_SIZE`, `EMPTY_CELL` - Core constants
- `DIFFICULTY_PRESETS` - Clue counts per difficulty
- `MIN_CLUES`, `MAX_CLUES` - Validation bounds

**Benefit**: All magic numbers in one place; easy to extend to 12x12 Sudoku, etc.

#### **sudoku_logic.py** → Core Logic + Modular Classes
Maintained backward compatibility with existing functions while adding OOP abstractions:

**Existing Functions** (preserved for compatibility):
- `fill_board(board)` - Backtracking solver
- `is_safe(board, row, col, num)` - Placement validation
- `generate_puzzle(clues)` - Puzzle generation
- `has_unique_solution(board)` - Uniqueness verification

**New Modular Classes**:

**`SudokuBoard`** - Board operations
```python
SudokuBoard.is_valid_placement(board, row, col, num)  # Static validation
SudokuBoard.solve(board)  # Solve a puzzle
```

**`PuzzleGenerator`** - Puzzle creation
```python
PuzzleGenerator.generate(clues)  # Generate puzzle + solution
PuzzleGenerator.has_unique_solution(board)  # Verify uniqueness
```

**`SolutionValidator`** - Validation logic
```python
SolutionValidator.validate(board, solution)  # Check solution
SolutionValidator.find_empty_cells(board)  # Find empty positions
```

**Benefit**: Classes can be imported and used independently in other Python projects.

#### **services.py** → `GameService` class
Manages game state at application level:
- `start_new_game(clues)` - Creates and stores new game
- `has_active_game()` - Checks if game exists
- `get_puzzle()` / `get_solution()` - Retrieves game data
- `reset()` - Clears game state

**Benefit**: Encapsulates stateful game management; easy to swap in different storage backends (database, etc.).

#### **validation_service.py** → `ValidationService` class
Handles all validation operations:
- `check_solution(board, solution)` - Compares boards
- `is_solved(board, solution)` - Checks if complete/correct
- `get_hint_cells(board)` - Finds empty positions

**Benefit**: Pure utility functions that can be tested independently and reused.

#### **app.py** → Flask Routes
Now uses services and validation:
```python
from services import GameService
from validation_service import ValidationService

game_service = GameService()

@app.route('/new')
def new_game():
    puzzle = game_service.start_new_game(clues)
    return jsonify({'puzzle': puzzle})

@app.route('/check', methods=['POST'])
def check_solution():
    result = ValidationService.check_solution(board, solution)
    return jsonify(result)
```

**Benefit**: Routes are now thin wrappers around services; easier to test and maintain.

---

## Communication Patterns

### Client-Server Data Flow

```
Frontend (GameController)
    ↓ (GET /new?clues=35)
    ├─→ Backend (Flask route)
    │     ↓
    │   GameService.start_new_game()
    │     ↓
    │   Returns: {'puzzle': [...]}
    │
    ↓ (POST /check with board)
    ├─→ Backend (Flask route)
    │     ↓
    │   ValidationService.check_solution()
    │     ↓
    │   Returns: {'incorrect': [[row, col], ...]}
    │
    ↓ (Display results)
    └─→ BoardManager highlights errors
```

---

## Testability Improvements

### Backend Testing
```python
# Services can be tested independently
def test_game_service():
    service = GameService()
    puzzle = service.start_new_game(35)
    assert service.has_active_game()
    
# Validators can be tested with sample data
def test_validation_service():
    board = [[...]]
    solution = [[...]]
    result = ValidationService.check_solution(board, solution)
    assert 'incorrect' in result
```

### Frontend Testing
```javascript
// Modules export classes for direct testing
import { BoardManager } from './modules/boardManager.js';
import { SUDOKU_CONFIG } from './modules/config.js';

describe('BoardManager', () => {
  it('should render puzzle correctly', () => {
    const boardEl = document.createElement('div');
    const manager = new BoardManager(boardEl);
    const puzzle = [[...], ...];
    manager.renderPuzzle(puzzle);
    // assertions
  });
});
```

---

## Benefits of This Architecture

### Modularity
- **Isolated Components**: Each class has a single responsibility
- **Clear Dependencies**: Imports show exactly what each module needs
- **Composability**: Components can be combined in different ways

### Reusability
- **Backend Classes**: `SudokuBoard`, `PuzzleGenerator`, `ValidationService` can be imported into other Python projects
- **Frontend Classes**: `ThemeManager`, `TimerManager`, `LeaderboardManager` are generic and reusable
- **Configuration**: `config.py` and `config.js` can serve as templates for other projects

### Testability
- **Unit Testing**: Each class can be tested independently
- **Mock-friendly**: Services are easy to mock for testing
- **Pure Functions**: Validation methods have no side effects

### Maintainability
- **Configuration Centralization**: Game rules in one place
- **Clear File Organization**: Logical module boundaries
- **Documentation**: Each class documents its public interface

### Scalability
- **Adding Features**: New routes can use existing services
- **Extending Logic**: New validators or generators extend base classes
- **Performance**: Classes can be optimized independently

---

## Migration from Monolithic Code

### Old Pattern (Monolithic)
```python
# Global state
CURRENT = {'puzzle': None, 'solution': None}

# Route logic mixed with business logic
@app.route('/check', methods=['POST'])
def check_solution():
    # Inline validation code
    incorrect = []
    for i in range(SIZE):
        for j in range(SIZE):
            if board[i][j] != solution[i][j]:
                incorrect.append([i, j])
    return jsonify({'incorrect': incorrect})
```

### New Pattern (Modular)
```python
# Organized in services
game_service = GameService()  # Game state management
validator = ValidationService()  # Validation logic

# Route delegates to services
@app.route('/check', methods=['POST'])
def check_solution():
    result = validator.check_solution(board, solution)
    return jsonify(result)
```

---

## Future Improvements

### Phase 2 (Database Integration)
- Replace `GameService` in-memory state with database persistence
- Store leaderboard in database instead of localStorage
- Implement user accounts and saved games

### Phase 3 (Advanced Features)
- Hint system using `SolutionValidator.find_empty_cells()`
- Difficulty selector using `DIFFICULTY_PRESETS`
- Statistics tracking using `TimerManager`

### Phase 4 (Multi-player)
- Extend `GameService` to support multiplayer sessions
- Race mode using `TimerManager` for synchronization
- Collaborative solving using WebSocket coordination

---

## File Organization

```
starter/
├── app.py                    # Flask routes (thin layer)
├── config.py               # Shared configuration
├── sudoku_logic.py         # Core logic + utility classes
├── services.py             # GameService class
├── validation_service.py   # ValidationService class
├── requirements.txt
├── static/
│   ├── main.js             # Entry point
│   ├── modules/
│   │   ├── config.js       # Configuration
│   │   ├── themeManager.js # Theme handling
│   │   ├── timerManager.js # Timer logic
│   │   ├── boardManager.js # Board rendering
│   │   ├── leaderboardManager.js # Leaderboard
│   │   └── gameController.js # Game orchestration
│   └── styles.css
└── templates/
    └── index.html
```

---

## Running the Application

```bash
cd starter
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

The modular architecture is now transparent to the end user - the game still looks and feels the same, but is now built on a foundation of reusable, testable components.
