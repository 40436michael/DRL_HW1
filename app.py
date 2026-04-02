from flask import Flask, render_template, request, jsonify
import numpy as np
import random

app = Flask(__name__)

GAMMA = 0.9
THRESHOLD = 1e-4

def get_possible_actions_boundary(state, blocks, n):
    r, c = state
    actions = {
        "Up": (r-1, c) if (r > 0 and (r-1, c) not in blocks) else (r, c),
        "Down": (r+1, c) if (r < n - 1 and (r+1, c) not in blocks) else (r, c),
        "Left": (r, c-1) if (c > 0 and (r, c-1) not in blocks) else (r, c),
        "Right": (r, c+1) if (c < n - 1 and (r, c+1) not in blocks) else (r, c)
    }
    return actions

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/evaluate_random_policy', methods=['POST'])
def evaluate_random_policy():
    data = request.json
    n = data.get('n', 5)
    start = tuple(data.get('start', [0, 0]))
    end = tuple(data.get('end', [n-1, n-1]))
    blocks = [tuple(p) for p in data.get('blocks', [])]
    
    # HW1-2: Generate 1 random deterministic action for each cell
    policy = [[None for _ in range(n)] for _ in range(n)]
    action_choices = ["Up", "Down", "Left", "Right"]
    for r in range(n):
        for c in range(n):
            if (r, c) == end or (r, c) in blocks:
                continue
            policy[r][c] = random.choice(action_choices)
    
    # Policy evaluation for that deterministic policy
    V = np.zeros((n, n))
    while True:
        delta = 0
        new_V = np.copy(V)
        for r in range(n):
            for c in range(n):
                if (r, c) == end or (r, c) in blocks:
                    continue
                
                act_name = policy[r][c]
                actions_map = get_possible_actions_boundary((r, c), blocks, n)
                r_next, c_next = actions_map[act_name]
                
                # Assume standard reward setup for hitting goal
                reward = 10 if (r_next, c_next) == end else -1 
                val = reward + GAMMA * V[r_next, c_next]
                new_V[r, c] = val
                delta = max(delta, abs(new_V[r, c] - V[r, c]))
                
        V = new_V
        if delta < THRESHOLD:
            break
            
    return jsonify({
        'values': V.tolist(),
        'policy': policy
    })

@app.route('/calculate', methods=['POST'])
def calculate():
    # HW1-3: Value Iteration
    data = request.json
    n = data.get('n', 5)
    start = tuple(data.get('start', [0, 0]))
    end = tuple(data.get('end', [n-1, n-1]))
    blocks = [tuple(p) for p in data.get('blocks', [])]
    
    V = np.zeros((n, n))
    policy = [[None for _ in range(n)] for _ in range(n)]
    
    # Value iteration
    while True:
        delta = 0
        new_V = np.copy(V)
        for r in range(n):
            for c in range(n):
                if (r, c) == end or (r, c) in blocks:
                    continue
                
                actions = get_possible_actions_boundary((r, c), blocks, n)
                max_val = float('-inf')
                for act_name, next_state in actions.items():
                    r_next, c_next = next_state
                    reward = 10 if next_state == end else -1 
                    val = reward + GAMMA * V[r_next, c_next]
                    if val > max_val:
                        max_val = val
                
                new_V[r, c] = max_val
                delta = max(delta, abs(new_V[r, c] - V[r, c]))
                
        V = new_V
        if delta < THRESHOLD:
            break
            
    # Calculate optimal policy
    for r in range(n):
        for c in range(n):
            if (r, c) == end or (r, c) in blocks:
                continue
                
            actions = get_possible_actions_boundary((r, c), blocks, n)
            best_act = None
            max_val = float('-inf')
            for act_name, next_state in actions.items():
                r_next, c_next = next_state
                reward = 10 if next_state == end else -1
                val = reward + GAMMA * V[r_next, c_next]
                if val > max_val:
                    max_val = val
                    best_act = act_name
                    
            policy[r][c] = best_act
            
    return jsonify({
        'values': V.tolist(),
        'policy': policy
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
