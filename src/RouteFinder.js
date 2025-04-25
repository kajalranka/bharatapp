import polyline from "@mapbox/polyline";

const RouteFinder = async (olaMaps, mapInstance, userLocation, selectedMarker) => {
  if (!olaMaps || !mapInstance || !userLocation || !selectedMarker) return;

  try {
    const response = await fetch(
      `https://api.olamaps.io/routing/v1/directions?origin=${userLocation[1]},${userLocation[0]}&destination=${selectedMarker[1]},${selectedMarker[0]}&api_key=mDIY4H8lcrmBxVD9evbW3AMhBg3twGlCHds9vANS`,
      { method: "POST", headers: { "X-Request-Id": "XXX" } }
    );

    const data = await response.json();
    if (!data.routes?.length || !data.routes[0].overview_polyline) return;

    const decodedCoordinates = polyline.decode(data.routes[0].overview_polyline);

    if (mapInstance.getLayer("route")) {
      mapInstance.removeLayer("route");
      mapInstance.removeSource("route");
    }

    mapInstance.addSource("route", {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: { type: "LineString", coordinates: decodedCoordinates.map(([lat, lng]) => [lng, lat]) },
      },
    });

    mapInstance.addLayer({
      id: "route",
      type: "line",
      source: "route",
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "#007bff", "line-width": 5 },
    });

    const bounds = new olaMaps.LngLatBounds();
    decodedCoordinates.forEach(([lat, lng]) => bounds.extend([lng, lat]));
    mapInstance.fitBounds(bounds, { padding: 50 });

  } catch (error) {
    console.error("Error fetching route:", error);
  }
};

export default RouteFinder;
