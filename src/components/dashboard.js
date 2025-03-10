import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

export default function AppointmentDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({
    consultantId: "",
    date: "",
  });
  const [availableSlots] = useState([
    "9AM-10:30AM",
    "11AM-12:30PM",
    "3PM-4:30PM",
  ]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token && !user) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:8081/api/users/consultants", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => response.json())
      .then(data => setConsultants(data))
      .catch((error) => {
        console.log("fetch consultants: ", error);
        navigate("/login");
      });

    fetch("http://localhost:8081/api/appointments/student?studentId=" + user, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unauthorized");
        }
        return response.json();
      })
      .then((data) => {
        if (data && data) {
          setAppointments(data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.log("AppointmentDashboard: ", error);
        navigate("/login");
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleOpenPopup = () => setShowPopup(true);
  const handleClosePopup = () => setShowPopup(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (e.target.name === "date" || e.target.name === "consultantId") {
      fetchBookedSlots(e.target.value, formData.consultantId);
    }
  };

  const fetchBookedSlots = (date, consultantId) => {
    if (!date || !consultantId) return;

    fetch(
      `http://localhost:8081/api/appointments/booked-slots?date=${date}&consultantId=${consultantId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    )
      .then((response) => response.json())
      .then((data) => setBookedSlots(data))
      .catch(() => console.error("Failed to load booked slots."));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    console.log("user: ",user)
    formData.studentId = user;
    console.log("formData: ",formData);
    const response = await fetch("http://localhost:8081/api/appointments/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      const newAppointment = await response.json();
      setAppointments([...appointments, newAppointment]);
      setShowPopup(false);
      setFormData({ consultantId: "", date: "" });
    } else {
      alert("Failed to create appointment.");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2>Dashboard</h2>
        <ul>
          <li className="active">Appointments</li>
          <li>Settings</li>
          <li onClick={handleLogout} className="logout">
            Logout
          </li>
        </ul>
      </div>
      <div className="content">
        <h2 className="heading">Your Appointments</h2>
        <button className="add-button" onClick={handleOpenPopup}>
          + Make an Appointment
        </button>

        {loading ? (
          <p className="loading">Loading appointments...</p>
        ) : appointments.length > 0 ? (
          <table className="appointment-table">
            <thead>
              <tr>
                <th>Consultant</th>
                <th>Date</th>
                <th>Slot</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.consultantName}</td>
                  <td>{appointment.appointmentDate}</td>
                  <td>{appointment.appointmentSlot}</td>
                  <td>{appointment.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-appointments">No appointments found.</p>
        )}

        {showPopup && (
          <div className="popup">
            <div className="popup-content">
              <h2>Make an Appointment</h2>
              <form onSubmit={handleSubmit}>
                <label>Select Consultant</label>
                <select
                  name="consultantId"
                  value={formData.consultantId}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Consultant --</option>
                  {consultants.map((consultant) => (
                    <option key={consultant.id} value={consultant.id}>
                      {consultant.name}
                    </option>
                  ))}
                </select>
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
                <label>Time Slot</label>
                <select
                  name="timeSlot"
                  value={formData.slot}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Time Slot --</option>
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot} disabled={bookedSlots.includes(slot)}>
                      {slot} {bookedSlots.includes(slot) ? "(Booked)" : ""}
                    </option>
                  ))}
                </select>
                <button type="submit" className="submit-button">
                  Submit
                </button>
                <button type="button" className="cancel-button" onClick={handleClosePopup}>
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
