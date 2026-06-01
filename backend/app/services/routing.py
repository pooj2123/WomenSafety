import pickle
import networkx as nx

print("🚀 ROUTING ENGINE STARTED")

with open("app/data/processed_graph.pkl", "rb") as f:
    G = pickle.load(f)

print("Graph loaded:", len(G.nodes), "nodes")

# ✅ no G parameter
def shortest_path(source, target):
    return nx.shortest_path(G, source, target, weight='length')


def safest_path(source, target):

    def cost(u, v, data):
        distance = data.get('length', 1)
        safety = data.get('safety_score', 0.5)
        return distance + (1 - safety) * 100

    return nx.shortest_path(G, source, target, weight=cost)