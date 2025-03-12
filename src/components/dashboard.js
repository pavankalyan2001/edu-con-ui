import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import { productsData } from "../dataObjs/productsData.js";
import Feedbacks from "./feedbacks.js";

export default function AppointmentDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [userRole] = useState(localStorage.getItem("role"));
  const [productDetails] = useState({});
  const [formData, setFormData] = useState({
    consultantId: "",
    date: "",
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [view, setView] = useState("appointments");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedConsultant, setSelectedConsultant] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token && !user) {
      navigate("/login");
      return;
    }
    setProducts(productsData);
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

  const handleProductOpenPopup = (product) => {
    setSelectedProduct(product);
    setShowPopup(true);
  };
  const handleProductClosePopup = () => {
    setSelectedProduct(null);
    setShowPopup(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    console.log("updatedFormData", updatedFormData);
    setFormData(updatedFormData);

    if (name === "date" || name === "consultantId") {
      fetchBookedSlots(updatedFormData.date, updatedFormData.consultantId);
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
      .then((data) => {
        if (data && data.length > 0) {
          setAvailableSlots(data);
        } else {
          setAvailableSlots(["No available slots for this date!"]);
        }
      })
      .catch(() => console.error("Failed to load booked slots."));
  };

  const handlePurchase = () => {
    if (!selectedConsultant) {
      alert("Please select a consultant!");
      return;
    }
    purchaseProduct(selectedProduct);
    handleProductClosePopup();
  };

  const purchaseProduct = async (product) => {
    productDetails.productName = product.name;
    productDetails.price = product.price;
    productDetails.studentId = localStorage.getItem("user");
    productDetails.consultantId = selectedConsultant;
    const response = await fetch(`http://localhost:8081/api/purchases`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(productDetails),
    });
    if (response.ok) {
      const data = await response.text();
      alert(data);
    } else {
      alert("Error in Payment");
    }
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    console.log("user: ", user)
    formData.studentId = user;
    console.log("formData: ", formData);
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
        <h2>Student Dashboard</h2>
        <ul>
          <li className={view === "appointments" ? "active" : ""} onClick={() => setView("appointments")}>
            Appointments
          </li>
          <li className={view === "products" ? "active" : ""} onClick={() => { setView("products") }}>
            Products
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
                        <option key={slot} value={slot} disabled={slot.includes("No")}>
                          {slot}
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
          </>
        ) : view === "products" ? (
        <>
          <h2 className="heading">Available Courses</h2>
          {products.length > 0 ? (
            <>
              <div className="product-grid">
                {products.map((product) => (
                  <div key={product.id} className="product-card">
                    <img src={product.imageUrl} alt={product.name} className="product-image" />
                    <div className="product-details">
                      <h3>{product.name}</h3>
                      <p>${product.price}</p>
                      <button onClick={() => handleProductOpenPopup(product)}>Buy Now</button>
                    </div>
                  </div>
                ))}
              </div>

              {showPopup && selectedProduct && (
                <div className="popup">
                  <div className="popup-content">
                    <h2>Purchase Course</h2>
                    <p className="popup-course-name">{selectedProduct.name}</p>
                    <label>Select Consultant</label>
                    <select
                      value={selectedConsultant}
                      onChange={(e) => setSelectedConsultant(e.target.value)}
                      required
                    >
                      <option value="">-- Select Consultant --</option>
                      {consultants.map((consultant) => (
                        <option key={consultant.id} value={consultant.id}>
                          {consultant.name}
                        </option>
                      ))}
                    </select>
                    <button className="submit-button" onClick={handlePurchase}>
                      Proceed to Buy
                    </button>
                    <button className="cancel-button" onClick={handleProductClosePopup}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="no-products">No Products found.</p>
            </>
          )}
        </>
        ):(
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
