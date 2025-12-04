# Copilot Instructions for Sudoku Game Refactoring

## Documentation Guidelines
- **Add comments for non-obvious logic, critical sections, and key algorithms**
- **Keep comments concise—don't over-explain obvious things**
- **Avoid redundant comments that restate the code**
- **Focus on "why" and "what" for complex flows, not literal code translation**
- **Document function purpose, key parameters, and any non-standard patterns**

## Project Overview
This is a Flask-based Sudoku game designed as a refactoring exercise. The architecture separates game logic (Python backend) from UI rendering (Vanilla JavaScript frontend) with clear client-server communication via Flask routes.

**Stack**: Flask 2.0+, Vanilla JavaScript (ES6 modules), HTML/CSS, Python 3

**Virtual Environment**: Located at `/starter/.venv` - MUST be activated before any Python operations

## Architecture & Components

### Backend Structure (Modular Services)
- **`app.py`**: Flask routes - thin layer that delegates to services
- **`services.py`**: `GameService` - manages game state (puzzle, solution)
- **`validation_service.py`**: `ValidationService` - handles solution validation
- **`sudoku_logic.py`**: Core logic functions + utility classes (`SudokuBoard`, `PuzzleGenerator`, `SolutionValidator`)
- **`config.py`**: Centralized configuration constants

### Frontend Structure (ES6 Modules)
- **`static/modules/config.js`**: Configuration constants
- **`static/modules/themeManager.js`**: Dark/light mode handling
- **`static/modules/timerManager.js`**: Game timer management
- **`static/modules/boardManager.js`**: Board rendering and state
- **`static/modules/leaderboardManager.js`**: High score persistence
- **`static/modules/gameController.js`**: Game flow orchestration
- **`static/main.js`**: Entry point - initializes all modules
- **`templates/index.html`**: Minimal HTML structure

## Common Development Workflows

### CRITICAL: Virtual Environment Setup
**ALWAYS** activate the virtual environment in `/starter/.venv` before running ANY Python commands or terminal operations:

```bash
cd /Users/promisexu/github-copilot-python/starter
source .venv/bin/activate
```

This must be done BEFORE:
- Running `python app.py`
- Running `python -m pytest`
- Running any Python scripts
- Installing packages with `pip`
- Using `mcp_pylance_mcp_s_pylanceRunCodeSnippet` or similar tools

The `.venv` folder already exists in the starter directory - do NOT create a new one.

### Starting the Development Server
```bash
# Navigate to starter and activate venv first!
cd /Users/promisexu/github-copilot-python/starter
source .venv/bin/activate

# Then start the server
python app.py
```
Flask runs on `http://127.0.0.1:5000` with debug mode enabled (hot-reload on changes).

### Running Tests
All tests are located in the `/tests` directory at the root level:

```bash
# Make sure you're in starter directory with venv activated
cd /Users/promisexu/github-copilot-python/starter
source .venv/bin/activate

# Run tests from root directory
cd ..
python -m pytest tests/ -v
```

**Important**: Always ensure the virtual environment in `/starter/.venv` is activated before running tests. The test files use path manipulation to import the Flask app and sudoku logic from the starter directory.

For one-time setup of test dependencies:
```bash
cd /Users/promisexu/github-copilot-python/starter
source .venv/bin/activate
pip install -r dev_requirements.txt
```

### Adding Features
- **New game parameters**: Add query string to `/new` route (e.g., `?clues=40`); reflect in JavaScript `fetch('/new?clues=40')`
- **Backend validation**: All board checks happen on server; client cannot be trusted
- **New routes**: Use `GameService` for state management and `ValidationService` for validation
- **Frontend components**: Extend module classes in `static/modules/` for new features

## Project Conventions & Patterns

### Code Style
- **Python**: Simple procedural functions with minimal abstraction; modular service classes for state management and validation
- **JavaScript**: ES6 modules with class-based components for UI managers, timer, board, leaderboard, and game controller
- **HTML**: Minimal structure; CSS classes drive interactivity
- **Virtual Environment**: ALWAYS activate `/starter/.venv` before running Python commands

### CSS Styling Conventions
- **Responsive design**: Use viewport-relative units (%, `rem`, `em`) and media queries; layout and font sizes must adapt cleanly between mobile and desktop
- **Dark/light mode**: All text and buttons must remain visible in both light and dark modes; use high-contrast colors, avoid pure black/white combinations that fail in inverted displays
- **Class naming**: Clear, concise names following pattern `.[component]-[state]` (e.g., `.sudoku-cell`, `.sudoku-cell.incorrect`, `.sudoku-cell.prefilled`) — avoid abbreviations and single-letter classes

### Data Flow Conventions
- **Puzzle representation**: 9×9 nested list `[[int, ...], ...]` where 0 = empty, 1–9 = given/filled
- **Validation responses**: Always return `{incorrect: [[row, col], ...]}` or `{error: "message"}` from POST routes
- **Client state**: `puzzle` variable stores original puzzle state; re-rendered on new game only

### Known Limitations & Refactoring Goals
- No persistent storage (scores currently lost on refresh)
- Timer and hint features referenced in README but not yet implemented
- No difficulty selection affecting clue count
- Cell validation happens client-side only; no server-side real-time feedback
- Puzzle uniqueness not verified; only clue count controls difficulty approximation

## Integration Points
- **Static files**: Flask serves `/static/` directory; update paths if moving CSS/JS
- **Template rendering**: `render_template()` loads `templates/index.html`; no Jinja2 templating currently in use
- **CORS/XHR**: All requests within same origin; no special headers needed

## Testing & Debugging

### Unit Tests
- **Framework**: pytest with pytest-cov for coverage reporting
- **Test location**: `/tests/` directory at project root
- **Running tests**: From project root with venv activated: `python3 -m pytest tests/ -v`
- **Coverage report**: `python3 -m pytest tests/ --cov=starter --cov-report=html`
- **Test dependencies**: Specified in `starter/dev_requirements.txt`; install with `pip install -r dev_requirements.txt`
- **Important**: Tests import from starter directory using path manipulation in `tests/test_app.py` fixture setup

### Manual Testing
- **Test puzzle generation**: In starter directory with venv activated, run `python -c "import sudoku_logic; p, s = sudoku_logic.generate_puzzle(35); print(p)"`
- **Browser DevTools**: Inspect network requests to `/check`; payload contains full board state for validation
- **Flask debug**: Errors logged to console; modify `app.run(debug=True)` for production settings
- **Activate venv before running Python commands**: Always ensure virtual environment is active in `/starter/.venv`

## Key Files to Reference
- **Backend modules**: `app.py` → `services.py` / `validation_service.py` → `sudoku_logic.py`
- **Frontend modules**: `main.js` → `gameController.js` → individual managers (board, timer, etc.)
- **Configuration**: `config.py` (backend), `config.js` (frontend)
- **Architecture docs**: `ARCHITECTURE.md`, `MODULES_REFERENCE.md`

## References
- **README.md**: Lists refactoring goals completed
- **ARCHITECTURE.md**: Detailed modular component architecture
- **MODULES_REFERENCE.md**: Quick API reference for all modules
