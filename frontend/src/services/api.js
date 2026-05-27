export const searchLocation = async (query) => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
  );

  const data = await res.json();

  if (!data.length) return null;

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
  };
};

export const getRoute = async (start, end) => {
  const res = await fetch("http://127.0.0.1:8000/route", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      start_lat: start[0],
      start_lon: start[1],
      end_lat: end[0],
      end_lon: end[1],
    }),
  });

  return await res.json();
};