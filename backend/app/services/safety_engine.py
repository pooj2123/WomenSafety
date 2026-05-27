import pickle
import pandas as pd
import numpy as np
from scipy.spatial import cKDTree

print("🚀 SAFETY ENGINE STARTED")

# -----------------------------
# STEP 1: Load Graph (.pkl)
# -----------------------------
with open("backend/app/data/processed_graph.pkl", "rb") as f:
    G = pickle.load(f)

print("Graph loaded:", len(G.nodes), "nodes")

# -----------------------------
# STEP 2: Load Crime Dataset
# -----------------------------
crime_df = pd.read_csv("backend/app/data/crime_data.csv")

print("Crime data loaded:", len(crime_df))

# -----------------------------
# STEP 3: Build KD-Tree (fast nearest search)
# -----------------------------
crime_points = crime_df[['lat', 'lon']].values
crime_scores = crime_df['crime_score'].values

tree = cKDTree(crime_points)

# -----------------------------
# STEP 4: Assign Safety to Each Edge
# -----------------------------
for u, v, key, data in G.edges(keys=True, data=True):

    # Node coordinates
    lat1 = G.nodes[u]['y']
    lon1 = G.nodes[u]['x']
    lat2 = G.nodes[v]['y']
    lon2 = G.nodes[v]['x']

    # Midpoint of the road
    mid_lat = (lat1 + lat2) / 2
    mid_lon = (lon1 + lon2) / 2

    # Find nearest 5 crime points
    dist, idx = tree.query([mid_lat, mid_lon], k=5)

    nearby_scores = crime_scores[idx]

    # Average crime score
    avg_crime = np.mean(nearby_scores)

    # Convert to safety
    safety_score = 1 - avg_crime

    # Attach to edge
    data['crime_score'] = float(avg_crime)
    data['safety_score'] = float(safety_score)

# -----------------------------
# STEP 5: Save Updated Graph
# -----------------------------
with open("backend/app/data/graph_with_safety.pkl", "wb") as f:
    pickle.dump(G, f)

print("✅ Safety graph created successfully!")
print("Saved as graph_with_safety.pkl")