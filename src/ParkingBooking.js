import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCar, faShuttleVan, faBicycle, faBus,
  faClock, faCalendar, faXmark
} from '@fortawesome/free-solid-svg-icons';
import './css/ParkingBooking.css'; // Import CSS file
import { handlePayment } from './Razorpay/PaymentButton';
import { Navigate } from 'react-router-dom';

const ParkingBooking = ({ isOpen, onClose }) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    flatpickr("#start-time", {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      onChange: function (selectedDates, dateStr) {
        setStartTime(dateStr);
        document.getElementById('start-time-display').textContent = new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        document.getElementById('start-date-display').textContent = new Date(dateStr).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
      }
    });

    flatpickr("#end-time", {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      onChange: function (selectedDates, dateStr) {
        setEndTime(dateStr);
        document.getElementById('end-time-display').textContent = new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        document.getElementById('end-date-display').textContent = new Date(dateStr).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
      }
    });
  }, [isOpen]);

  const selectSlot = (slotId) => {
    setSelectedSlot(slotId);
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="popup-overlay">
      <div className="popup-container">
        <button className="close-button" onClick={onClose}>
        <span style={{ fontSize: '20px' }}>✖</span>
        </button>
        <div className="header">Garage 1</div>
        <div className="subheader">123, New York</div>

        <div className="image-placeholder">
          <FontAwesomeIcon icon={faCar} />
          <span>No images available.</span>
        </div>

        {/* Time Display */}
        <div className="time-display">
          <div className="time" id="start-time-display"></div>
          <div className="to">to</div>
          <div className="time" id="end-time-display"></div>
        </div>
        <div className="date-display">
          <div id="start-date-display"></div>
          <div id="end-date-display"></div>
        </div>

        {/* Slot Type Section */}
        <div className="slot-type">
          <div className="header">Select Slot Type</div>
          <div className="grid">
            {[
              { id: 1, icon: faCar, label: 'Micro', price: '₹10/hr', size: 'Small' },
              { id: 2, icon: faShuttleVan, label: 'Mini', price: '₹15/hr', size: 'Standard' },
              { id: 3, icon: faBicycle, label: 'Large', price: '₹5/hr', size: 'Large' },
              { id: 4, icon: faBus, label: 'Bike', price: '₹20/hr', size: 'Bike' },
              { id: 5, icon: faBus, label: 'Auto', price: '₹20/hr', size: 'Auto' },
              { id: 6, icon: faBus, label: 'Bus', price: '₹20/hr', size: 'Bus' },
            ].map(slot => (
              <button
                key={slot.id}
                className={`slot-button ${selectedSlot === slot.id ? 'selected' : ''}`}
                onClick={() => selectSlot(slot.id)}
              >
                <div className="icon">
                  <FontAwesomeIcon icon={slot.icon} />
                </div>
                <div className="label">{slot.label}</div>
                <div className="price">{slot.price}</div>
                <div className="size">{slot.size}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Time Inputs */}
        <div className="input-group">
          <div className="header">Start Time</div>
          <div className="input-wrapper">
            <FontAwesomeIcon icon={faCalendar} className="input-icon left" />
            <input type="text" id="start-time" className="input" placeholder="Select start time" />
            <FontAwesomeIcon icon={faClock} className="input-icon right" />
          </div>
        </div>

        <div className="input-group">
          <div className="header">End Time</div>
          <div className="input-wrapper">
            <FontAwesomeIcon icon={faCalendar} className="input-icon left" />
            <input type="text" id="end-time" className="input" placeholder="Select end time" />
            <FontAwesomeIcon icon={faClock} className="input-icon right" />
          </div>
        </div>

        <div className="input-group">
          <div className="header">Vehicle Number</div>
          <input type="text" className="input" placeholder="Enter vehicle number" />
        </div>

        <div className="input-group">
          <div className="header">Phone Number</div>
          <input type="text" className="input" placeholder="Enter phone number" />
        </div>

        {/* Summary */}
        <div className="summary">
          <div className="summary-item">
            <div className="header">Parking</div>
            <div className="amount">-₹27</div>
          </div>
          <div className="summary-item">
            <div className="header">Total</div>
            <div className="amount">-₹27</div>
          </div>
        </div>

        <button onClick={handlePayment()} className="book-button1">Book now</button>
      </div>
    </div>,
    document.body
  );
};

export default ParkingBooking;
