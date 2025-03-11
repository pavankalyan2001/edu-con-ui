import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDash.css";

export default function AdminDashboard() {
    const [appointments, setAppointments] = useState([]);
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(10); // Number of users per page
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchType, setSearchType] = useState("studentName");
    const [view, setView] = useState("appointments");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("user");
        if (!token || !userId) {
            navigate("/login");
            return;
        }
        fetchAll();
    }, [navigate]);

    const fetchAll = async () => {
        const response = await fetch("http://localhost:8081/api/appointments/fetchAll", {
            method: "GET",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.ok) {
            const data = await response.json();
            setAppointments(data);
        } else {
            alert("Error fetching appointments:");
        }
    }

    const fetchUsers = async () => {
        const response = await fetch(`http://localhost:8081/api/users/fetchAll?page=${page}&size=${size}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.ok) {
            const data = await response.json();
            setUsers(data.content); // Extract users from the response
            setTotalPages(data.totalPages); // Total pages from the backend
        } else {
            alert("Error fetching users:");
        }
    }

    const handleSearch = () => {
        const queryParam = searchType === "studentName" ? `studentName=${searchQuery}` : `consultantName=${searchQuery}`;

        fetch(`http://localhost:8081/api/appointments/search?${queryParam}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
            .then((response) => response.json())
            .then((data) => setAppointments(data))
            .catch((error) => console.error("Error searching appointments:", error));
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const handleDeleteAppointment = (appointmentId) => {
        if (window.confirm("Are you sure you want to delete this appointment?")) {
            fetch(`http://localhost:8081/api/appointments?appointmentId=${appointmentId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to delete appointment");
                    }
                    fetchAll();
                })
                .catch((error) => console.error("Error deleting appointment:", error));
        };
    }

    const handleDeleteUser = (userId,role) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            fetch(`http://localhost:8081/api/users/?userId=${userId}&role=${role}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to delete user");
                    }
                    fetchUsers();
                })
                .catch((error) => console.error("Error deleting user:", error));
        };
    }

    return (
        <div className="dashboard-container">
            <div className="sidebar">
                <h2>Admin Dashboard</h2>
                <ul>
                    <li className={view === "appointments" ? "active" : ""} onClick={() => setView("appointments")}>
                        Appointments
                    </li>
                    <li className={view === "users" ? "active" : ""} onClick={() => { setView("users"); fetchUsers(); }}>
                        User Data
                    </li>
                    <li onClick={handleLogout} className="logout">
                        Logout
                    </li>
                </ul>
            </div>
            <div className="content">
                {view === "appointments" ? (
                    <>
                        <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
                        <div className="search-bar">
                            <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                                <option value="studentName">Search by Student Name</option>
                                <option value="consultantName">Search by Consultant Name</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Enter name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button onClick={handleSearch} className="search-button">Search</button>
                        </div>
                        <table className="appointment-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Consultant</th>
                                    <th>Date</th>
                                    <th>Time Slot</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.map((appointment) => (
                                    <tr key={appointment.id}>
                                        <td>{appointment.studentName}</td>
                                        <td>{appointment.consultantName}</td>
                                        <td>{appointment.appointmentDate}</td>
                                        <td>{appointment.appointmentSlot}</td>
                                        <td>{appointment.status}</td>
                                        <td>
                                            <button
                                                className="delete-button"
                                                onClick={() => handleDeleteAppointment(appointment.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold mb-4">User Data</h2>
                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.role}</td>
                                        <td>
                                            <button
                                                className="delete-button"
                                                onClick={() => handleDeleteUser(user.id,user.role)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* Pagination Controls */}
                        <div>
                            <button disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
                            <span> Page {page + 1} of {totalPages} </span>
                            <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
