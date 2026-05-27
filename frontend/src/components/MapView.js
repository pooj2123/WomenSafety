import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getRoute } from "../services/api";

// -----------------------------
// Custom marker icons
// -----------------------------
const startIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  iconSize: [32, 32],
});

const endIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
});

// -----------------------------
// Handle map clicks
// -----------------------------
function ClickHandler({ setPoints }) {
  useMapEvents({
    click(e) {
      setPoints((prev) => {
        // If already 2 points → reset with new start
        if (prev.length >= 2) {
          return [[e.latlng.lat, e.latlng.lng]];
        }
        return [...prev, [e.latlng.lat, e.latlng.lng]];
      });
    },
  });
  return null;
}

// -----------------------------
// Main component
// -----------------------------
function MapView() {
  const [points, setPoints] = useState([]);
  const [route, setRoute] = useState(null);

  // -----------------------------
  // Fetch route
  // -----------------------------
  const handleRoute = async () => {
    if (points.length < 2) {
      alert("Select start and end points");
      return;
    }

    try {
      const res = await getRoute(points[0], points[1]);
      setRoute(res);
    } catch (err) {
      console.error("Error fetching route:", err);
      alert("Failed to fetch route");
    }
  };

  // -----------------------------
  // Reset everything
  // -----------------------------
  const handleReset = () => {
    setPoints([]);
    setRoute(null);
  };

  return (
    <div>
      <MapContainer
        center={[17.385, 78.486]} // Hyderabad default
        zoom={13}
        style={{ height: "80vh", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <ClickHandler setPoints={setPoints} />

        {/* Start Marker */}
        {points[0] && <Marker position={points[0]} icon={startIcon} />}

        {/* End Marker */}
        {points[1] && <Marker position={points[1]} icon={endIcon} />}

        {/* Shortest Path */}
        {route && route.shortest_path && (
          <Polyline positions={route.shortest_path} color="blue" />
        )}

        {/* Safest Path */}
        {route && route.safest_path && (
          <Polyline positions={route.safest_path} color="green" />
        )}
      </MapContainer>

      {/* Buttons */}
      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <button onClick={handleRoute}>Get Route</button>

        <button
          onClick={handleReset}
          style={{ marginLeft: "10px" }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default MapView;