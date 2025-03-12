import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ConsultantDash.css";
import ConsultantAppointmentsPie from "./conpiechart";
import Feedbacks from "./feedbacks";

export default function ConsultantAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusCounts, setStatusCounts] = useState({});
    const [salesCounts, setSalesCounts] = useState({});
    const [userRole] = useState(localStorage.getItem("role"));
    const [view, setView] = useState("appointments");

    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("user");
        if (!token) {
            navigate("/login");
            return;
        }

        fetch(`http://localhost:8081/api/appointments/consultant?consultantId=${userId}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("data: ", data);
                setAppointments(data);
                setLoading(false);
            })
            .catch(() => {
                localStorage.removeItem("token");
                navigate("/login");
            });
    }, [navigate]);

    const fetchConStatuses = async () => {
        const response = await fetch(`http://localhost:8081/api/stats/conStatuses?consultantId=${localStorage.getItem("user")}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.ok) {
            const data = await response.json();
            setStatusCounts(data);
        } else {
            alert("Error fetching appointments:");
        }
    }

    const fetchSales = async () => {
        const response = await fetch(`http://localhost:8081/api/stats/sales?consultantId=${localStorage.getItem("user")}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.ok) {
            const data = await response.json();
            setSalesCounts(data);
        } else {
            alert("Error fetching appointments:");
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const handleAction = async (appointmentId, action) => {
        const response = await fetch(`http://localhost:8081/api/appointments/update?appointmentId=${appointmentId}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            },
            body: action
        });
        if (response.ok) {
            const data = await response.json();
            setAppointments((prev) =>
                prev.map((appt) =>
                    appt.id === appointmentId ? { ...appt, status: data.status } : appt
                )
            );
        } else {
            alert("Error updating appointment");
        };
    }

    return (

        <div className="dashboard-container">
            <div className="sidebar">
                <h2>Consultant Dashboard</h2>
                <ul>
                    <li className={view === "appointments" ? "active" : ""} onClick={() => setView("appointments")}>
                        Appointments
                    </li>
                    <li className={view === "stats" ? "active" : ""} onClick={() => { setView("stats"); fetchConStatuses(); fetchSales(); }}>
                        Statistics
                    </li>
                    <li className={view === "feedbacks" ? "active" : ""} onClick={() => { setView("feedbacks") }}>
                        Feedbacks
                    </li>
                    <li onClick={handleLogout} className="logout">
                        Logout
                    </li>
                </ul>
            </div>
            <div className="content">
                {view === "appointments" ? (
                    <>
                        <h2 className="text-2xl font-bold mb-4">My Appointments</h2>
                        {loading ? <p>Loading...</p> : (
                            <table className="appointment-table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
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
                                            <td>{appointment.appointmentDate}</td>
                                            <td>{appointment.appointmentSlot}</td>
                                            <td>{appointment.status}</td>
                                            <td>
                                                {appointment.status === "PENDING" ? (
                                                    <>
                                                        <button
                                                            className="confirm-button"
                                                            onClick={() => handleAction(appointment.id, "confirm")}
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            className="reject-button"
                                                            onClick={() => handleAction(appointment.id, "reject")}
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                ) : appointment.status === "CONFIRMED" ? (
                                                    <>
                                                        <button
                                                            className="complete-button"
                                                            onClick={() => handleAction(appointment.id, "complete")}
                                                        >
                                                            Complete
                                                        </button>

                                                    </>
                                                ) : (
                                                    <>
                                                        <p>No Pending Action.</p>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                ) : view === "stats" ? (
                    <>
                        <h2 className="text-2xl font-bold mb-4">Consultant Appointments and Course Sale Overview</h2>
                        <div style={{ display: "flex", justifyContent: "space-around", gap: "20px" }}>
                            <ConsultantAppointmentsPie data={statusCounts} />
                            <ConsultantAppointmentsPie data={salesCounts} />
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold mb-4">Feedbacks</h2>
                        <div style={{ display: "flex", justifyContent: "space-around", gap: "20px" }}>
                            <Feedbacks userType={userRole} />
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}
