
import React, { useState, useEffect } from "react";

import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  CircleMarker,
  Circle,
  useMap,
} from "react-leaflet";


import "leaflet/dist/leaflet.css";
import "../styles/map.css";

import SearchBox from "./SearchBox";
import RouteInfo from "./RouteInfo";
import LoadingOverlay from "./LoadingOverlay";

import {
  destinationIcon,
  darkStartStyle,
  lightStartStyle,
} from "./icons";

const center = [17.385, 78.4867];

// -----------------------------
// AUTO FIT ROUTE
// -----------------------------
function FitBounds({ path }) {

  const map = useMap();

  useEffect(() => {

    if (path && path.length > 0) {

      map.fitBounds(path, {
        padding: [50, 50],
      });
    }

  }, [path, map]);

  return null;
}

// -----------------------------
// FLY TO CURRENT LOCATION
// -----------------------------
function FlyToLocation({ position }) {

  const map = useMap();

  useEffect(() => {

    if (position) {

      map.flyTo(position, 15, {
        duration: 2,
      });
    }

  }, [position, map]);

  return null;
}

export default function MapView() {

  const [routeType, setRouteType] =
    useState("safest");

  const [loading, setLoading] =
    useState(false);

  const [darkMode, setDarkMode] =
    useState(true);

  const [start, setStart] =
    useState(center);

  const [destination, setDestination] =
    useState([17.398, 78.495]);

  const [routeData, setRouteData] =
    useState({
      shortest: {
        path: [],
        distance_km: 0,
        time_min: 0,
      },

      safest: {
        path: [],
      },

      safety_score: 82,
    });

  const shortestPath =
    routeData?.shortest?.path || [];

  const safestPath =
    routeData?.safest?.path || [];

  const activePath =
    routeType === "shortest"
      ? shortestPath
      : safestPath;

  // -----------------------------
  // DANGER ZONES
  // -----------------------------
  const dangerZones = [

    {
      center: [17.392, 78.484],
      radius: 250,
    },

    {
      center: [17.401, 78.491],
      radius: 180,
    },

    {
      center: [17.381, 78.478],
      radius: 220,
    },
  ];

  // -----------------------------
  // SAFE ZONES
  // -----------------------------
  const safeZones = [

    {
      name: "Police Station",
      position: [17.394, 78.487],
    },

    {
      name: "24/7 Pharmacy",
      position: [17.389, 78.492],
    },

    {
      name: "Safe Metro Station",
      position: [17.397, 78.481],
    },
  ];

  // -----------------------------
  // CURRENT LOCATION
  // -----------------------------
  const useCurrentLocation = () => {

    navigator.geolocation.getCurrentPosition(

      (position) => {

        const lat =
          position.coords.latitude;

        const lon =
          position.coords.longitude;

        setStart([lat, lon]);
      },

      (err) => {

        console.log(err);

        alert("Location access denied");
      }
    );
  };

  // -----------------------------
  // CLEAR ROUTE
  // -----------------------------
  const clearRoute = () => {

    setRouteData({
      shortest: {
        path: [],
        distance_km: 0,
        time_min: 0,
      },

      safest: {
        path: [],
      },

      safety_score: 0,
    });

    setDestination(null);
  };

  return (

    <div
      style={{
        height: "100vh",
        width: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >

      {/* ANIMATIONS */}
      <style>
        {`

      @keyframes pulseDot {

        0% {
          opacity: 0.3;
          transform: scale(1);
        }

        50% {
          opacity: 1;
          transform: scale(1.4);
        }

        100% {
          opacity: 0.3;
          transform: scale(1);
        }
      }

      @keyframes pulse {

        0% {
          transform: scale(1);
          box-shadow:
            0 0 0 0 rgba(255,0,0,0.7);
        }

        70% {
          transform: scale(1.08);
          box-shadow:
            0 0 0 18px rgba(255,0,0,0);
        }

        100% {
          transform: scale(1);
          box-shadow:
            0 0 0 0 rgba(255,0,0,0);
        }
      }

      `}
      </style>

      {loading && <LoadingOverlay />}

      {/* SEARCH BOX */}
      <SearchBox
        setLoading={setLoading}
        darkMode={darkMode}
        setRouteData={setRouteData}
        setStart={setStart}
        setDestination={setDestination}
      />

      {/* ROUTE INFO */}
      <RouteInfo
        routeData={routeData}
        darkMode={darkMode}
      />

      {/* SAFETY SCORE */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,

          zIndex: 1200,

          padding: "14px 18px",

          borderRadius: "18px",

          background: darkMode
            ? "rgba(20,20,20,0.88)"
            : "rgba(255,255,255,0.92)",

          color: darkMode
            ? "#fff"
            : "#111",

          backdropFilter: "blur(14px)",

          boxShadow:
            "0 8px 28px rgba(0,0,0,0.28)",

          fontWeight: "bold",

          fontSize: "18px",
        }}
      >
        🛡️ Safety Score:
        {" "}
        {routeData?.safety_score || 0}%
      </div>

      {/* SYSTEM STATUS PANEL */}
      <div
        style={{
          position: "absolute",

          top: 90,
          right: 20,

          zIndex: 1200,

          padding: "14px 18px",

          borderRadius: "18px",

          background: darkMode
            ? "rgba(20,20,20,0.88)"
            : "rgba(255,255,255,0.92)",

          color: darkMode
            ? "#fff"
            : "#111",

          backdropFilter: "blur(14px)",

          boxShadow:
            "0 8px 28px rgba(0,0,0,0.28)",

          minWidth: "230px",
        }}
      >

        {/* RISK */}
        <div
          style={{
            marginBottom: "12px",

            display: "flex",
            alignItems: "center",
            gap: "10px",

            fontWeight: "bold",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",

              borderRadius: "50%",

              background:
                routeData?.safety_score > 75
                  ? "#00ff99"
                  : routeData?.safety_score > 50
                    ? "#ffb300"
                    : "#ff1744",
            }}
          />

          {routeData?.safety_score > 75
            ? "Low Risk Area"
            : routeData?.safety_score > 50
              ? "Medium Risk Area"
              : "High Risk Area"}
        </div>

        {/* AI */}
        <div
          style={{
            marginBottom: "12px",

            display: "flex",
            alignItems: "center",
            gap: "10px",

            fontWeight: "bold",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",

              borderRadius: "50%",

              background: "#00ff99",

              animation:
                "pulseDot 1.5s infinite",
            }}
          />

          AI Safety Engine Active
        </div>

        {/* ROUTE SWITCH */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "14px",
          }}
        >

          <button
            onClick={() =>
              setRouteType("shortest")
            }

            style={{
              flex: 1,

              padding: "10px",

              borderRadius: "10px",

              border: "none",

              cursor: "pointer",

              background:
                routeType === "shortest"
                  ? "#ff1744"
                  : darkMode
                    ? "#333"
                    : "#ddd",

              color:
                routeType === "shortest"
                  ? "#fff"
                  : darkMode
                    ? "#fff"
                    : "#111",

              fontWeight: "bold",
            }}
          >
            🔴 Shortest
          </button>

          <button
            onClick={() =>
              setRouteType("safest")
            }

            style={{
              flex: 1,

              padding: "10px",

              borderRadius: "10px",

              border: "none",

              cursor: "pointer",

              background:
                routeType === "safest"
                  ? "#0066ff"
                  : darkMode
                    ? "#333"
                    : "#ddd",

              color:
                routeType === "safest"
                  ? "#fff"
                  : darkMode
                    ? "#fff"
                    : "#111",

              fontWeight: "bold",
            }}
          >
            🔵 Safest
          </button>

        </div>

        {/* TIPS */}
        <div
          style={{
            fontSize: "13px",

            opacity: 0.85,

            lineHeight: "1.6",
          }}
        >
          • Prefer well-lit roads<br />
          • Avoid isolated shortcuts<br />
          • Stay near crowded areas
        </div>

      </div>

      {/* THEME TOGGLE */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        style={{
          position: "absolute",
          top: 290,
          right: 20,

          zIndex: 1200,

          padding: "10px 16px",

          borderRadius: "14px",

          border: "none",

          cursor: "pointer",

          background: darkMode
            ? "rgba(20,20,20,0.88)"
            : "rgba(255,255,255,0.92)",

          color: darkMode
            ? "#fff"
            : "#111",

          fontWeight: "bold",

          boxShadow:
            "0 8px 28px rgba(0,0,0,0.28)",
        }}
      >
        {darkMode ? "☀️ Light" : "🌙 Dark"}
      </button>

      {/* MY LOCATION */}
      <button
        onClick={useCurrentLocation}
        style={{
          position: "absolute",
          top: 350,
          right: 20,

          zIndex: 1200,

          padding: "10px 16px",

          borderRadius: "14px",

          border: "none",

          cursor: "pointer",

          background: darkMode
            ? "rgba(20,20,20,0.88)"
            : "rgba(255,255,255,0.92)",

          color: darkMode
            ? "#fff"
            : "#111",

          fontWeight: "bold",

          boxShadow:
            "0 8px 28px rgba(0,0,0,0.28)",
        }}
      >
        📍 My Location
      </button>

      {/* CLEAR ROUTE */}
      <button
        onClick={clearRoute}
        style={{
          position: "absolute",
          top: 410,
          right: 20,

          zIndex: 1200,

          padding: "10px 16px",

          borderRadius: "14px",

          border: "none",

          cursor: "pointer",

          background:
            "linear-gradient(135deg,#ff1744,#ff5252)",

          color: "#fff",

          fontWeight: "bold",

          boxShadow:
            "0 8px 28px rgba(255,0,0,0.35)",
        }}
      >
        ❌ Clear Route
      </button>

      {/* SOS BUTTON */}
      <button
        onClick={() => {

          alert(
            "🚨 Emergency SOS Triggered!\n\nNearest help services notified."
          );

        }}

        style={{
          position: "absolute",

          bottom: 90,
          right: 20,

          zIndex: 1300,

          width: "75px",
          height: "75px",

          borderRadius: "50%",

          border: "none",

          cursor: "pointer",

          background:
            "linear-gradient(135deg,#ff1744,#ff5252)",

          color: "#fff",

          fontWeight: "bold",

          fontSize: "20px",

          boxShadow:
            "0 8px 30px rgba(255,0,0,0.45)",

          animation:
            "pulse 1.8s infinite",
        }}
      >
        🚨 SOS
      </button>

      {/* MAP */}
      <MapContainer
        center={center}
        zoom={13}
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        

        <FitBounds path={activePath} />

        <FlyToLocation position={start} />

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url={
            darkMode
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
        />

        {/* DANGER ZONES */}
        {dangerZones.map((zone, idx) => (

          <Circle
            key={idx}

            center={zone.center}

            radius={zone.radius}

            pathOptions={{
              color: "#ff1744",

              fillColor: "#ff1744",

              fillOpacity: 0.25,
            }}
          />

        ))}

        {/* SAFE ZONES */}
        {safeZones.map((zone, idx) => (

          <CircleMarker
            key={idx}

            center={zone.position}

            radius={10}

            pathOptions={{
              color: "#00ff99",

              fillColor: "#00ff99",

              fillOpacity: 0.8,
            }}
          >
            <Popup>
              🛡️ {zone.name}
            </Popup>

          </CircleMarker>

        ))}

        {/* START */}
        {start && (
          <CircleMarker
            center={start}
            pathOptions={
              darkMode
                ? darkStartStyle
                : lightStartStyle
            }
          >
            <Popup>
              Start Location
            </Popup>
          </CircleMarker>
        )}

        {/* DESTINATION */}
        {destination && (
          <Marker
            position={destination}
            icon={destinationIcon}
          >
            <Popup>
              Destination
            </Popup>
          </Marker>
        )}

        {/* SHORTEST ROUTE */}
        {routeType === "shortest" &&
          shortestPath.length > 0 && (

            <Polyline
              positions={shortestPath}

              pathOptions={{
                color: "#ff1744",

                weight: 6,

                opacity: 0.95,
              }}
            />
          )}

        {/* SAFEST ROUTE */}
        {routeType === "safest" &&
          safestPath.length > 0 && (

            <Polyline
              positions={safestPath}

              pathOptions={{
                color: "#0066ff",

                weight: 7,

                opacity: 1,
              }}
            />
          )}

      </MapContainer>

      {/* FOOTER */}
      <div
        style={{
          position: "absolute",

          bottom: 0,
          left: 0,

          width: "100%",

          zIndex: 1500,

          padding: "6px 18px",

          background:
            "rgba(0,0,0,0.75)",

          color: "#fff",

          display: "flex",

          justifyContent: "space-between",

          alignItems: "center",

          fontSize: "12px",

          backdropFilter: "blur(10px)",
        }}
      >

        <div>
          🛰️ AI Routing Engine Online
        </div>

        <div>
          📡 Live Safety Monitoring Active
        </div>

        <div>
          🛡️ Emergency Response Enabled
        </div>

      </div>

    </div>
  );
}