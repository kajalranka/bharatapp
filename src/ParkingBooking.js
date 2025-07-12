import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCar, faShuttleVan,
  faClock, faCalendar,
  faMotorcycle
} from '@fortawesome/free-solid-svg-icons';
import './css/ParkingBooking.css';
import { handlePayment } from './Razorpay/PaymentButton';
import supabase from './supabaseClient';

// Vehicle icon mapping based on vehicle_id
const vehicleIcons = {
  1: faCar,        // Car/Auto
  2: faShuttleVan, // Bus/Truck
  3: faMotorcycle  // Bike/Cycle
};

// Vehicle size mapping
const vehicleSizes = {
  1: 'Medium',  // Car/Auto
  2: 'Large',   // Bus/Truck
  3: 'Small'    // Bike/Cycle
};

const ParkingBooking = ({ isOpen, onClose, ownerId, ownerData  }) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const [userId, setUserId] = useState(null);
  const [ownerSlotId, setOwnerSlotId] = useState(null);
  const [pricingtype, setPricingType] = useState(null);
  
  // Dynamic slot types from database
  const [slotTypes, setSlotTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Error states
  const [vehicleNumberError, setVehicleNumberError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const [startTimeDisplay, setStartTimeDisplay] = useState('');
  const [endTimeDisplay, setEndTimeDisplay] = useState('');
  const [startDateDisplay, setStartDateDisplay] = useState('');
  const [endDateDisplay, setEndDateDisplay] = useState('');

  const flatpickrStartRef = useRef(null);
  const flatpickrEndRef = useRef(null);

  // Regex patterns
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const nameRegex = /^[a-zA-Z]+(?: [a-zA-Z]+)*$/;
  const vehicleNumberRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/;
  const phoneNumberRegex = /^[6-9]\d{9}$/;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStartTime('');
      setEndTime('');
      setSelectedSlot('');
      setVehicleNumber('');
      setPhoneNumber('');
      setEmail('');
      setName('');
      setStartTimeDisplay('');
      setEndTimeDisplay('');
      setStartDateDisplay('');
      setEndDateDisplay('');
      setVehicleNumberError('');
      setPhoneNumberError('');
      setEmailError('');
      setNameError('');
      setFormErrors({});
    }
  }, [isOpen]);

  // Initialize flatpickr
