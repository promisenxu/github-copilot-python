import random
import sudoku_logic
from flask import Flask, render_template, jsonify, request
from services import GameService
from validation_service import ValidationService
import config

app = Flask(__name__)

# Global game service instance
game_service = GameService()


@app.route('/')
def index():
    """Serve the main game page."""
    return render_template('index.html')


@app.route('/new')
def new_game():
    """Generate and start a new game.

    Query parameters:
        clues (int, optional): Number of clues in puzzle (17-81, default 35)

    Returns:
        json: {'puzzle': [[...], ...]} - The puzzle board (9x9 grid)
    """
    clues = int(request.args.get('clues', config.DEFAULT_CLUES))
    puzzle = game_service.start_new_game(clues)
    return jsonify({'puzzle': puzzle})


@app.route('/check', methods=['POST'])
def check_solution():
    """Validate submitted board against server-side solution.

    Expects JSON body: {'board': [[...], ...]}

    Returns:
        json: {'incorrect': [[row, col], ...]} - List of incorrect cells
        400: If no game is in progress
    """
    if not game_service.has_active_game():
        return jsonify({'error': 'No game in progress'}), 400

    data = request.json
    board = data.get('board')
    solution = game_service.get_solution()

    result = ValidationService.check_solution(board, solution)
    return jsonify(result)


@app.route('/hint', methods=['POST'])
def hint():
    """Provide a hint by revealing a random empty cell's value.

    Expects JSON body: {'board': [[...], ...]}

    Returns:
        json: {'row': i, 'col': j, 'value': v} - Hinted cell position and value
        400: If no game in progress or no empty cells
    """
    if not game_service.has_active_game():
        return jsonify({'error': 'No game in progress'}), 400

    data = request.json
    board = data.get('board')
    solution = game_service.get_solution()

    # Find empty cells
    unfilled = ValidationService.get_hint_cells(board)
    if not unfilled:
        return jsonify({'error': 'Hint can only be shown on empty cells'}), 400

    # Pick random empty cell and fill with solution value
    i, j = random.choice(unfilled)
    value = solution[i][j]

    # Update puzzle so this cell becomes prefilled (cannot be changed later)
    puzzle = game_service.get_puzzle()
    puzzle[i][j] = value

    return jsonify({'row': i, 'col': j, 'value': value})


if __name__ == '__main__':
    app.run(debug=True)
