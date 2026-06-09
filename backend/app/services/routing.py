import pickle
import networkx as nx

print("🚀 ROUTING ENGINE STARTED")

G = None

def get_graph():
    global G
    if G is None:
        with open("app/data/processed_graph.pkl", "rb") as f:
            G = pickle.load(f)
        print("Graph loaded:", len(G.nodes), "nodes")
    return G


def shortest_path(source, target):
    graph = get_graph()
    return nx.shortest_path(
        graph,
        source,
        target,
        weight="length"
    )


def safest_path(source, target):

    graph = get_graph()

    def cost(u, v, data):
        distance = data.get("length", 1)
        safety = data.get("safety_score", 0.5)
        return distance + (1 - safety) * 100

    return nx.shortest_path(
        graph,
        source,
        target,
        weight=cost
    )