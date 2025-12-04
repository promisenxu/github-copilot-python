import pytest
import sys
from pathlib import Path

# Add the starter directory to the path so we can import app and sudoku_logic
starter_path = Path(__file__).parent.parent / 'starter'
sys.path.insert(0, str(starter_path))

from app import app, game_service


@pytest.fixture
def client():
    """Create a test client for the Flask app."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_root_path_status_code(client):
    """Test that the root path returns a 200 status code."""
    response = client.get('/')
    assert response.status_code == 200


def test_root_path_returns_html(client):
    """Test that the root path returns HTML content."""
    response = client.get('/')
    assert response.content_type == 'text/html; charset=utf-8'


def test_new_game_endpoint(client):
    """Test that the /new endpoint returns a puzzle."""
    response = client.get('/new')
    assert response.status_code == 200
    data = response.get_json()
    assert 'puzzle' in data
    assert isinstance(data['puzzle'], list)
    assert len(data['puzzle']) == 9
    # Check that each row has 9 elements
    for row in data['puzzle']:
        assert len(row) == 9


def test_new_game_with_custom_clues(client):
    """Test that the /new endpoint accepts custom clue count."""
    response = client.get('/new?clues=40')
    assert response.status_code == 200
    data = response.get_json()
    assert 'puzzle' in data
    assert isinstance(data['puzzle'], list)


def test_check_solution_without_game(client):
    """Test that /check returns 400 error when no game is in progress."""
    # Reset the game service state to ensure no game is in progress
    game_service.reset()
    
    response = client.post('/check', json={'board': [[0] * 9 for _ in range(9)]})
    assert response.status_code == 400
    data = response.get_json()
    assert 'error' in data
    assert data['error'] == 'No game in progress'


def test_check_solution_with_incorrect_board(client):
    """Test that /check returns incorrect cells for an incomplete board."""
    # Start a new game
    client.get('/new')
    
    # Create a board filled with zeros (all incorrect)
    board = [[0] * 9 for _ in range(9)]
    response = client.post('/check', json={'board': board})
    assert response.status_code == 200
    data = response.get_json()
    assert 'incorrect' in data
    assert isinstance(data['incorrect'], list)
    # Should have incorrect cells since we submitted all zeros
    assert len(data['incorrect']) > 0


def test_check_solution_with_valid_board(client):
    """Test that /check returns empty incorrect list for correct solution."""
    # Start a new game
    new_response = client.get('/new')
    puzzle_data = new_response.get_json()
    puzzle = puzzle_data['puzzle']
    
    # Get the solution from the game service
    solution = game_service.get_solution()
    
    # Check the solution
    response = client.post('/check', json={'board': solution})
    assert response.status_code == 200
    data = response.get_json()
    assert 'incorrect' in data
    assert data['incorrect'] == []  # No incorrect cells
