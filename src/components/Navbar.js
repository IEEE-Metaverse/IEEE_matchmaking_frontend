import { supabase } from "../supabaseClient"; 
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar({ userLoggedIn, onLogout }) {
  const [open, setOpen] = useState(false);
  const location = useLocation(); // get current path to set active link

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout failed:", error);
      alert("Logout failed: " + error.message);
      return;
    }
    if (onLogout) onLogout(); // notify parent
    window.location.href = "/login"; // redirect to login page
  };

  return (
    <nav className="app-navbar">
      <div className="nav-inner">
        <div className="brand">
          IEEE <span>ConfRec</span>
        </div>

        <div className={`links ${open ? 'open' : ''}`}>
          <NavLink 
            to="/researchers" 
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            Researchers
          </NavLink>

          <NavLink 
            to="/sessions" 
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            Sessions
          </NavLink>

          {/* Always show Edit Interests if user is logged in */}
          {userLoggedIn && (
            <NavLink 
              to="/questionnaire" 
              className={({ isActive }) => 
                isActive || location.pathname === "/questionnaire" ? 'active' : ''
              }
            >
              Edit Interests
            </NavLink>
          )}

          {userLoggedIn && (
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>

        <div className="menu-toggle" onClick={() => setOpen(!open)}>☰</div>
      </div>
    </nav>
  );
}
