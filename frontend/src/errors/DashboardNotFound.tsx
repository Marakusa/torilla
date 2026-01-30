import '../App.css';
import "../dashboard/Dashboard.css";
import { NavLink } from "react-router";

function NotFound() {
  return (
    <div className="dashboard-content">
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <NavLink to="/dashboard" className="button-primary">Return to Dashboard</NavLink>
    </div>
  )
}

export default NotFound
