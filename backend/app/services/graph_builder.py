import osmnx as ox
import pickle

# -----------------------------
# STEP 1: Create Graph
# -----------------------------
place = "Hyderabad, India"

G = ox.graph_from_place(place, network_type="drive")

print("Graph created:", len(G.nodes), "nodes")

# -----------------------------
# STEP 2: Save as PKL (MAIN FILE)
# -----------------------------
with open("backend/app/data/processed_graph.pkl", "wb") as f:
    pickle.dump(G, f)

print("✅ Graph saved as processed_graph.pkl")