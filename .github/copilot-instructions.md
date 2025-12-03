# Copilot Instructions for Sudoku Game Refactoring

## Project Overview
This is a Flask-based Sudoku game designed as a refactoring exercise. The architecture separates game logic (Python backend) from UI rendering (Vanilla JavaScript frontend) with clear client-server communication via Flask routes.

**Stack**: Flask 2.0+, Vanilla JavaScript (no frameworks), HTML/CSS, Python 3

## Architecture & Components

### Backend Structure (`starter/app.py`)
- **Flask routes**: `/` (serves UI), `/new` (generates puzzle), `/check` (validates solution)
- **In-memory state**: `CURRENT` dict stores the active `puzzle` and `solution` (complete filled board)
- **Key pattern**: Puzzle generation returns both clue-filled board and complete solution; client never sees solution code-side
- **Error handling**: POST `/check` returns 400 when no game is in progress

### Sudoku Logic (`starter/sudoku_logic.py`)
- **Core functions**:
  - `fill_board(board)`: Backtracking solver that fills empty board with valid numbers
  - `is_safe(board, row, col, num)`: Validates placement against row, column, and 3×3 box constraints
  - `generate_puzzle(clues=35)`: Creates puzzle by filling valid board then removing `(81-clues)` cells randomly
  - `remove_cells(board, clues)`: Removes cells but **doesn't verify uniqueness** — only approximately guarantees difficulty via clue count
- **Constants**: `SIZE=9`, `EMPTY=0`
- **Important**: Current implementation doesn't guarantee unique solutions; candidate patterns for improvement include backtracking verification

### Frontend (`static/main.js`, `templates/index.html`)
- **Board rendering**: Dynamically creates 9×9 grid of `<input>` elements; prefilled cells are disabled
- **Input validation**: Real-time filtering — only digits 1–9 accepted, stripped on input event
- **Check solution flow**: Collects board state, POSTs to `/check`, receives `{incorrect: [[row, col], ...]}`, highlights mismatches with CSS class
- **CSS classes**: `.sudoku-cell`, `.prefilled`, `.incorrect` drive styling and UX feedback

## Common Development Workflows

### Starting the Development Server
```bash
cd starter
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```
Flask runs on `http://127.0.0.1:5000` with debug mode enabled (hot-reload on changes).

### Adding Features
- **New game parameters**: Add query string to `/new` route (e.g., `?clues=40`); reflect in JavaScript `fetch('/new?clues=40')`
- **Backend validation**: All board checks happen on server; client cannot be trusted
- **New routes**: Import `sudoku_logic` module, manipulate puzzle/solution via CURRENT dict, return JSON

## Project Conventions & Patterns

### Code Style
- **Python**: Simple procedural functions with minimal abstraction; no classes in core logic
- **JavaScript**: Event listeners wired in `window.load`, dataset attributes for cell identification (`data-row`, `data-col`)
- **HTML**: Minimal structure; CSS classes drive interactivity

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
- **Test puzzle generation**: Run `python -c "import sudoku_logic; p, s = sudoku_logic.generate_puzzle(35); print(p)"` in starter directory
- **Browser DevTools**: Inspect network requests to `/check`; payload contains full board state for validation
- **Flask debug**: Errors logged to console; modify `app.run(debug=True)` for production settings

## References
- **README.md**: Lists 12 refactoring goals (timer, hints, Top 10 leaderboard, difficulty selector, etc.)
- **Key files to understand together**: `app.py` → `sudoku_logic.py` (core algorithm), then `main.js` ↔ `index.html` (UI flow)
