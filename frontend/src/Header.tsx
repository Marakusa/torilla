import React from "react";
import { NavLink } from "react-router";
import { FaShoppingCart, FaBell, FaSearch } from "react-icons/fa";

function Header() {
  function focusSearchBar(event: React.MouseEvent<HTMLDivElement>): void {
    const input = event.currentTarget.querySelector('.nav-search-input') as HTMLInputElement | null;
    if (input) input.focus();
  }

  return (
    <header>
      <div className="nav-main">
        <NavLink to="/" className="nav-logo" id="nav-logo">Torilla</NavLink>
        <nav className="nav-links">
          <NavLink to="/" className="nav-a" id="nav-button-home">Home</NavLink>
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
        <a className="nav-a" id="nav-button-profile">Sign In</a>
        <a className="nav-a" id="nav-button-dashboard">Dashboard</a>
      </nav>
    </header>
  );
}

export default Header;