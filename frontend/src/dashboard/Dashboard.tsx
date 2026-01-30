import "./Dashboard.css";
import DashboardNav from "./DashboardNav";
import { Outlet } from "react-router";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <DashboardNav />
      <div className="dashboard-content-root">
        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
