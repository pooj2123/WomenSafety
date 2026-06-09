import os
import pickle
import torch
import networkx as nx

from rl.env import GraphEnv
from rl.dqn import DQN

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

GRAPH_PATH = os.path.abspath(
    os.path.join(
        CURRENT_DIR,
        "..",
        "data",
        "processed_graph.pkl"
    )
)

MODEL_PATH = os.path.abspath(
    os.path.join(
        CURRENT_DIR,
        "..",
        "..",
        "rl",
        "dqn_model.pth"
    )
)

G = None
env = None
model = None


def load_resources():
    global G, env, model

    if G is None:
        with open(GRAPH_PATH, "rb") as f:
            G = pickle.load(f)

        env = GraphEnv(G)

        model = DQN(
            input_dim=6,
            output_dim=10
        )

        model.load_state_dict(
            torch.load(
                MODEL_PATH,
                map_location="cpu"
            )
        )

        model.eval()

        print("🚀 ROUTING ENGINE STARTED")
        print("Graph loaded:", len(G.nodes), "nodes")

    return G, env, model


def get_safest_path(start_node, target_node):

    G, env, model = load_resources()

    state = env.reset(
        start_node,
        target_node
    )

    path = [start_node]
    visited = {start_node}
    max_steps = 100

    for _ in range(max_steps):

        actions = env.get_actions(env.current)

        if not actions:
            break

        state_tensor = torch.FloatTensor(state)

        with torch.no_grad():
            q_values = model(state_tensor)

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

        state, reward, done = env.step(next_node)

        path.append(next_node)

        if done:
            print("RL reached destination")
            print("Final route nodes:", len(path))
            return path

    print("RL failed before destination")

    try:
        remaining = nx.shortest_path(
            G,
            env.current,
            target_node,
            weight="length"
        )

        if len(remaining) > 1:
            path.extend(remaining[1:])

    except Exception as e:
        print("FALLBACK ERROR:", str(e))

    return path