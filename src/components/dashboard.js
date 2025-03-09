import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    } else {
      fetch("http://localhost:8081/api/auth/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Unauthorized");
          }
          return response.json();
        })
        .then((data) => setUser(data))
        .catch(() => {
          localStorage.removeItem("token");
          navigate("/login");
        });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">Dashboard</div>
      {
        user ? (
          <>
            <p className="text-lg">Welcome, {user.name}!</p>
            <p className="text-sm text-gray-600">Role: {user.role}</p>
            <button
              onClick={handleLogout}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <p>Loading user data...</p>
        )
      }
    </div>
  );
}

export default Dashboard;