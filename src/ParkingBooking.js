// import React, { useEffect, useState } from 'react';
// import ReactDOM from 'react-dom';
// import flatpickr from 'flatpickr';
// import 'flatpickr/dist/flatpickr.min.css';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import {
//   faCar, faShuttleVan, faBicycle, faBus,
//   faClock, faCalendar, faXmark
// } from '@fortawesome/free-solid-svg-icons';
// import './css/ParkingBooking.css'; // Import CSS file
// import { handlePayment } from './Razorpay/PaymentButton';

// const ParkingBooking = ({ isOpen, onClose }) => {
//   const [startTime, setStartTime] = useState('');
//   const [endTime, setEndTime] = useState('');
//   const [selectedSlot, setSelectedSlot] = useState('');

//   useEffect(() => {
//     if (!isOpen) return;

//     flatpickr("#start-time", {
//       enableTime: true,
//       dateFormat: "Y-m-d H:i",
//       onChange: function (selectedDates, dateStr) {
//         setStartTime(dateStr);
//         document.getElementById('start-time-display').textContent = new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//         document.getElementById('start-date-display').textContent = new Date(dateStr).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
//       }
//     });

//     flatpickr("#end-time", {
//       enableTime: true,
//       dateFormat: "Y-m-d H:i",
//       onChange: function (selectedDates, dateStr) {
//         setEndTime(dateStr);
//         document.getElementById('end-time-display').textContent = new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//         document.getElementById('end-date-display').textContent = new Date(dateStr).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
//       }
//     });
//   }, [isOpen]);

//   const selectSlot = (slotId) => {
//     setSelectedSlot(slotId);
//   };

//   if (!isOpen) return null;

//   return ReactDOM.createPortal(
//     <div className="popup-overlay">
//       <div className="popup-container">
//         <button className="close-button" onClick={onClose}>
//         <span style={{ fontSize: '20px' }}>✖</span>
//         </button>
//         <div className="header">Garage 1</div>
//         <div className="subheader">123, New York</div>

//         <div className="image-placeholder">
//           <FontAwesomeIcon icon={faCar} />
//           <span>No images available.</span>
//         </div>

//         {/* Time Display */}
//         <div className="time-display">
//           <div className="time" id="start-time-display"></div>
//           <div className="to">to</div>
//           <div className="time" id="end-time-display"></div>
//         </div>
//         <div className="date-display">
//           <div id="start-date-display"></div>
//           <div id="end-date-display"></div>
//         </div>

//         {/* Slot Type Section */}
//         <div className="slot-type">
//           <div className="header">Select Slot Type</div>
//           <div className="grid">
//             {[
//               { id: 1, icon: faCar, label: 'Micro', price: '₹10/hr', size: 'Small' },
//               { id: 2, icon: faShuttleVan, label: 'Mini', price: '₹15/hr', size: 'Standard' },
//               { id: 3, icon: faBicycle, label: 'Large', price: '₹5/hr', size: 'Large' },
//               { id: 4, icon: faBus, label: 'Bike', price: '₹20/hr', size: 'Bike' },
//               { id: 5, icon: faBus, label: 'Auto', price: '₹20/hr', size: 'Auto' },
//               { id: 6, icon: faBus, label: 'Bus', price: '₹20/hr', size: 'Bus' },
//             ].map(slot => (
//               <button
//                 key={slot.id}
//                 className={`slot-button ${selectedSlot === slot.id ? 'selected' : ''}`}
//                 onClick={() => selectSlot(slot.id)}
//               >
//                 <div className="icon">
//                   <FontAwesomeIcon icon={slot.icon} />
//                 </div>
//                 <div className="label">{slot.label}</div>
//                 <div className="price">{slot.price}</div>
//                 <div className="size">{slot.size}</div>
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Time Inputs */}
//         <div className="input-group">
//           <div className="header">Start Time</div>
//           <div className="input-wrapper">
//             <FontAwesomeIcon icon={faCalendar} className="input-icon left" />
//             <input type="text" id="start-time" className="input" placeholder="Select start time" />
//             <FontAwesomeIcon icon={faClock} className="input-icon right" />
//           </div>
//         </div>

//         <div className="input-group">
//           <div className="header">End Time</div>
//           <div className="input-wrapper">
//             <FontAwesomeIcon icon={faCalendar} className="input-icon left" />
//             <input type="text" id="end-time" className="input" placeholder="Select end time" />
//             <FontAwesomeIcon icon={faClock} className="input-icon right" />
//           </div>
//         </div>

//         <div className="input-group">
//           <div className="header">Vehicle Number</div>
//           <input type="text" className="input" placeholder="Enter vehicle number" />
//         </div>

