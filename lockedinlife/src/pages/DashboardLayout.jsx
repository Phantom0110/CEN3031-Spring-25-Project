import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import '../styles/DashboardLayout.css';

export default function DashboardLayout() {
  const navigate = useNavigate();

  const [sidebarImage, setSidebarImage] = useState('src/assets/Themes/1_Default/main.png');
  const [bottomSidebarImage, setBottomSidebarImage] = useState('src/assets/Themes/1_Default/pic1.jpg');
  const [mascotImage, setMascotImage] = useState(null);

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

        <img src={bottomSidebarImage} alt="Bottom Reward Icon" className="bottom-sidebar-image"/>
      </div>

      <div className="content">
        <Outlet context={{ setSidebarImage, setBottomSidebarImage, mascotImage, setMascotImage }} />
      </div>
    </div>
  );
}
