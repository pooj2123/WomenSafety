import torch
import pickle
import numpy as np

from rl.dqn import DQN

class RLRouter:
    def __init__(self):
        with open("app/data/processed_graph.pkl", "rb") as f:
            self.G = pickle.load(f)

        self.model = DQN(input_dim=4, output_dim=10)

        self.model.load_state_dict(
            torch.load(
                "app/rl/dqn_model.pth",
                map_location="cpu"
            )
        )

        self.model.eval()

    def build_state(self, current, target):
        c = self.G.nodes[current]
        t = self.G.nodes[target]

        return np.array([
            c["y"],
            c["x"],
            t["y"],
            t["x"]
        ], dtype=np.float32)

    def choose_next(self, current, target):
        neighbors = list(self.G.neighbors(current))

        if not neighbors:
            return None

        state = torch.FloatTensor(
            self.build_state(current, target)
        )

        with torch.no_grad():
            q_values = self.model(state)[0]

        valid_q = q_values[: len(neighbors)]

        best_idx = torch.argmax(valid_q).item()

        return neighbors[best_idx]

    def generate_route(
        self,
        start,
        target,
        max_steps=100
    ):
        route = [start]
        current = start

        visited = set([start])

        for _ in range(max_steps):

            if current == target:
                break

            nxt = self.choose_next(
                current,
                target
            )

            if nxt is None:
                break

            if nxt in visited:
                break

            route.append(nxt)

            visited.add(nxt)
            current = nxt

        return route