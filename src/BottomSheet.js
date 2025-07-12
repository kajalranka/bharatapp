import React, { useState, useEffect, useRef } from "react";
import "./css/BottomSheet.css";
import ParkingBooking from "./ParkingBooking";
import supabase from './supabaseClient';

const BottomSheet = ({ selectedMarker }) => {
  const [sheetState, setSheetState] = useState("closed");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [garageImages, setGarageImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const sheetRef = useRef(null);

  const getTranslateY = () => {
    switch (sheetState) {
      case "open": return 0;
      case "partial": return 10;
      case "closed": return 100;
      default: return 100;
    }
  };

  const toggleSheet = () => {
    setSheetState(prev => prev === "partial" ? "closed" : "partial");
  };

  useEffect(() => {
    if (selectedMarker) {
      setSheetState("partial");
      fetchGarageImages(selectedMarker.data?.id);
    } else {
      setSheetState("closed");
    }
  }, [selectedMarker]);
  
  const fetchGarageImages = async (owner_id) => {
    console.log('Fetching images for owner_id:', owner_id);
    
    if (!owner_id) {
      console.log('No owner_id provided');
      setGarageImages([]);
      setImageError(false);
      return;
    }
    
    setImageLoading(true);
    setImageError(false);
    setCurrentImageIndex(0);
    
    try {
      // Remove .single() to handle multiple rows
      const { data, error } = await supabase
        .from('owner_slots')
        .select('parking_image')
        .eq('owner_id', owner_id);

      if (error) {
        console.error('Supabase error fetching parking_image:', error);
        setGarageImages([]);
        setImageError(true);
        return;
      }

      console.log('Raw data from database:', data);
      console.log('Number of rows returned:', data?.length);

      // Handle multiple rows - collect all images from all rows
      let allImageUrls = [];
      
      if (data && data.length > 0) {
        data.forEach((row, rowIndex) => {
          console.log(`Processing row ${rowIndex + 1}:`, row);
          
          if (row?.parking_image) {
            let imageUrls = row.parking_image;
            console.log(`Raw parking_image value for row ${rowIndex + 1}:`, imageUrls);

            // Handle different data formats for each row
            if (typeof imageUrls === 'string') {
              // Try to parse as JSON first (in case it's stored as JSON string)
              try {
                const parsed = JSON.parse(imageUrls);
                if (Array.isArray(parsed)) {
                  imageUrls = parsed;
                } else {
                  // If not JSON, split by comma
                  imageUrls = imageUrls.split(',').map(url => url.trim()).filter(url => url.length > 0);
                }
              } catch {
                // If JSON parse fails, split by comma
                imageUrls = imageUrls.split(',').map(url => url.trim()).filter(url => url.length > 0);
              }
            } else if (Array.isArray(imageUrls)) {
              // Already an array, use as is
              imageUrls = imageUrls.filter(url => url && typeof url === 'string');
            } else {
              console.warn(`Unexpected parking_image format in row ${rowIndex + 1}:`, typeof imageUrls, imageUrls);
              imageUrls = [];
            }

            // Add this row's images to the collection
            if (Array.isArray(imageUrls)) {
              allImageUrls.push(...imageUrls);
            }
          }
        });

        console.log('All collected image URLs:', allImageUrls);

        // Remove duplicates and filter out empty URLs
        const uniqueUrls = [...new Set(allImageUrls)];
        const validUrls = uniqueUrls.filter(url => {
          if (!url || typeof url !== 'string') return false;
          // Check if it's a valid URL format
          return url.startsWith('http') || url.startsWith('data:') || url.startsWith('/');
        });

        console.log('Valid unique image URLs:', validUrls);

        if (validUrls.length > 0) {
          // Sort URLs if they have numeric patterns
          const sortedUrls = validUrls.sort((a, b) => {
            const aMatch = a.match(/image[_-]?(\d+)/i);
            const bMatch = b.match(/image[_-]?(\d+)/i);
            
            if (aMatch && bMatch) {
              return parseInt(aMatch[1]) - parseInt(bMatch[1]);
            }
            
            // Fallback: sort alphabetically
            return a.localeCompare(b);
          });

          setGarageImages(sortedUrls);
          setImageError(false);
        } else {
          console.log('No valid image URLs found');
          setGarageImages([]);
          setImageError(false);
        }
      } else {
        console.log('No rows with parking_image data found for owner_id:', owner_id);
        setGarageImages([]);
        setImageError(false);
      }
    } catch (err) {
      console.error('Unexpected error fetching images:', err);
      setGarageImages([]);
      setImageError(true);
    } finally {
      setImageLoading(false);
    }
  };

  const handleImageError = (imgSrc, index) => {
    console.error(`Failed to load image at index ${index}:`, imgSrc);
    
    // Remove the failed image from the array
    setGarageImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      
      // Adjust current index if necessary
      if (currentImageIndex >= newImages.length && newImages.length > 0) {
        setCurrentImageIndex(newImages.length - 1);
      } else if (newImages.length === 0) {
        setCurrentImageIndex(0);
      }
      
      return newImages;
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sheetRef.current && !sheetRef.current.contains(event.target)) {
        setSheetState("closed");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!selectedMarker) return null;

  const { data } = selectedMarker;
  const {
    first_name = "Not Available",
    last_name = "Not Available",
    phone_number = "Not Available",
    email = "Not Available",
    address = "Not Available",
    street = "Not Available",
    city = "Not Available",
    zip_code = "Not Available",
    opening_time = "Not Available",
    closing_time = "Not Available",
    vehicleType = "Not Available",
    price = "Not Available",
    status = "Unknown",
    total_slots = "Not Available",
    vehicleData = {},
    slots = []
  } = data || {};

  return (
    <div
      className="bottom-sheet-container"
      ref={sheetRef}
      style={{
        transform: `translate(-50%, ${getTranslateY()}%)`,
      }}
    >
      <div className="drag-handle" onClick={toggleSheet}></div>

      <div className="content-container">
        <div className="image-container">
          {imageLoading ? (
            <div className="placeholder-image">
              <i className="fas fa-spinner fa-spin text-4xl"></i>
              <span>Loading images...</span>
            </div>
          ) : garageImages?.length > 0 ? (
            <div className="carousel-container">
              <div 
                className="carousel-wrapper"
                style={{
                  transform: `translateX(-${currentImageIndex * 100}%)`,
                  transition: 'transform 0.3s ease-in-out'
                }}
              >
                {garageImages.map((img, index) => (
                  <div key={`${img}-${index}`} className="carousel-slide">
                    <img
                      src={img}
                      alt={`Parking spot ${index + 1}`}
                      onError={() => handleImageError(img, index)}
                      onLoad={() => console.log(`Successfully loaded image ${index + 1}:`, img)}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                ))}
              </div>
              
              {/* Navigation buttons */}
              {garageImages.length > 1 && (
                <>
                  <button 
                    className="carousel-btn carousel-btn-prev"
                    onClick={() => setCurrentImageIndex(prev => 
                      prev === 0 ? garageImages.length - 1 : prev - 1
                    )}
                  >
                    &#8249;
                  </button>
                  <button 
                    className="carousel-btn carousel-btn-next"
                    onClick={() => setCurrentImageIndex(prev => 
                      prev === garageImages.length - 1 ? 0 : prev + 1
                    )}
                  >
                    &#8250;
                  </button>
                </>
              )}
              
              {/* Dots indicator */}
              {garageImages.length > 1 && (
                <div className="carousel-dots">
                  {garageImages.map((_, index) => (
                    <button
                      key={index}
                      className={`carousel-dot ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="placeholder-image">
              <i className="fas fa-image text-4xl"></i>
              <span>
                {imageError ? 'Error loading images' : 'No Images Available'}
              </span>
            </div>
          )}
        </div>

        <div className="details-container">
          <h1 className="title">{address}</h1>
          <p><strong>Owner:</strong> {first_name} {last_name}</p>
          <p><strong>Phone:</strong> {phone_number}</p>
          <p><strong>Email:</strong> {email}</p>
          <p><strong>Address:</strong> {address}</p>
          <p><strong>Street:</strong> {street}</p>
          <p><strong>Place:</strong> {city}, {zip_code}</p>
          <p><strong>Opening Time:</strong> {opening_time}</p>
          <p><strong>Closing Time:</strong> {closing_time}</p>
          <p><strong>Vehicle Types:</strong> {vehicleType}</p>
          <p><strong>Total Slots:</strong> {total_slots}</p>

          <h3>Pricing</h3>
          {slots.length > 0 ? (
            <div className="pricing-section">
              {vehicleData.bike_cycle?.length > 0 && (
                <div className="vehicle-pricing">
                  <h4>Bike/Cycle</h4>
                  <ul className="pricing-list">
                    {vehicleData.bike_cycle.map((slot, index) => (
                      <li key={index}>
                        <strong>{slot.pricing_type}:</strong> ₹{slot.price}
                        {slot.available_slots && (
                          <span> ({slot.available_slots} available)</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {vehicleData.car_auto?.length > 0 && (
                <div className="vehicle-pricing">
                  <h4>Car/Auto</h4>
                  <ul className="pricing-list">
                    {vehicleData.car_auto.map((slot, index) => (
                      <li key={index}>
                        <strong>{slot.pricing_type}:</strong> ₹{slot.price}
                        {slot.available_slots && (
                          <span> ({slot.available_slots} available)</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {vehicleData.bus_truck?.length > 0 && (
                <div className="vehicle-pricing">
                  <h4>Bus/Truck</h4>
                  <ul className="pricing-list">
                    {vehicleData.bus_truck.map((slot, index) => (
                      <li key={index}>
                        <strong>{slot.pricing_type}:</strong> ₹{slot.price}
                        {slot.available_slots && (
                          <span> ({slot.available_slots} available)</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p>No pricing data available</p>
          )}

          <p><strong>Status:</strong> {status}</p>
        </div>
      </div>

      <div className="button-container">
        <button 
          className="book-button1" 
          onClick={() => setIsPopupOpen(true)}
          disabled={status !== "Available"}
        >
          {status === "Available" ? "Book Parking" : "Not Available"}
        </button>
        {isPopupOpen && (
          <ParkingBooking 
            isOpen={isPopupOpen} 
            onClose={() => setIsPopupOpen(false)}
            ownerId={selectedMarker?.data?.id}  // Pass the selected owner's ID
            ownerData={selectedMarker?.data}     // Optionally pass full owner data
            //parkingData={data}
          />
        )}
      </div>
    </div>
  );
};

export default BottomSheet;