import { useAuth } from "../context/AuthContext";

export default function DashboardMain() {
  const { user } = useAuth();

  return (
    <div className="dashboard-content">
      <h1>Hello, {user?.user.displayName}!</h1>
      <div>

      </div>
    </div>
  )
}
