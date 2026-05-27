from fastapi import APIRouter
from app.services.routing import shortest_path, safest_path, G

router = APIRouter()

# -----------------------------
# Helper: Find nearest node
# -----------------------------
def get_nearest_node(lat, lon):
    closest_node = None
    min_dist = float("inf")

    for node, data in G.nodes(data=True):
        node_lat = data.get("y")
        node_lon = data.get("x")

        if node_lat is None or node_lon is None:
            continue

        dist = (lat - node_lat) ** 2 + (lon - node_lon) ** 2

        if dist < min_dist:
            min_dist = dist
            closest_node = node

    return closest_node


# -----------------------------
# Helper: Convert nodes → coords
# -----------------------------
def nodes_to_coords(path):
    coords = []
    for node in path:
        data = G.nodes[node]
        coords.append([data["y"], data["x"]])  # lat, lon
    return coords


# -----------------------------
# API Endpoint
# -----------------------------
@router.post("/route")
def get_route(data: dict):
    start_lat = data["start_lat"]
    start_lon = data["start_lon"]
    end_lat = data["end_lat"]
    end_lon = data["end_lon"]

    # Convert lat/lon → nearest graph nodes
    source = get_nearest_node(start_lat, start_lon)
    target = get_nearest_node(end_lat, end_lon)

    # Compute paths
    sp = shortest_path(source, target)
    safe = safest_path(source, target)

    # Return coordinates for frontend
    return {
        "shortest_path": nodes_to_coords(sp),
        "safest_path": nodes_to_coords(safe)
    }