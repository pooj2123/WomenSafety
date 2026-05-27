import osmnx as ox
import pandas as pd
import numpy as np
import random
from sklearn.cluster import KMeans

# -----------------------------
# STEP 1: Load Graph
# -----------------------------
import pickle

with open("backend/app/data/processed_graph.pkl", "rb") as f:
    G = pickle.load(f)

# Convert graph to GeoDataFrames
nodes, edges = ox.graph_to_gdfs(G)

# -----------------------------
# STEP 2: Extract Coordinates
# -----------------------------
points = nodes[['y', 'x']].copy()
points.columns = ['lat', 'lon']
points.reset_index(drop=True, inplace=True)

print("Points extracted:", points.shape)
print("Total nodes:", len(points))

# -----------------------------
# STEP 3: Clustering (Zones)
# -----------------------------
k = 10

kmeans = KMeans(n_clusters=k, random_state=42)
points['cluster'] = kmeans.fit_predict(points[['lat', 'lon']])

# -----------------------------
# STEP 4: Assign Zone Types
# -----------------------------
cluster_zone = {}

for i in range(k):
    if i < 3:
        cluster_zone[i] = "high"
    elif i < 7:
        cluster_zone[i] = "medium"
    else:
        cluster_zone[i] = "low"

points['zone'] = points['cluster'].map(cluster_zone)

# -----------------------------
# STEP 5: Define Score Ranges
# -----------------------------
zone_ranges = {
    "high": (0.75, 0.95),
    "medium": (0.4, 0.65),
    "low": (0.05, 0.3)
}

def get_score(zone):
    low, high = zone_ranges[zone]
    return random.uniform(low, high)

points['crime_score'] = points['zone'].apply(get_score)

# -----------------------------
# STEP 6: Add Noise
# -----------------------------
points['crime_score'] += np.random.normal(0, 0.03, size=len(points))
points['crime_score'] = points['crime_score'].clip(0, 1)

# -----------------------------
# STEP 7: Spatial Decay
# -----------------------------
centers = kmeans.cluster_centers_

def compute_decay(row):
    center = centers[row['cluster']]
    dist = np.linalg.norm([
        row['lat'] - center[0],
        row['lon'] - center[1]
    ])
    return np.exp(-dist * 50)

points['decay'] = points.apply(compute_decay, axis=1)

points['crime_score'] *= points['decay']
points['crime_score'] = points['crime_score'].clip(0, 1)

# -----------------------------
# STEP 8: Final Dataset
# -----------------------------
final_df = points[['lat', 'lon', 'cluster', 'zone', 'crime_score']]

# -----------------------------
# STEP 9: Save CSV
# -----------------------------
final_df.to_csv("backend/app/data/crime_data.csv", index=False)

print("✅ Dataset generated successfully!")
print(final_df.head())