import React, { useState, useCallback } from "react";
import VehicleFilter from "./VehicleFilter.js";
import OlaMapComponent from "./OlaMapComponent.js";

const ParkingApp = () => {
  const [filters, setFilters] = useState({}); // Initialize as an empty object

  // Use useCallback to ensure the function reference remains stable
  const handleSearch = useCallback((searchFilters) => {
    console.log("Filters received in ParkingApp:", searchFilters);
    setFilters(searchFilters);
  }, []);

  console.log("ParkingApp rendering, handleSearch is:", handleSearch);
  console.log("handleSearch type:", typeof handleSearch);

  return (
    <div style={{ display: "flex" }}>
      <VehicleFilter onSearch={handleSearch} />
      <OlaMapComponent filters={filters} />
    </div>
  );
};

export default ParkingApp;