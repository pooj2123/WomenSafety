import React, { useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { searchLocation, getRoute } from "../services/api";

const MapView = () => {
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    try {
      setLoading(true);

      const start = await searchLocation(startInput);
      const end = await searchLocation(endInput);

      if (!start || !end) {
        alert("Invalid locations");
        setLoading(false);
        return;
      }

      const routeData = await getRoute(start, end);

      if (routeData.error) {
        alert(routeData.error);
        setLoading(false);
        return;
      }

      setRoute(routeData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>

      {/* 🔍 SEARCH PANEL */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#ffffff",
          padding: "18px",
          borderRadius: "14px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
          zIndex: 1000,
          width: "340px",
        }}
      >
        <h3 style={{ marginBottom: "10px" }}>🚶 Safe Route Finder</h3>

        <input
          type="text"
          placeholder="Start location"
          value={startInput}
          onChange={(e) => setStartInput(e.target.value)}
          style={{
            width: "100%",
            marginBottom: "10px",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />

        <input
          type="text"
          placeholder="Destination"
          value={endInput}
          onChange={(e) => setEndInput(e.target.value)}
          style={{
            width: "100%",
            marginBottom: "12px",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={handleSearch}
          style={{
            width: "100%",
            padding: "12px",
            background: loading ? "#888" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {loading ? "Loading..." : "Find Route"}
        </button>
      </div>

      {/* 📊 ROUTE INFO */}
      {route && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            background: "#ffffff",
            padding: "15px",
            borderRadius: "12px",
            boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
            zIndex: 1000,
            minWidth: "220px",
          }}
        >
          <h4 style={{ marginBottom: "8px" }}>📍 Route Info</h4>
          <p>📏 {route.shortest.distance_km.toFixed(2)} km</p>
          <p>⏱️ {route.shortest.time_min.toFixed(1)} mins</p>

          <div style={{ marginTop: "10px", fontSize: "13px" }}>
            <div>🔵 Shortest Route</div>
            <div>🟢 Safest Route (Highlighted)</div>
          </div>
        </div>
      )}

      {/* 🗺️ MAP */}
      <MapContainer
        center={[17.385, 78.4867]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 🔵 Shortest (faded background route) */}
        {route && route.shortest?.path && (
          <Polyline
            positions={route.shortest.path}
            color="#4da3ff"
            weight={4}
            opacity={0.4}
          />
        )}

        {/* 🟢 Safest (PRIMARY highlighted route) */}
        {route && route.safest?.path && (
          <>
            {/* Glow effect (thick base) */}
            <Polyline
              positions={route.safest.path}
              color="#28a745"
              weight={10}
              opacity={0.2}
            />

            {/* Main line */}
            <Polyline
              positions={route.safest.path}
              color="#28a745"
              weight={6}
            />

            {/* Start & End markers */}
            <Marker position={route.safest.path[0]} />
            <Marker position={route.safest.path[route.safest.path.length - 1]} />
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;