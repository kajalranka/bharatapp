import React, { useState } from "react";
import VehicleFilter from "./VehicleFilter";
import OlaMapComponent from "./OlaMapComponent";

const ParkingApp = () => {
  const [filters, setFilters] = useState(null);

  const handleSearch = (searchFilters) => {
    setFilters(searchFilters);
  };

  return (
    <div style={{ display: "flex" }}>
      <VehicleFilter onSearch={handleSearch} />
      <OlaMapComponent filters={filters} />
    </div>
  );
};

export default ParkingApp;
