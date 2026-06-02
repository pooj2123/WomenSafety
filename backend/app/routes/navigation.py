from fastapi import APIRouter, HTTPException
import osmnx as ox
from app.services.rl_service import get_safest_path
from app.services.routing import (
    G,
    shortest_path,
    safest_path,
)
from app.services.rl_service import get_safest_path

router = APIRouter()

@router.post("/route")
def get_route(data: dict):
    try:
        required = [
            "start_lat",
            "start_lon",
            "end_lat",
            "end_lon"
        ]

        for field in required:
            if field not in data:
                raise HTTPException(
                    status_code=400,
                    detail=f"Missing field: {field}"
                )

        start_lat = float(data["start_lat"])
        start_lon = float(data["start_lon"])
        end_lat = float(data["end_lat"])
        end_lon = float(data["end_lon"])

        source = get_nearest_node(start_lat, start_lon)
        target = get_nearest_node(end_lat, end_lon)

        if source is None:
            raise HTTPException(
                status_code=404,
                detail="Could not find nearest start node"
            )

        if target is None:
            raise HTTPException(
                status_code=404,
                detail="Could not find nearest destination node"
            )

        shortest = shortest_path(source, target)
        safest = get_safest_path(source, target)
        


        if not shortest:
            raise HTTPException(
                status_code=404,
                detail="Shortest path not found"
            )

        if not safest:
            raise HTTPException(
                status_code=404,
                detail="Safest path not found"
            )

        distance = calculate_distance(G, shortest)
        time_seconds = distance / 1.4

        safest_distance = calculate_distance(G, safest)
        safest_time = safest_distance / 1.4

        return {
            "success": True,
            "shortest": {
                "path": nodes_to_coords(shortest),
                "distance_km": round(distance / 1000, 2),
                "time_min": round(time_seconds / 60, 2)
            },
            "safest": {
                "path": nodes_to_coords(safest)
            }
        }

    except HTTPException:
        raise

    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Coordinates must be numeric"
        )

    except KeyError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Missing key: {str(e)}"
        )

    except Exception as e:
        print("Navigation Error:", e)

        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )


# -----------------------------
# Nearest Node
# -----------------------------
def get_nearest_node(lat, lon):
    try:
        return ox.distance.nearest_nodes(G, lon, lat)
    except Exception as e:
        print("Nearest node error:", e)
        return None


# -----------------------------
# Distance Calculator
# -----------------------------
def calculate_distance(graph, path):
    total = 0
    for i in range(len(path) - 1):
        try:
            edge = graph[path[i]][path[i + 1]][0]
            total += edge.get("length", 0)
        except Exception:
            pass

    return total


# -----------------------------
# Nodes -> Coordinates
# -----------------------------
def nodes_to_coords(path):
    coords = []

    for node in path:
        node_data = G.nodes[node]
        coords.append([
            node_data["y"],  # latitude
            node_data["x"]   # longitude
        ])

    return coords

# -----------------------------
# Route API
# -----------------------------