useEffect(() => {
    if (!isOpen) return;

    // Clean up old instances first
    if (flatpickrStartRef.current) {
      flatpickrStartRef.current.destroy();
    }
    if (flatpickrEndRef.current) {
      flatpickrEndRef.current.destroy();
    }

    const now = new Date();
    
    // Format current time properly for minTime
    const currentHours = now.getHours().toString().padStart(2, '0');
    const currentMinutes = now.getMinutes().toString().padStart(2, '0');

    // Initialize start time picker
    flatpickrStartRef.current = flatpickr("#start-time", {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      minDate: now,
      minTime: `${currentHours}:${currentMinutes}`,
      minuteIncrement: 30,
      onChange: function (selectedDates, dateStr) {
        if (selectedDates.length === 0) return;
        
        setStartTime(dateStr);
        const date = new Date(dateStr);
        setStartTimeDisplay(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setStartDateDisplay(date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }));
        
        // Update end time picker constraints
        if (flatpickrEndRef.current) {
          flatpickrEndRef.current.set('minDate', dateStr);
          
          // If selected start date is today, set minimum time to be 30 minutes after start time
          const selectedDate = new Date(dateStr);
          const today = new Date();
          
          if (selectedDate.toDateString() === today.toDateString()) {
            // Calculate minimum end time (30 minutes after start)
            const minEndTime = new Date(selectedDate.getTime() + 30 * 60 * 1000);
            const minHours = minEndTime.getHours().toString().padStart(2, '0');
            const minMinutes = minEndTime.getMinutes().toString().padStart(2, '0');
            flatpickrEndRef.current.set('minTime', `${minHours}:${minMinutes}`);
          } else {
            // For future dates, no minimum time restriction
            flatpickrEndRef.current.set('minTime', null);
          }
        }
      }
    });

    // Initialize end time picker
    flatpickrEndRef.current = flatpickr("#end-time", {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      minDate: startTime ? new Date(startTime) : now,
      minuteIncrement: 30,
      onChange: function (selectedDates, dateStr) {
        if (selectedDates.length === 0) return;
        
        setEndTime(dateStr);
        const date = new Date(dateStr);
        setEndTimeDisplay(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setEndDateDisplay(date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }));
      }
    });

    // Cleanup function
    return () => {
      if (flatpickrStartRef.current) {
        flatpickrStartRef.current.destroy();
      }
      if (flatpickrEndRef.current) {
        flatpickrEndRef.current.destroy();
      }
    };
  }, [isOpen]);

  // FOR USER_ID 
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error fetching user:', error.message);
      } else {
        setUserId(user.id);
      }
    };

    fetchUser();
  }, []);

  // FOR OWNER_SLOT_ID AND DYNAMIC SLOT TYPES
  useEffect(() => {
    const fetchOwnerSlotsData = async () => {
      if (!userId) return;
      
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('owner_slots')
          .select('id, vehicletype, pricing_type, price, vehicle_id, status')
          .eq('owner_id', ownerId)
          .eq('status', 'available'); // Only fetch available slots

        if (error) {
          console.error('Error fetching slot data:', error.message);
        } else {
         
          console.log('Fetched slots for owner:', ownerId, data);

           // Set owner slot ID from first record
          setOwnerSlotId(data?.[0]?.id || null);
          setPricingType(data?.[0]?.pricing_type || null);
          
          // Transform data into slotTypes format
          const dynamicSlotTypes = data.map((slot, index) => ({
            id: `${slot.vehicle_id}_${slot.pricing_type}_${index}`, // Unique ID combining vehicle_id and pricing_type
            originalId: slot.id, // Keep original database ID
            vehicleId: slot.vehicle_id,
            icon: vehicleIcons[slot.vehicle_id] || faCar,
            label: slot.vehicletype,
            price: parseFloat(slot.price),
            pricingType: slot.pricing_type,
            size: vehicleSizes[slot.vehicle_id] || 'Medium',
            displayPrice: `₹${(Math.round((((slot.price) +((slot.price)* 25/100))/10))*10) }/${slot.pricing_type === 'Hourly' ? 'hr' : slot.pricing_type}`
          }));
          
          setSlotTypes(dynamicSlotTypes);
          console.log('Vehicle Icons:', vehicleIcons);
          console.log('Available icons:', { faCar, faShuttleVan, faMotorcycle });
        }
      } catch (err) {
        console.error('Error in fetchOwnerSlotsData:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerSlotsData();
  }, [userId]);

  const selectSlot = (slotId) => {
    setSelectedSlot(slotId);
    setFormErrors({...formErrors, slotType: ''});
  };

  const validateName = (value) => {
    setName(value);
    if (value && !nameRegex.test(value)) {
      setNameError('Name should contain only letters and spaces');
    } else {
      setNameError('');
    }
  };

  const validateEmail = (value) => {
    setEmail(value);
    if (value && !emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const validateVehicleNumber = (value) => {
    const upperValue = value.toUpperCase();
    setVehicleNumber(upperValue);
    if (!vehicleNumberRegex.test(upperValue)) {
      setVehicleNumberError('Format: XX00XX0000 (e.g., MH12AB1234)');
      setFormErrors({...formErrors, vehicleNumber: 'Invalid vehicle number'});
    } else {
      setVehicleNumberError('');
      const newErrors = {...formErrors};
      delete newErrors.vehicleNumber;
      setFormErrors(newErrors);
    }
  };

  const validatePhoneNumber = (value) => {
    setPhoneNumber(value);
    if (!phoneNumberRegex.test(value)) {
      setPhoneNumberError('Enter a valid 10-digit Indian mobile number');
      setFormErrors({...formErrors, phoneNumber: 'Invalid phone number'});
    } else {
      setPhoneNumberError('');
      const newErrors = {...formErrors};
      delete newErrors.phoneNumber;
      setFormErrors(newErrors);
    }
  };

  const selectedSlotObj = slotTypes.find(slot => slot.id === selectedSlot);
  const rate = (Math.round((((selectedSlotObj?.price) +((selectedSlotObj?.price)* 25/100))/10))*10) || 0;
  const selectedPricingType = selectedSlotObj?.pricingType || 'Hourly';
  
  // Calculate duration and total based on pricing type
  const calculateDurationAndTotal = () => {
    if (!startTime || !endTime || !selectedSlotObj) return { duration: 0, total: 0, unit: 'hour' };
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    
    if (selectedPricingType === 'Daily') {
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const duration = Math.max(1, diffDays);
      return {
        duration,
        total: rate * duration,
        unit: duration === 1 ? 'day' : 'days'
      };
    } else {
      // Default to hourly
      const diffHours = diffMs / (1000 * 60 * 60);
      const duration = Math.max(1, Math.ceil(diffHours * 2) / 2); // Round to next 0.5 hour
      return {
        duration,
        total: rate * duration,
        unit: duration === 1 ? 'hour' : 'hours'
      };
    }
  };
  
  const { duration, total, unit } = calculateDurationAndTotal();

  const validateForm = () => {
    const errors = {};
    
    if (!startTime) errors.startTime = 'Start time is required';
    if (!endTime) errors.endTime = 'End time is required';
    if (!selectedSlot) errors.slotType = 'Please select a slot type';
    if (!vehicleNumber) errors.vehicleNumber = 'Vehicle number is required';
    else if (!vehicleNumberRegex.test(vehicleNumber)) errors.vehicleNumber = 'Invalid vehicle number format';
    
    if (!phoneNumber) errors.phoneNumber = 'Phone number is required';
    else if (!phoneNumberRegex.test(phoneNumber)) errors.phoneNumber = 'Invalid phone number format';
    
    // Make name and email required
    if (!name) errors.name = 'Name is required';
    else if (!nameRegex.test(name)) errors.name = 'Name should only contain letters';
    
    if (!email) errors.email = 'Email is required';
    else if (!emailRegex.test(email)) errors.email = 'Invalid email format';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBooking = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      setFormErrors({...formErrors, endTime: 'End time must be after start time'});
      return;
    }
    const numSlots = 1;
    console.log(numSlots);
    
    // Create booking details object to pass to payment handler
    const bookingDetails = {
      slotType: selectedSlotObj?.label,
      vehicleType: selectedSlotObj?.label,
      vehicleNumber,
      phoneNumber,
      email,
      name,
      startTime,
      endTime,
      rate,
      duration: duration,
      total,
      userId,
      ownerId,
      ownerSlotId: selectedSlotObj?.originalId, // Use the original database ID
      pricingtype: selectedPricingType,
      numSlots
    };
    
    console.log('Booking Details:', bookingDetails);
    handlePayment(bookingDetails);
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="popup-overlay">
      <div className="popup-container">
        <button className="close-button" onClick={onClose}>
          <span style={{ fontSize: '20px' }}>✖</span>
        </button>

        {/* Time Display */}
        <div className="time-display">
          <div className="time">{startTimeDisplay || "--:--"}</div>
          <div className="to">to</div>
          <div className="time">{endTimeDisplay || "--:--"}</div>
        </div>
        <div className="date-display">
          <div>{startDateDisplay || "Select start date"}</div>
          <div>{endDateDisplay || "Select end date"}</div>
        </div>

        {/* Slot Type Section */}
        <div className="slot-type">
          <div className="header">Select Slot Type<span className="required">*</span></div>
          {loading ? (
            <div className="loading">Loading available slots...</div>
          ) : slotTypes.length === 0 ? (
            <div className="no-slots">No available slots found</div>
          ) : (
            <div className="grid">
              {slotTypes.map(slot => (
                <button
                  key={slot.id}
                  className={`slot-button ${selectedSlot === slot.id ? 'selected' : ''}`}
                  onClick={() => selectSlot(slot.id)}
                >
                  <div className="icon">
                    <FontAwesomeIcon icon={slot.icon} />
                  </div>
                  <div className="label">{slot.label}</div>
                  <div className="price">{slot.displayPrice}</div>
                  <div className="size">{slot.size}</div>
                </button>
              ))}
            </div>
          )}
          {formErrors.slotType && <div className="error-message">{formErrors.slotType}</div>}
        </div>

        {/* Personal Details */}
        <div className="input-group">
          <div className="header">Name<span className="required">*</span></div>
          <input
            type="text"
            className={`input ${nameError || formErrors.name ? 'error-input' : ''}`}
            placeholder="Enter your name"
            value={name}
            onChange={(e) => validateName(e.target.value)}
          />
          {nameError && <div className="error-message">{nameError}</div>}
          {formErrors.name && !nameError && <div className="error-message">{formErrors.name}</div>}
        </div>

        <div className="input-group">
          <div className="header">Email<span className="required">*</span></div>
          <input
            type="email"
            className={`input ${emailError || formErrors.email ? 'error-input' : ''}`}
            placeholder="Enter your email"
            value={email}
            onChange={(e) => validateEmail(e.target.value)}
          />
          {emailError && <div className="error-message">{emailError}</div>}
          {formErrors.email && !emailError && <div className="error-message">{formErrors.email}</div>}
        </div>

        {/* Time Inputs */}
        <div className="input-group">
          <div className="header">Start Time<span className="required">*</span></div>
          <div className="input-wrapper">
            <FontAwesomeIcon icon={faCalendar} className="input-icon left" />
            <input 
              type="text" 
              id="start-time" 
              className={`input ${formErrors.startTime ? 'error-input' : ''}`} 
              placeholder="Select start time" 
            />
            <FontAwesomeIcon icon={faClock} className="input-icon right" />
          </div>
          {formErrors.startTime && <div className="error-message">{formErrors.startTime}</div>}
        </div>

        <div className="input-group">
          <div className="header">End Time<span className="required">*</span></div>
          <div className="input-wrapper">
            <FontAwesomeIcon icon={faCalendar} className="input-icon left" />
            <input 
              type="text" 
              id="end-time" 
              className={`input ${formErrors.endTime ? 'error-input' : ''}`} 
              placeholder="Select end time" 
            />
            <FontAwesomeIcon icon={faClock} className="input-icon right" />
          </div>
          {formErrors.endTime && <div className="error-message">{formErrors.endTime}</div>}
        </div>

        <div className="input-group">
          <div className="header">Vehicle Number<span className="required">*</span></div>
          <input
            type="text"
            className={`input ${vehicleNumberError ? 'error-input' : ''}`}
            placeholder="Enter vehicle number (Format: XX00XX0000)"
            value={vehicleNumber}
            onChange={(e) => validateVehicleNumber(e.target.value)}
          />
          {vehicleNumberError && <div className="error-message">{vehicleNumberError}</div>}
        </div>

        <div className="input-group">
          <div className="header">Phone Number<span className="required">*</span></div>
          <input
            type="text"
            className={`input ${phoneNumberError ? 'error-input' : ''}`}
            placeholder="Enter 10-digit phone number"
            value={phoneNumber}
            onChange={(e) => validatePhoneNumber(e.target.value)}
          />
          {phoneNumberError && <div className="error-message">{phoneNumberError}</div>}
        </div>

        {/* Summary */}
        <div className="summary">
          <div className="summary-item">
            <div className="header">Duration</div>
            <div className="amount">{duration > 0 ? `${duration} ${unit}` : '-'}</div>
          </div>
          <div className="summary-item">
            <div className="header">Rate</div>
            <div className="amount">₹{rate}/{selectedPricingType === 'Hourly' ? 'hr' : selectedPricingType}</div>
          </div>
          <div className="summary-item total">
            <div className="header">Total</div>
            <div className="amount">₹{total}</div>
          </div>
        </div>

        <button 
          onClick={handleBooking} 
          className="book-button"
          disabled={!startTime || !endTime || !vehicleNumber || !phoneNumber || !selectedSlot || !name || !email || loading}
        >
          {loading ? 'Loading...' : 'Book now'}
        </button>
      </div>
    </div>,
    document.body
  );
};

export default ParkingBooking;