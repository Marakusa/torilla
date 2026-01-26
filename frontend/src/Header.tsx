import React, { useState } from "react";
import { NavLink } from "react-router";
import "./Header.css";
import { FaShoppingCart, FaBell, FaSearch } from "react-icons/fa";
import { useAuth } from "./context/AuthContext";

function Header() {
  const { user, loading } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  function focusSearchBar(event: React.MouseEvent<HTMLDivElement>): void {
    const input = event.currentTarget.querySelector('.nav-search-input') as HTMLInputElement | null;
    if (input) input.focus();
  }

  return (
    <header>
      <div className="nav-main">
        <NavLink to="/" className="nav-logo" id="nav-logo">Torilla</NavLink>
        <nav className="nav-links">
          <NavLink to="/market" className="nav-a" id="nav-button-market">Market</NavLink>
          <NavLink to="/about" className="nav-a" id="nav-button-about">About</NavLink>
        </nav>
        <div className="nav-search" onClick={focusSearchBar}>
          <FaSearch />
          <input type="text" className="nav-search-input" placeholder="Search assets..." />
        </div>
      </div>
      <nav className="nav-links">
        <a className="nav-a" id="nav-button-cart"><FaShoppingCart /></a>
        <a className="nav-a" id="nav-button-notifications"><FaBell /></a>
        {!loading && (user ?
          <div className="nav-profile">
            <p className="nav-a" id="nav-button-profile" onClick={() => setShowProfileDropdown(!showProfileDropdown)}>{user.user.displayName}</p>
            {
              showProfileDropdown &&
              <div className="nav-profile-dropdown">
                <NavLink to={"/" + user.user.username} className="nav-a" id="nav-button-market">Profile</NavLink>
                <NavLink to="/settings" className="nav-a" id="nav-button-market">Settings</NavLink>
                <hr></hr>
                <NavLink to="/dashboard" className="nav-a" id="nav-button-market">Creator Dashboard</NavLink>
                <hr></hr>
                <NavLink to="/logout" className="nav-a" id="nav-button-market">Log out</NavLink>
              </div>
            }
          </div> :
          <NavLink to="/login" className="nav-a" id="nav-button-profile">Log in</NavLink>)}
        <a className="nav-a" id="nav-button-dashboard">Dashboard</a>
      </nav>
    </header>
  );
}

export default Header;