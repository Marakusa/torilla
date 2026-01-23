import React, { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { FaShoppingCart, FaBell, FaSearch } from "react-icons/fa";
import api from "./lib/torillaBackend";
import type { SessionLoginProps } from "./props/SessionLoginProps";

function Header() {
  const [accountProcessed, setAccountProcessed] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<SessionLoginProps | null>(null);

  useEffect(() => {
    try {
      api.getAccount().then((account) => {
        setAccountProcessed(true);
        if (account) {
          setLoggedInUser(account);
        }
      }).catch((reason: any) => {
        console.error("Failed to fetch user:", reason);
        setAccountProcessed(true);
        setLoggedInUser(null);
      });
    } catch (ex) {
      console.error("Failed to fetch user:", ex);
      setAccountProcessed(true);
      setLoggedInUser(null);
    }
  }, [api]);

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
        {accountProcessed && (loggedInUser ?
          <div className="nav-profile">
            <p className="nav-a" id="nav-button-profile" onClick={() => setShowProfileDropdown(!showProfileDropdown)}>{loggedInUser.user.displayName}</p>
            {
              showProfileDropdown &&
              <div className="nav-profile-dropdown">
                <NavLink to="/account" className="nav-a" id="nav-button-market">Account</NavLink>
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