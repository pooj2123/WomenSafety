import pickle

with open("backend/app/data/processed_graph.pkl", "rb") as f:
    G = pickle.load(f)

print("Total nodes:", len(G.nodes))
print("Total edges:", len(G.edges))