//         <div className="input-group">
//           <div className="header">Phone Number</div>
//           <input type="text" className="input" placeholder="Enter phone number" />
//         </div>

//         {/* Summary */}
//         <div className="summary">
//           <div className="summary-item">
//             <div className="header">Parking</div>
//             <div className="amount">-₹27</div>
//           </div>
//           <div className="summary-item">
//             <div className="header">Total</div>
//             <div className="amount">-₹27</div>
//           </div>
//         </div>

//         <button onClick={handlePayment} className="book-button">Book now</button>
//       </div>
//     </div>,
//     document.body
//   );
// };

// export default ParkingBooking;



import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCar, faShuttleVan, faBicycle, faBus,
  faClock, faCalendar
} from '@fortawesome/free-solid-svg-icons';
import './css/ParkingBooking.css'; // Import your CSS
import { db } from './firebasecon'; // Firestore instance
import { collection, addDoc } from 'firebase/firestore';

const ParkingBooking = ({ isOpen, onClose, parkingData }) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    flatpickr("#start-time", {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      onChange: function (selectedDates, dateStr) {
        setStartTime(dateStr);
      }
    });

    flatpickr("#end-time", {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      onChange: function (selectedDates, dateStr) {
        setEndTime(dateStr);
      }
    });
  }, [isOpen]);

  const selectSlot = (slotId) => {
    setSelectedSlot(slotId);
  };

  const handleBooking = async () => {
    if (!startTime || !endTime || !selectedSlot || !vehicleNumber || !phoneNumber) {
      alert('Please fill all fields before booking.');
      return;
    }

    try {
      await addDoc(collection(db, 'userBooking'), {
        parkingId: parkingData.id || '',
        ownerName: parkingData.fullName || '',
        ownerPhone: parkingData.phoneNumber || '',
        ownerEmail: parkingData.email || '',
        address: parkingData.address || '',
        place: parkingData.place || '',
        openingTime: parkingData.openingTime || '',
        closingTime: parkingData.closingTime || '',
        vehicleTypes: parkingData.vehicleTypes || '',
        pricing: parkingData.pricing || '',
        bookingStatus: 'Booked',
        userVehicleNumber: vehicleNumber,
        userPhoneNumber: phoneNumber,
        startTime,
        endTime,
        slotType: selectedSlot,
        createdAt: new Date()
      });

      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        onClose(); // Close the popup
      }, 2000);
    } catch (error) {
      console.error('Error booking parking:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="popup-overlay">
      <div className="popup-container">
        <button className="close-button" onClick={onClose}>
          <span style={{ fontSize: '20px' }}>✖</span>
        </button>

        {/* Parking Information */}
        <div className="header">{parkingData?.place || 'Parking Space'}</div>
        <div className="subheader">{parkingData?.address || ''}</div>

        {/* Image Placeholder */}
        <div className="image-placeholder">
          <FontAwesomeIcon icon={faCar} />
          <span>No images available.</span>
        </div>

        {/* Slot Type Selection */}
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
                <div className="icon"><FontAwesomeIcon icon={slot.icon} /></div>
                <div className="label">{slot.label}</div>
                <div className="price">{slot.price}</div>
                <div className="size">{slot.size}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div className="input-group">
          <div className="header">Start Time</div>
          <div className="input-wrapper">
            <FontAwesomeIcon icon={faCalendar} className="input-icon left" />
            <input type="text" id="start-time" className="input" placeholder="Select start time" value={startTime} onChange={(e)=> setEndTime(e.target.value)}/>
            <FontAwesomeIcon icon={faClock} className="input-icon right" />
          </div>
        </div>

        <div className="input-group">
          <div className="header">End Time</div>
          <div className="input-wrapper">
            <FontAwesomeIcon icon={faCalendar} className="input-icon left" />
            <input type="text" id="end-time" className="input" placeholder="Select end time" value={endTime}  onChange={(e)=> setEndTime(e.target.value)} />
            <FontAwesomeIcon icon={faClock} className="input-icon right" />
          </div>
        </div>


const [vehicleNumber,setVehicleNumber]=userState('');
comst[phoneNumber,setPhoneNumber]=useState('');


        {/* Vehicle & Phone Inputs */}
        <div className="input-group">
          <div className="header">Vehicle Number</div>
          <input
            type="text"
            className="input"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            placeholder="Enter vehicle number"
          />
        </div>

        <div className="input-group">
          <div className="header">Phone Number</div>
          <input
            type="text"
            className="input"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter your phone number"
          />
        </div>

        {/* Booking Button */}
        <button onClick={handleBooking} className="book-button">
          Book Now
        </button>

        {/* Success Message */}
        {bookingSuccess && (
          <div className="success-message">
            🎉 You have successfully booked this parking space!
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ParkingBooking;
