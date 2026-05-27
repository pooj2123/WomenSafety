import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { searchLocation, getRoute } from "../services/api";

const MapView = () => {
  const [startText, setStartText] = useState("");
  const [endText, setEndText] = useState("");

  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);

  const [shortestRoute, setShortestRoute] = useState([]);
  const [safestRoute, setSafestRoute] = useState([]);

  // 📍 Handle map click (optional manual selection)
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (!startPoint) {
          setStartPoint([e.latlng.lat, e.latlng.lng]);
        } else {
          setEndPoint([e.latlng.lat, e.latlng.lng]);
        }
      },
    });
    return null;
  };

  // 🔍 Handle search (text → coords → route)
  const handleSearch = async () => {
    const start = await searchLocation(startText);
    const end = await searchLocation(endText);

    if (!start || !end) {
      alert("Invalid location");
      return;
    }

    const result = await getRoute(
      [start.lat, start.lon],
      [end.lat, end.lon]
    );

    setStartPoint([start.lat, start.lon]);
    setEndPoint([end.lat, end.lon]);

    setShortestRoute(result.shortest_path || []);
    setSafestRoute(result.safest_path || []);
  };

  // 🔄 Reset everything
  const handleReset = () => {
    setStartPoint(null);
    setEndPoint(null);
    setShortestRoute([]);
    setSafestRoute([]);
    setStartText("");
    setEndText("");
  };

  return (
    <div>
      {/* 🔍 Search UI */}
      <div style={{ padding: "10px" }}>
        <input
          placeholder="Start location"
          value={startText}
          onChange={(e) => setStartText(e.target.value)}
        />

        <input
          placeholder="End location"
          value={endText}
          onChange={(e) => setEndText(e.target.value)}
          style={{ marginLeft: "10px" }}
        />

        <button onClick={handleSearch} style={{ marginLeft: "10px" }}>
          Search
        </button>

        <button onClick={handleReset} style={{ marginLeft: "10px" }}>
          Reset
        </button>
      </div>

      {/* 🗺️ Map */}
      <MapContainer
        center={[17.385, 78.486]} // Hyderabad default
        zoom={13}
        style={{ height: "90vh", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler />

        {/* 📍 Markers */}
        {startPoint && <Marker position={startPoint} />}
        {endPoint && <Marker position={endPoint} />}

        {/* 🛣️ Routes */}
        {shortestRoute.length > 0 && (
          <Polyline positions={shortestRoute} color="blue" />
        )}

        {safestRoute.length > 0 && (
          <Polyline positions={safestRoute} color="green" />
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;