import React from 'react';
import Spline from '@splinetool/react-spline';
import { useNavigate } from "react-router-dom";
import "./css/LandingPage.css"

const LandingPage = () => {
    const navigate = useNavigate();
    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            <Spline scene="https://prod.spline.design/hHAVvUxQyJIJuEO3/scene.splinecode" />
            <div>
                <button
                 style={{
                    position: 'absolute',
                    top: '80%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    padding: '12px 24px',
                    fontSize: '18px',
                    backgroundColor: '#ff6b6b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                    transition: '0.3s',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#ff4747'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#ff6b6b'}
                 className="LandingButton" onClick={() => navigate("/Signup")}>Go to Home</button>
            </div>
        </div>
    );
};

export default LandingPage;
