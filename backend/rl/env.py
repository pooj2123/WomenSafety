import numpy as np


class GraphEnv:
    def __init__(self, G):
        self.G = G
        self.current = None
        self.target = None
        self.visited = set()

    def reset(self, start, target):
        self.current = start
        self.target = target
        self.visited = {start}
        return self._get_state()

    def get_actions(self, node):
        return list(self.G.neighbors(node))

    def step(self, action):
        next_node = action

        edge = self.G[self.current][next_node][0]

        distance = edge.get("length", 1)
        safety = edge.get("safety_score", 0.5)
        lighting = edge.get("lighting_score", 0.5)
        crowd = edge.get("crowd_score", 0.5)
        surveillance = edge.get("surveillance_score", 0.5)
        road_quality = edge.get("road_quality", 0.5)

        reward = self._calculate_reward(
            next_node,
            distance,
            safety,
            lighting,
            crowd,
            surveillance,
            road_quality
        )

        done = next_node == self.target

        self.current = next_node
        self.visited.add(next_node)

        return self._get_state(), reward, done

    def _calculate_reward(
        self,
        next_node,
        distance,
        safety,
        lighting,
        crowd,
        surveillance,
        road_quality
    ):
        reward = 0

        # Distance penalty
        reward -= distance * 0.002

        # Safety metrics
        reward += safety * 20
        reward += lighting * 10
        reward += crowd * 8
        reward += surveillance * 12
        reward += road_quality * 6

        # Loop penalty
        if next_node in self.visited:
            reward -= 5

        # Destination reward
        if next_node == self.target:
            reward += 1000

        return reward

    def _get_state(self):
        current_data = self.G.nodes[self.current]
        target_data = self.G.nodes[self.target]

        return np.array([
            current_data["y"],
            current_data["x"],
            target_data["y"],
            target_data["x"]
        ], dtype=np.float32)