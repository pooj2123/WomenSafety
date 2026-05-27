export async function getRoute(start, end) {
  const response = await fetch("http://127.0.0.1:8000/route", {
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

  return response.json();
}