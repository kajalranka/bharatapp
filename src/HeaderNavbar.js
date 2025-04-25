import React from 'react';
import './css/HeaderNavBar.css'
import placeholderIcon from "./placeholder.png";

function HeaderNavbar() {
  
  return (
    <div className='HeaderNavBar'>
      <div className='NavBar'>
        <img src={placeholderIcon}
          alt="logo"
          width={50}
          height={50} />
        <h2>Home</h2>
        <h2>Favourite</h2>
      </div>
      <div className='SearchBar'>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input type='text' placeholder='Search'></input>
      </div>
      <div>
       <img src=''
          alt='user'
          width={50}
          height={50}
        />
      </div>
    </div>
  );
}

export default HeaderNavbar;
