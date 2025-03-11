import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ConsultantDash.css";

export default function ConsultantAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

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
                    <li className="active">Appointments</li>
                    <li>Settings</li>
                    <li onClick={handleLogout} className="logout">
                        Logout
                    </li>
                </ul>
            </div>
            <div className="content">
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
            </div>
        </div>
    );
}
