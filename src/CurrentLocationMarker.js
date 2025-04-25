import { useState, useEffect } from "react";

const CurrentLocationMarker = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([longitude, latitude]); // OlaMaps uses [lng, lat]
      },
      (error) => {
        setError("Unable to retrieve your location");
        console.error("Geolocation Error:", error);
      }
    );
  }, []);

  return { userLocation, error };
};

export default CurrentLocationMarker;
