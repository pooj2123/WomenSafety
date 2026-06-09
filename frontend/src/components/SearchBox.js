import React, { useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

export default function SearchBox({

  setLoading,
  darkMode,

  setRouteData,
  setStart,
  setDestination,

}) {

  const [startPlace, setStartPlace] =
    useState("");

  const [destinationPlace, setDestinationPlace] =
    useState("");

  // -----------------------------
  // GEOCODE LOCATION
  // -----------------------------
  const geocodePlace = async (place) => {

    try {

      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${place}`
      );

      if (response.data.length === 0) {
        return null;
      }

      return [
        parseFloat(response.data[0].lat),
        parseFloat(response.data[0].lon),
      ];

    } catch (err) {

      console.log(err);
      return null;
    }
  };

  // -----------------------------
// SWAP LOCATIONS
// -----------------------------
const swapLocations = () => {

  const temp = startPlace;

  setStartPlace(destinationPlace);

  setDestinationPlace(temp);
};

  // -----------------------------
  // HANDLE SEARCH
  // -----------------------------
  const handleSearch = async () => {

    if (!startPlace || !destinationPlace) {

      toast.error("Enter both locations");
      return;
    }

    try {

      setLoading(true);

      toast.loading(
        "Generating safest route...",
        {
          id: "route",
        }
      );

      // -----------------------------
      // GEOCODE
      // -----------------------------
      const startCoords =
        await geocodePlace(startPlace);

      const destinationCoords =
        await geocodePlace(destinationPlace);

      if (!startCoords || !destinationCoords) {

        toast.error("Location not found", {
          id: "route",
        });

        setLoading(false);
        return;
      }

      // -----------------------------
      // UPDATE MAP MARKERS
      // -----------------------------
      setStart(startCoords);

      setDestination(destinationCoords);

      // -----------------------------
      // BACKEND API
      // -----------------------------
      const response = await axios.post(
  "https://womensafety-xlaj.onrender.com/api/navigation/route",
  {
    start_lat: startCoords[0],
    start_lon: startCoords[1],
    end_lat: destinationCoords[0],
    end_lon: destinationCoords[1],
  }
);

console.log("SAFEST PATH:", response.data.safest);
console.log("SHORTEST PATH:", response.data.shortest);

setRouteData(response.data);

console.log("SAFEST PATH:", response.data.safest);
console.log("SHORTEST PATH:", response.data.shortest);

      console.log(response.data);

      // -----------------------------
      // UPDATE ROUTE
      // -----------------------------
      setRouteData(response.data);

      toast.success(
        "Safe route generated!",
        {
          id: "route",
        }
      );

    } catch (err) {

      console.log(err);

      toast.error(
        "Failed to fetch route",
        {
          id: "route",
        }
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <div
      style={{
        position: "absolute",

        top: 20,
        left: 20,

        zIndex: 1200,

        width: "320px",

        padding: "18px",

        borderRadius: "20px",

        background: darkMode
          ? "rgba(20,20,20,0.82)"
          : "rgba(255,255,255,0.92)",

        backdropFilter: "blur(14px)",

        boxShadow:
          "0 8px 32px rgba(0,0,0,0.25)",

        display: "flex",
        flexDirection: "column",

        gap: "8px",
      }}
    >

      <h2
        style={{
          margin: 0,

          color: darkMode
            ? "#fff"
            : "#111",

          fontSize: "20px",

          fontWeight: "700",
        }}
      >
        Women Safety Navigation
      </h2>

      {/* START INPUT */}
      <input
        type="text"

        placeholder="Enter source location"

        value={startPlace}

        onChange={(e) =>
          setStartPlace(e.target.value)
        }

        style={{
          padding: "14px",

          borderRadius: "12px",

          border: "none",

          outline: "none",

          background: darkMode
            ? "rgba(255,255,255,0.08)"
            : "#f3f3f3",

          color: darkMode
            ? "#fff"
            : "#111",

          fontSize: "15px",
        }}
      />

      {/* SWAP BUTTON */}
<button
  onClick={swapLocations}

  style={{
    width: "45px",

    alignSelf: "center",

    padding: "8px",

    borderRadius: "50%",

    border: "none",

    cursor: "pointer",

    background: darkMode
      ? "rgba(255,255,255,0.08)"
      : "#f1f1f1",

    color: darkMode
      ? "#fff"
      : "#111",

    fontSize: "18px",

    fontWeight: "bold",
  }}
>
  ⇅
</button>

      {/* DESTINATION INPUT */}
      <input
        type="text"

        placeholder="Enter destination"

        value={destinationPlace}

        onChange={(e) =>
          setDestinationPlace(
            e.target.value
          )
        }

        style={{
          padding: "12px",

          borderRadius: "12px",

          border: "none",

          outline: "none",

          background: darkMode
            ? "rgba(255,255,255,0.08)"
            : "#f3f3f3",

          color: darkMode
            ? "#fff"
            : "#111",

          fontSize: "15px",
        }}
      />

      {/* SEARCH BUTTON */}
      <button
        onClick={handleSearch}

        style={{
          padding: "12px",

          borderRadius: "14px",

          border: "none",

          cursor: "pointer",

          fontWeight: "bold",

          fontSize: "15px",

          background:
            "linear-gradient(135deg,#00c853,#00e676)",

          color: "#fff",

          boxShadow:
            "0 4px 14px rgba(0,0,0,0.2)",
        }}
      >
        🚀 Find Safe Route
      </button>

    </div>
  );
}