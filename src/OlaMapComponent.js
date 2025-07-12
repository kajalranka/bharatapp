import React, { useEffect, useState } from "react";
import useUserLocation from "./CurrentLocationMarker";
import supabase from './supabaseClient';
import placeholderIcon from "./placeholder.png";
import userLocationIcon from "./pin-map.png";
import availableIcon from './green-marker.png';
import RouteFinder from "./RouteFinder";
import BottomSheet from "./BottomSheet";
import HeaderNavbar from "./HeaderNavbar";

const OlaMapComponent = ({ filters }) => {
  const { userLocation, error } = useUserLocation();
  const [olaMaps, setOlaMaps] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [parkingSpots, setParkingSpots] = useState([]);

  const fetchParkingSpots = async () => {
    try {
      // Fetch owner data with coordinates
      const { data: ownerData, error: ownerError } = await supabase
        .from('owner')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);
      
      if (ownerError) throw ownerError;

      // Fetch all slot data
      const { data: slotData, error: slotError } = await supabase
        .from('owner_slots')
        .select('*');
      
      if (slotError) throw slotError;

      // Merge data and transform into proper structure
      const mergedData = ownerData.map(owner => {
        const slots = slotData.filter(slot => slot.owner_id === owner.id);
        
        // Organize slots by vehicle type
        const vehicleData = {
          bike_cycle: slots.filter(slot => slot.vehicletype === 'Bike/Cycle'),
          car_auto: slots.filter(slot => slot.vehicletype === 'Car/Auto'),
          bus_truck: slots.filter(slot => slot.vehicletype === 'Truck/Bus')
        };

        // Get all unique vehicle types
        const vehicleTypes = [...new Set(slots.map(slot => slot.vehicletype))];

        // Determine overall status
        const status = slots.some(slot => slot.status === 'available') ? 'Available' : 'Unavailable';

        return {
          ...owner,
          slots,
          vehicle_types: vehicleTypes,
          vehicleData,
          status,
          // Add these fields for BottomSheet compatibility
          opening_time: slots[0]?.opening_time || 'Not Available',
          closing_time: slots[0]?.closing_time || 'Not Available',
          total_slots: slots.reduce((sum, slot) => sum + (parseInt(slot.total_slots) || 0), 0)
        };
      });

      return mergedData;
    } catch (error) {
      console.error("Error fetching parking data:", error);
      return [];
    }
  };

  useEffect(() => {
    const loadOlaMaps = async () => {
      const { OlaMaps } = await import("olamaps-web-sdk");

      const olaInstance = new OlaMaps({
        apiKey: "mDIY4H8lcrmBxVD9evbW3AMhBg3twGlCHds9vANS",
      });

      const myMap = olaInstance.init({
        style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
        container: "map-container",
        center: [72.8777, 19.0760],
        zoom: 12,
      });

      setOlaMaps(olaInstance);
      setMapInstance(myMap);

      const addMarker = (coords, icon, type, data = {}) => {
        const markerIcon = document.createElement("div");
        markerIcon.style.width = "35px";
        markerIcon.style.height = "35px";
        markerIcon.style.backgroundImage = `url(${icon})`;
        markerIcon.style.backgroundSize = "contain";
        markerIcon.style.backgroundRepeat = "no-repeat";
        markerIcon.style.backgroundPosition = "center";

        const displayName = data.first_name && data.last_name 
          ? `${data.first_name} ${data.last_name}'s Parking`
          : data.parking_id || "Parking Space";

        const popup = olaInstance
          .addPopup({ offset: [0, -30], anchor: "center" })
          .setHTML(`<div><strong>${type}</strong><br/>${displayName}</div>`);

        const marker = olaInstance
          .addMarker({ element: markerIcon, offset: [0, -20], anchor: "center" })
          .setLngLat(coords)
          .setPopup(popup)
          .addTo(myMap);

        marker.getElement().addEventListener("click", () => {
          setSelectedMarker({ 
            coords, 
            data: {
              ...data,
              // Ensure these fields are available for BottomSheet
              vehicleType: data.vehicle_types?.join(', ') || '',
              price: data.slots?.[0]?.price || 'Not Available'
            } 
          });
        });
      };

      if (userLocation) {
        addMarker(userLocation, userLocationIcon, "Your Location");
        myMap.setCenter(userLocation);
        myMap.setZoom(14);
      }

      const spots = await fetchParkingSpots();
      
      // Subscribe to real-time changes
      const ownerSubscription = supabase
        .channel('public:owner')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'owner' }, 
          async () => {
            const updatedSpots = await fetchParkingSpots();
            handleParkingSpots(updatedSpots);
          })
        .subscribe();

      const slotsSubscription = supabase
        .channel('public:owner_slots')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'owner_slots' }, 
          async () => {
            const updatedSpots = await fetchParkingSpots();
            handleParkingSpots(updatedSpots);
          })
        .subscribe();

      const handleParkingSpots = (spots) => {
        const filteredSpots = spots.filter((spot) => {
          if (!filters) return true;

          // Address filter
          if (filters.searchPlace && spot.address && 
              !spot.address.toLowerCase().includes(filters.searchPlace.toLowerCase())) 
            return false;
          
          // Price filter
          if (filters.priceRange) {
            const hasMatchingPrice = spot.slots.some(slot => 
              parseFloat(slot.price) <= parseFloat(filters.priceRange)
            );
            if (!hasMatchingPrice) return false;
          }
          
          // Availability filter
          if (filters.availability && spot.status !== "Available") return false;
          
          // Vehicle type filter
          if (filters.selectedVehicle && spot.vehicle_types && 
              !spot.vehicle_types.includes(filters.selectedVehicle)) 
            return false;

          return true;
        });

        setParkingSpots(filteredSpots);

        // Clear previous markers
       // myMap.getMarkers()?.forEach(marker => marker.remove());

        // Add markers for filtered spots
        filteredSpots.forEach((spot) => {
          if (spot.longitude && spot.latitude) {
            const icon = spot.status === "Available" ? availableIcon : placeholderIcon;
            addMarker(
              [parseFloat(spot.longitude), parseFloat(spot.latitude)],
              icon,
              "Parking Space",
              spot
            );
          }
        });
      };

      handleParkingSpots(spots);

      return () => {
        ownerSubscription.unsubscribe();
        slotsSubscription.unsubscribe();
      };
    };

    loadOlaMaps();
  }, [userLocation, filters]);

  useEffect(() => {
    if (selectedMarker && olaMaps && mapInstance && userLocation) {
      RouteFinder(olaMaps, mapInstance, userLocation, selectedMarker.coords);
    }
  }, [selectedMarker, olaMaps, mapInstance, userLocation]);

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