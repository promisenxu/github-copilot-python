import random
import sudoku_logic
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

# In-memory game state: puzzle (clues) and solution (complete board)
# Server never sends solution to client; only used for server-side validation
CURRENT = {
    'puzzle': None,
    'solution': None
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/new')
def new_game():
    clues = int(request.args.get('clues', 35))
    puzzle, solution = sudoku_logic.generate_puzzle(clues)
    CURRENT['puzzle'] = puzzle
    CURRENT['solution'] = solution
    return jsonify({'puzzle': puzzle})

@app.route('/check', methods=['POST'])
def check_solution():
    """Validate submitted board against server-side solution.
    Returns list of incorrect cells for client-side highlighting."""
    data = request.json
    board = data.get('board')
    solution = CURRENT.get('solution')
    if solution is None:
        return jsonify({'error': 'No game in progress'}), 400
    # Collect cells that don't match the solution
    incorrect = []
    for i in range(sudoku_logic.SIZE):
        for j in range(sudoku_logic.SIZE):
            if board[i][j] != solution[i][j]:
                incorrect.append([i, j])
    return jsonify({'incorrect': incorrect})

@app.route('/hint', methods=['POST'])
def hint():
    """Provide a random unfilled cell's solution value as a hint."""
    data = request.json
    board = data.get('board')
    solution = CURRENT.get('solution')
    if solution is None:
        return jsonify({'error': 'No game in progress'}), 400
    # Find all empty cells (value 0)
    unfilled = [(i, j) for i in range(sudoku_logic.SIZE) for j in range(sudoku_logic.SIZE) if board[i][j] == 0]
    if not unfilled:
        return jsonify({'error': 'Hint can only be shown on empty cells'}), 400
    i, j = random.choice(unfilled)
    value = solution[i][j]
    # Mark this cell as prefilled so it can't be changed later
    CURRENT['puzzle'][i][j] = value
    return jsonify({'row': i, 'col': j, 'value': value})

if __name__ == '__main__':
    app.run(debug=True)