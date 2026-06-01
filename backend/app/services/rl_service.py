import os
import pickle 
import torch
from rl.env import GraphEnv
from rl.dqn import DQN

print("GraphEnv =", GraphEnv)
print("DQN =", DQN)

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

GRAPH_PATH = os.path.join(
    CURRENT_DIR,
    "..",
    "data",
    "processed_graph.pkl"
)

GRAPH_PATH = os.path.abspath(GRAPH_PATH)

print("GRAPH_PATH =", GRAPH_PATH)
print("EXISTS =", os.path.exists(GRAPH_PATH))

with open(GRAPH_PATH, "rb") as f:
    G = pickle.load(f)

env = GraphEnv(G)

model = DQN(input_dim=4, output_dim=10)

MODEL_PATH = os.path.abspath(
    os.path.join(
        CURRENT_DIR,
        "..",
        "..",
        "rl",
        "dqn_model.pth"
    )
)

print("MODEL_PATH =", MODEL_PATH)
print("MODEL EXISTS =", os.path.exists(MODEL_PATH))

model.load_state_dict(
    torch.load(
        MODEL_PATH,
        map_location="cpu"
    )
)

model.eval()


def get_safest_path(start_node, target_node):

    state = env.reset(
        start_node,
        target_node
    )

    path = [start_node]

    visited = {start_node}

    max_steps = 100

    for _ in range(max_steps):

        actions = env.get_actions(
            env.current
        )

        if not actions:
            break

        state_tensor = torch.FloatTensor(
            state
        )

        with torch.no_grad():
            q_values = model(
                state_tensor
            )

        sorted_actions = torch.argsort(
            q_values[0],
            descending=True
        )

        next_node = None

        for idx in sorted_actions:

            idx = idx.item()

            if idx >= len(actions):
                continue

            candidate = actions[idx]

            if candidate not in visited:
                next_node = candidate
                break

        if next_node is None:
            break

        visited.add(next_node)

        state, reward, done = env.step(
            next_node
        )

        path.append(next_node)

        if done:
            break

    return path