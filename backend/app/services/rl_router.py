import torch
import pickle
import numpy as np
import networkx as nx

from rl.dqn import DQN

print("USING RL ROUTER FILE:", __file__)

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

        valid_q = q_values[:len(neighbors)]

        best_idx = torch.argmax(valid_q).item()

        return neighbors[best_idx]

    def generate_route(
        self,
        start,
        target,
        max_steps=100
    ):
        print("=== NEW RL ROUTER LOADED ===")
        route = [start]
        current = start

        visited = {start}

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

        print("Safest path nodes:", len(route))
        print("Destination reached:", current == target)

        if current != target:
            print("ENTERING FALLBACK")

            try:
                remaining = nx.shortest_path(
                    self.G,
                    current,
                    target,
                    weight="length"
                )

                print(
                    "Fallback added:",
                    len(remaining),
                    "nodes"
                )

                route.extend(remaining[1:])

            except Exception as e:
                print("FALLBACK ERROR:", str(e))

        print("Final route nodes:", len(route))


        print("Current node:", current)
        print("Target node:", target)

        if current != target:
            print("ENTERING FALLBACK")

            try:
                from app.services.routing import shortest_path

                remaining = shortest_path(current, target)

                print("Remaining path:", len(remaining))

                if remaining and len(remaining) > 1:
                    route.extend(remaining[1:])

            except Exception as e:
                print("Fallback failed:", e)

        return route