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

  return (
    <div className='HeaderNavBar'>
      <div className='NavBar'>
        <img src={placeholderIcon}
          alt="logo"
          width={50}
          height={50} />
        <h2>Home</h2>
        <h2>Favourite</h2>
        <h2 onClick={handleBecomeOwnerClick} style={{cursor:'pointer'}}>Become an Owner</h2>
      </div>
      <div className='SearchBar'>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input 
          type='text' 
          placeholder='Search' 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>
      <div>
        <img src='' alt='user' width={50} height={50} />
      </div>
    </div>
  );
}

export default HeaderNavbar;
