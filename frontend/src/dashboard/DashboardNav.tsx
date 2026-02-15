import { NavLink } from "react-router";
import "./DashboardNav.css";
import { useAuth } from "../context/AuthContext";
import { useLoadingBar } from "../context/LoadingContext";
import { useNavigate } from "react-router";
import NavContextButtonLeft from "./components/NavContextButtonLeft";
import NavButtonLeft from "./components/NavButtonLeft";

function DashboardNav() {
  const navigate = useNavigate();

  const { user, loadingAuth } = useAuth();
  const { loading } = useLoadingBar();

  if (!loadingAuth && !user?.user) {
    navigate("/login");
  }

  return (
    <div className="dashboard-side-nav">
      <div className="side-nav-main">
        <NavLink to="/dashboard" className="side-nav-logo" id="side-nav-logo">Torilla</NavLink>
        <nav className="side-nav-links">
          <NavButtonLeft to="/dashboard/products" value="Products" id="side-nav-button-products" />
        </nav>
      </div>
      <nav className="side-nav-links">
        {!loadingAuth && (user ?
          <NavContextButtonLeft id="side-nav-button-profile" value={user.user.displayName} contextMenuItems={[
            { to: "/" + user.user.username, value: "Profile" },
            { to: "/settings", value: "Settings" },
            { hr: true },
            { to: "/dashboard", value: "Creator Dashboard" },
            { hr: true },
            { to: "/logout", value: "Log out" },
          ]} /> :
          <NavButtonLeft to="/login" value="Log in" id="side-nav-button-profile" />)}
        <NavButtonLeft to="/market" value="Market" id="side-nav-button-market" />
      </nav>
      {loading && <div className="header-loading"></div>}
    </div>
  );
}

export default DashboardNav;