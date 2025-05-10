// import React from 'react';
// import './css/HeaderNavBar.css'
// import placeholderIcon from "./placeholder.png";
// import { useNavigate } from 'react-router-dom';

// function HeaderNavbar() {
  
//   const navigate = useNavigate();

//   const handleBecomeOwnerClick = () => {
//     navigate('/register');
//   };

//   return (
//     <div className='HeaderNavBar'>
//       <div className='NavBar'>
//         <img src={placeholderIcon}
//           alt="logo"
//           width={50}
//           height={50} />
//         <h2>Home</h2>
//         <h2>Favourite</h2>
//         <h2 onClick={handleBecomeOwnerClick} style={{cursor:'pointer'}}>Become an Owner</h2>
//       </div>
//       <div className='SearchBar'>
//         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
//           <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
//         </svg>
//         <input type='text' placeholder='Search'></input>
//       </div>
//       <div>
//        <img src=''
//           alt='user'
//           width={50}
//           height={50}
//         />
//       </div>
//     </div>
//   );
// }

// export default HeaderNavbar;

import React, { useState } from 'react';
import './css/HeaderNavBar.css';
import placeholderIcon from "./placeholder.png";
import { useNavigate } from 'react-router-dom';

function HeaderNavbar({ mapInstance }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleBecomeOwnerClick = () => {
    navigate('/register');
  };

  const handleSearch = async (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
        const data = await response.json();

        if (data.length > 0) {
          const { lon, lat } = data[0];

          mapInstance.flyTo({
            center: [parseFloat(lon), parseFloat(lat)],
            zoom: 14,
            speed: 1.5,
            curve: 1,
            easing(t) {
              return t;
            }
          });
        } else {
          alert('Location not found');
        }
      } catch (error) {
        console.error('Error fetching location:', error);
        alert('Something went wrong');
      }
    }
  };

  const handleLogout = () => {
    // Clear auth tokens if needed here
    navigate('/Sign'); // Redirect to signup/signin page
  };

  return (
  <div className='HeaderNavBar'>
  <div className='NavBar'>
    <img src={placeholderIcon} alt="logo" width={50} height={50} />
    <button className='Parking-button' onClick={handleBecomeOwnerClick} >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 8h4a2 2 0 0 1 2 2v8" />
    <path d="M9 16h4" />
    </svg>
    Offer My Parking
    </button>
  </div>

  <div className="search-bar">
    <input
      type="text"
      placeholder="Search..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      onKeyDown={handleSearch}
      className="search-input"
    />
    <button className="search-button" onClick={() => handleSearch({ key: 'Enter' })}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="22" 
        height="22" 
        viewBox="0 0 24 24" 
        fill="none" 
        className="search-icon"
      >
        <path 
          d="M11 17.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13z" 
          stroke="currentColor" 
          strokeWidth="2.75" 
          fill="none"
        />
        <path 
          d="M20 20l-4.35-4.35" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
        />
      </svg>
    </button>
  </div>
      <div className="UserSection">
        <button onClick={handleLogout} className="logout-button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        Log Out
        </button>
      </div>
    </div>
  );
}

export default HeaderNavbar;
