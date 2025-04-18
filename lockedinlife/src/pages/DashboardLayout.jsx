import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import '../styles/DashboardLayout.css';

export default function DashboardLayout() {
  const navigate = useNavigate();

  const [sidebarImage, setSidebarImage] = useState('src/assets/react.svg');

  const handleLogout = () => {
    // Clear session if needed
    navigate('/');
  };
  
  return (
    <div className="dashboard-container">
        
      <div className="sidebar">
        <img src={sidebarImage} alt="Reward Icon" className="sidebar-image" />

        <h2>Locked-In Life</h2>

        <NavLink to="/home">Home</NavLink>
        <NavLink to="/battlepass">Battlepass</NavLink>

        <button className="logout-button" onClick={handleLogout}>Logout</button>

      </div>

      <div className="content">
        <Outlet context={{ setSidebarImage }} />
      </div>
    </div>
  );
}
