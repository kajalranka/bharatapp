import { useState } from "react";
import { Menu, X, Search } from "lucide-react";
import "./css/VehicleFilter.css";
import carImg from "./sedan.png";
import bikeImg from "./sportbike.png";
import cycleImg from "./bicycle.png";

export default function VehicleFilter({onSearch}){
  const [isOpen, setIsOpen] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [parkingType, setParkingType] = useState("public");
  const [searchPlace, setSearchPlace] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [maxDistance, setMaxDistance] = useState(0.5);
  const [availability, setAvailability] = useState(false);
  const [amenities, setAmenities] = useState({
    evCharging: false,
    covered: false,
    handicap: false,
  });
  const [timeFilter, setTimeFilter] = useState("hourly");
  
  const handleSubmit= ()=> {
    const filters = {
      selectedVehicle,
      parkingType,
      searchPlace,
      priceRange,
      maxDistance,
      availability,
      amenities,
      timeFilter,
    };
    // Pass filters up to the parent or context 
 if (onSearch)
   onSearch(filters);
  };
  
  return (
    <div className="sidebar-container">
      {/* Toggle Button */}
      <button
        className="sidebar-toggle-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="sidebar-toggle-icon" /> : <Menu className="sidebar-toggle-icon" />}
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}>
        {/* Scrollable Content */}
        <div className="sidebar-content">
          <div className="sidebar-inner">
            {/* Select Vehicle Section */}
            <h2 className="sidebar-heading">Select Vehicle</h2>
            <div className="sidebar-vehicle-grid">
              {[
                { type: "Car", img: carImg },
                { type: "Bike", img: bikeImg },
                { type: "Cycle", img: cycleImg },
              ].map((vehicle) => (
                <button
                  key={vehicle.type}
                  className={`sidebar-vehicle-button ${selectedVehicle === vehicle.type ? "sidebar-vehicle-button-active" : ""
                    }`}
                  onClick={() => setSelectedVehicle(vehicle.type)}
                >
                  <img src={vehicle.img} alt={vehicle.type} className="sidebar-vehicle-image" />
                </button>
              ))}
            </div>

            {/* Select Parking Type Section */}
            <h2 className="sidebar-heading">Select Parking Type</h2>
            <select
              className="sidebar-select"
              value={parkingType}
              onChange={(e) => setParkingType(e.target.value)}
            >
              <option value="public">Public Parking</option>
              <option value="private">Private Parking</option>
              <option value="both">Both</option>
            </select>

            {/* Search Location Section */}
            <h2 className="sidebar-heading">Specify Place</h2>
            <div className="sidebar-search-container">
              <input
                type="text"
                className="sidebar-search-input"
                placeholder="Search location..."
                value={searchPlace}
                onChange={(e) => setSearchPlace(e.target.value)}
              />
              <Search className="sidebar-search-icon" size={20} />
            </div>

            {/* Price Range Section */}
            <h2 className="sidebar-heading">Price Range</h2>
            <input
              type="number"
              className="sidebar-input"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              min="0"
              max="200"
              placeholder="Enter price"
            />

            {/* Max Distance Section */}
            <h2 className="sidebar-heading">Max Distance (km)</h2>
            <input
              type="range"
              min="0.5"
              max="50"
              step="0.5"
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="sidebar-range-input"
            />
            <p className="sidebar-range-label">Up to {maxDistance} km</p>

            {/* Availability Section */}
            <h2 className="sidebar-heading">Availability</h2>
            <label className="sidebar-checkbox-label">
              <input
                type="checkbox"
                checked={availability}
                onChange={() => setAvailability(!availability)}
                className="sidebar-checkbox"
              />
              <span>Show Only Available</span>
            </label>

            {/* Amenities Section */}
            <h2 className="sidebar-heading">Amenities</h2>
            {Object.entries(amenities).map(([key, value]) => (
              <label key={key} className="sidebar-checkbox-label">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => setAmenities({ ...amenities, [key]: !value })}
                  className="sidebar-checkbox"
                />
                <span>
                  {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                </span>
              </label>
            ))}

            {/* Time-Based Filter Section */}
            <h2 className="sidebar-heading">Time-Based Filter</h2>
            <select
              className="sidebar-select"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option> 

              <option value="monthly">Monthly</option> 
            </select>
<button
  className="sidebar-search-button"
   onClick= {handleSubmit}
  // style={{ marginTop:"0rem",padding: "25px", backgroundColor: "black", color: "white", borderRadius: "5px", width: "100%" }}
  >
  Search
</button>
          </div>
        </div>
      </div>
    </div>
  );
}