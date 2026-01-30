import { useState } from "react";
import { NavLink } from "react-router";
import "./DashboardNav.css";
import { useAuth } from "../context/AuthContext";
import { useLoadingBar } from "../context/LoadingContext";
import { useNavigate } from "react-router";

function DashboardNav() {
  const navigate = useNavigate();

  const { user, loadingAuth } = useAuth();
  const { loading } = useLoadingBar();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  if (!loadingAuth && !user?.user) {
    navigate("/login");
  }

  return (
    <div className="dashboard-side-nav">
      <div className="side-nav-main">
        <NavLink to="/dashboard" className="side-nav-logo" id="side-nav-logo">Torilla</NavLink>
        <nav className="side-nav-links">
          <NavLink to="/dashboard/products" className="side-nav-a" id="side-nav-button-products">Products</NavLink>
        </nav>
      </div>
      <nav className="side-nav-links">
        {!loadingAuth && (user ?
          <div className="side-nav-profile">
            <p className="side-nav-a" id="side-nav-button-profile" onClick={() => setShowProfileDropdown(!showProfileDropdown)}>{user.user.displayName}</p>
            {
              showProfileDropdown &&
              <div className="side-nav-profile-dropdown">
                <NavLink to={"/" + user.user.username} className="side-nav-a" id="side-nav-button-market">Profile</NavLink>
                <NavLink to="/settings" className="side-nav-a" id="side-nav-button-market">Settings</NavLink>
                <hr></hr>
                <NavLink to="/dashboard" className="side-nav-a" id="side-nav-button-market">Creator Dashboard</NavLink>
                <hr></hr>
                <NavLink to="/logout" className="side-nav-a" id="side-nav-button-market">Log out</NavLink>
              </div>
            }
          </div> :
          <NavLink to="/login" className="side-nav-a" id="side-nav-button-profile">Log in</NavLink>)}
        <NavLink to="/market" className="side-nav-a" id="side-nav-button-market">Market</NavLink>
      </nav>
      {loading && <div className="header-loading"></div>}
    </div>
  );
}

export default DashboardNav;