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

const OlaMapComponent = () => {
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
        setParkingSpots(fetchedSpots);

        // Clear previous markers and add new ones
        fetchedSpots.forEach((spot) => {
          if (spot.longitude && spot.latitude) {
            addMarker(
              [spot.longitude, spot.latitude], // Ola Maps uses [lng, lat]
              placeholderIcon,
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
      <div id="map-container" style={{ width: "100%", height: "100vh" }}></div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <BottomSheet selectedMarker={selectedMarker} />
    </div>
  );
};

export default OlaMapComponent;


// import React, { useEffect, useState } from "react";
// import { db } from "./firebasecon";
// import { collection, onSnapshot } from "firebase/firestore";

// const YourMapComponent = () => {
//   const [mapInstance, setMapInstance] = useState(null);
//   const [olaMapsInstance, setOlaMapsInstance] = useState(null);
//   const [userAddress, setUserAddress] = useState("");
//   const [parkingSpots, setParkingSpots] = useState([]);

//   useEffect(() => {
//     const initMap = async () => {
//       const { OlaMaps } = await import("olamaps-web-sdk");

//       const olaMaps = new OlaMaps({
//         apiKey: "mDIY4H8lcrmBxVD9evbW3AMhBg3twGlCHds9vANS",
//       });

//       const map = olaMaps.init({
//         container: "map-container",
//         center: [72.8777, 19.0760],
//         zoom: 12,
//         style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
//       });

//       setOlaMapsInstance(olaMaps);
//       setMapInstance(map);

//       // Get current user location
//       if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(
//           async (position) => {
//             const userCoords = [
//               position.coords.longitude,
//               position.coords.latitude,
//             ];

//             map.setCenter(userCoords);
//             map.setZoom(14);

//             // User marker
//             const markerDiv = document.createElement("div");
//             markerDiv.style.display = "flex";
//             markerDiv.style.flexDirection = "column";
//             markerDiv.style.alignItems = "center";

//             const iconImg = document.createElement("img");
//             iconImg.src = "https://cdn-icons-png.flaticon.com/512/3177/3177361.png";
//             iconImg.style.width = "50px";
//             iconImg.style.height = "50px";

//             const label = document.createElement("span");
//             label.innerText = "You are here";
//             label.style.marginTop = "4px";
//             label.style.background = "#fff";
//             label.style.padding = "2px 5px";
//             label.style.borderRadius = "4px";
//             label.style.fontSize = "12px";
//             label.style.boxShadow = "0px 0px 4px rgba(0,0,0,0.3)";
//             label.style.color = "#333";

//             markerDiv.appendChild(iconImg);
//             markerDiv.appendChild(label);

//             const marker = olaMaps
//               .addMarker({ element: markerDiv, offset: [0, -20], anchor: "center" })
//               .setLngLat(userCoords)
//               .addTo(map);

//             // Reverse geocode
//             const address = await fetchAddress(userCoords);
//             setUserAddress(address);

//             const popup = olaMaps
//               .addPopup({ offset: [0, -30], anchor: "center", closeButton: false })
//               .setHTML(`<strong>${address}</strong>`);

//             marker.getElement().addEventListener("mouseenter", () => {
//               popup.setLngLat(userCoords).addTo(map);
//             });

//             marker.getElement().addEventListener("mouseleave", () => {
//               popup.remove();
//             });
//           },
//           (error) => {
//             console.error("Location error:", error);
//           }
//         );
//       }

//       // Fetch owner locations from Firestore in real-time
//       const unsub = onSnapshot(collection(db, "owners"), (snapshot) => {
//         const spots = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setParkingSpots(spots);

//         // Add markers for each owner
//         spots.forEach((spot) => {
//           if (spot.latitude && spot.longitude) {
//             const icon = document.createElement("img");
//             icon.src = "https://cdn-icons-png.flaticon.com/512/684/684908.png"; // parking icon
//             icon.style.width = "40px";
//             icon.style.height = "40px";

//             const popup = olaMaps
//               .addPopup({ offset: [0, -30], anchor: "center" })
//               .setHTML(`<strong>${spot.name || "Parking Spot"}</strong><br/>${spot.price ? `Price: ₹${spot.price}` : ""}`);

//             olaMaps
//               .addMarker({ element: icon, offset: [0, -20], anchor: "center" })
//               .setLngLat([spot.longitude, spot.latitude])
//               .setPopup(popup)
//               .addTo(map);
//           }
//         });
//       });

//       return () => unsub(); // Cleanup listener on unmount
//     };

//     initMap();
//   }, []);

//   const fetchAddress = async ([lng, lat]) => {
//     try {
//       const response = await fetch(
//         `https://api.olamaps.io/v1/geocode/reverse?lat=${lat}&lng=${lng}&api_key=mDIY4H8lcrmBxVD9evbW3AMhBg3twGlCHds9vANS`
//       );
//       const data = await response.json();
//       return data?.address?.formatted || "Unknown Location";
//     } catch (error) {
//       console.error("Address fetch failed:", error);
//       return "Unknown Location";
//     }
//   };

//   return <div id="map-container" style={{ width: "100%", height: "100vh" }} />;
// };

// export default YourMapComponent;


