import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCar, faShuttleVan,
  faClock, faCalendar,
  faMotorcycle, faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import './css/ParkingBooking.css';
import { handlePayment } from './Razorpay/PaymentButton';

const slotTypes = [
  { id: 1, icon: faMotorcycle, label: 'Bike/Cycle', price: 20, size: 'Small'},
  { id: 2, icon: faCar, label: 'Car/Auto', price: 50, size: 'Medium' },
  { id: 3, icon: faShuttleVan, label: 'Bus/Truck', price: 100, size: 'Large' },
];

const ParkingBooking = ({ isOpen, onClose, garageName = "Garage Name", garageAddress = "123, New York" }) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

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

    // Initialize new instances
    flatpickrStartRef.current = flatpickr("#start-time", {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      minDate: now,
      minTime: now.getHours() + ":" + now.getMinutes(),
      minuteIncrement: 30,
      onChange: function (selectedDates, dateStr) {
        setStartTime(dateStr);
        const date = new Date(dateStr);
        setStartTimeDisplay(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setStartDateDisplay(date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }));
        
        // Set min date for end time picker to be the start time
        if (flatpickrEndRef.current) {
          flatpickrEndRef.current.set('minDate', dateStr);
          
          // If selected start date is today, set minimum time to be the selected start time
          const selectedDate = new Date(dateStr);
          const today = new Date();
          if (selectedDate.toDateString() === today.toDateString()) {
            const hours = selectedDate.getHours();
            const minutes = selectedDate.getMinutes() + 30; // Add 30 minutes minimum
            flatpickrEndRef.current.set('minTime', `${hours}:${minutes}`);
          } else {
            flatpickrEndRef.current.set('minTime', null);
          }
        }
      }
    });

    flatpickrEndRef.current = flatpickr("#end-time", {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      minDate: startTime || now,
      minuteIncrement: 30,
      onChange: function (selectedDates, dateStr) {
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
  }, [isOpen, startTime]);

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
  const rate = selectedSlotObj?.price || 0;
  
  // Calculate duration in hours, ensuring minimum of 1 hour
  const calculateDuration = () => {
    if (!startTime || !endTime) return 0;
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    // Round to next 0.5 hour if there's a partial hour
    return Math.max(1, Math.ceil(diffHours * 2) / 2);
  };
  
  const durationHours = calculateDuration();
  const total = rate * durationHours;

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

  const handleBooking = () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      setFormErrors({...formErrors, endTime: 'End time must be after start time'});
      return;
    }

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
      duration: durationHours,
      total,
      garage: garageName,
      address: garageAddress
    };

    handlePayment(bookingDetails);
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="popup-overlay">
      <div className="popup-container">
        <button className="close-button" onClick={onClose}>
          <span style={{ fontSize: '20px' }}>✖</span>
        </button>
        <div className="header">{garageName}</div>
        <div className="subheader">{garageAddress}</div>

        <div className="image-placeholder">
          <FontAwesomeIcon icon={faCar} />
          <span>No images available.</span>
        </div>

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
                <div className="price">₹{slot.price}/hr</div>
                <div className="size">{slot.size}</div>
              </button>
            ))}
          </div>
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
            <div className="amount">{durationHours > 0 ? `${durationHours} hour${durationHours === 1 ? '' : 's'}` : '-'}</div>
          </div>
          <div className="summary-item">
            <div className="header">Rate</div>
            <div className="amount">₹{rate}/hr</div>
          </div>
          <div className="summary-item total">
            <div className="header">Total</div>
            <div className="amount">₹{total}</div>
          </div>
        </div>

        <button 
          onClick={handleBooking} 
          className="book-button"
          disabled={!startTime || !endTime || !vehicleNumber || !phoneNumber || !selectedSlot || !name || !email}
        >
          Book now
        </button>
      </div>
    </div>,
    document.body
  );
};

export default ParkingBooking;