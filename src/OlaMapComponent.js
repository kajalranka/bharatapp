import React, { useEffect, useState } from "react";
import { db } from "./firebasecon"; // Import Firestore instance
import { collection, onSnapshot } from "firebase/firestore";
import useUserLocation from "./CurrentLocationMarker"; // Import the location hook
import petrolPumpIcon from "./fuel-station.png";
import evChargingIcon from "./charging-point.png";
import placeholderIcon from "./placeholder.png";
import userLocationIcon from "./pin-map.png"; // Icon for user location
import RouteFinder from "./RouteFinder";
import BottomSheet from "./BottomSheet";
import availableIcon from './green-marker.png';
import HeaderNavbar from "./HeaderNavbar";
import { handlePayment } from "./Razorpay/PaymentButton";

const OlaMapComponent = ({filters})=> {
  const { userLocation, error } = useUserLocation(); // Get user location
  const [olaMaps, setOlaMaps] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [parkingSpots, setParkingSpots] = useState([]);

  useEffect(() => {
    const loadOlaMaps = async () => {
      const { OlaMaps } = await import("olamaps-web-sdk");

      const olaInstance = new OlaMaps({
        apiKey: "mDIY4H8lcrmBxVD9evbW3AMhBg3twGlCHds9vANS",
      });

      const myMap = olaInstance.init({
        style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
        container: "map-container",
        center: [72.8777, 19.0760], // Default: Mumbai
        zoom: 12,
      });

      setOlaMaps(olaInstance);
      setMapInstance(myMap);

      // Function to add markers dynamically
      const addMarker = (coords, icon, type, data = {}) => {
        const markerIcon = document.createElement("div");
        markerIcon.style.width = "35px";
        markerIcon.style.height = "35px";
        markerIcon.style.backgroundImage = `url(${icon})`;
        markerIcon.style.backgroundSize = "contain";
        markerIcon.style.backgroundRepeat = "no-repeat";
        markerIcon.style.backgroundPosition = "center";

        const popup = olaInstance
          .addPopup({ offset: [0, -30], anchor: "center" })
          .setHTML(`<div><strong>${type}</strong><br/>${data.name || "Unnamed"}</div>`);

        const marker = olaInstance
          .addMarker({ element: markerIcon, offset: [0, -20], anchor: "center" })
          .setLngLat(coords)
          .setPopup(popup)
          .addTo(myMap);

        // Add click event to show route and details
        marker.getElement().addEventListener("click", () => {
          setSelectedMarker({ coords, data: data || {} }); // Ensure data is an object
        });
      };

      // If user location is available, add a marker
      if (userLocation) {
        addMarker(userLocation, userLocationIcon, "Your Location");
        myMap.setCenter(userLocation); // Center map on user location
        myMap.setZoom(14);
      }

      // Fetch and update parking spots in real-time from Firestore
      const unsubscribe = onSnapshot(collection(db, "owners"), (snapshot) => {
        const fetchedSpots = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
    
        const filteredSpots = fetchedSpots.filter((spot) => {
          if (!filters) return true;

          if (filters.searchPlace && !spot.location?.toLowerCase().includes(filters.searchPlace.toLowerCase())) return false;
          if (filters.priceRange && Number(spot.price) > Number(filters.priceRange)) return false;
          if (filters.availability && spot.status !== "Available") return false;
          if (filters.parkingType && filters.parkingType !== "both" && spot.parkingType !== filters.parkingType) return false;
          if (filters.selectedVehicle && spot.vehicleType !== filters.selectedVehicle) return false;
          if (filters.timeFilter && spot.timeBasis !== filters.timeFilter) return false;
          if (filters.amenities?.evCharging && !spot.evCharging) return false;
          if (filters.amenities?.covered && !spot.covered) return false;
          if (filters.amenities?.handicap && !spot.handicap) return false;

          return true;
        });

        setParkingSpots(fetchedSpots);

        // Clear previous markers and add new ones
        fetchedSpots.forEach((spot) => {
          if (spot.longitude && spot.latitude) {
            const icon=spot.status === "Available" ? availableIcon: placeholderIcon;
            addMarker(
              [spot.longitude, spot.latitude], // Ola Maps uses [lng, lat]
              icon,
              "Parking Space",
              spot
            );
          }
        });
      });

      // Cleanup Firestore listener on unmount
      return () => unsubscribe();
    };

    loadOlaMaps();
  }, [userLocation]); // Reload when user location changes

  // Fetch and display the route when the user selects a marker
  useEffect(() => {
    if (selectedMarker) {
      RouteFinder(olaMaps, mapInstance, userLocation, selectedMarker.coords);
    }
  }, [selectedMarker]);

  return (
    <div>
      <HeaderNavbar mapInstance={mapInstance}/>
      <div id="map-container" style={{ width: "100%", height: "100vh" }}></div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <BottomSheet selectedMarker={selectedMarker}/>
    </div>
  );
};

export default OlaMapComponent;




