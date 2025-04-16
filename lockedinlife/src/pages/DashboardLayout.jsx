import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import '../styles/DashboardLayout.css';

export default function DashboardLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear session if needed
    navigate('/');
  };

  return (
    <div className="dashboard-container">
        
      <div className="sidebar">
        <h2>Locked-In Life</h2>

        <NavLink to="/home">Home</NavLink>
        <NavLink to="/collections">View Collections</NavLink>
        <NavLink to="/battlepass">Battlepass</NavLink>

        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}
