import { BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import Login from "./components/login";
import Register from "./components/register";
import AppointmentDashboard from "./components/dashboard";
import ConsultantAppointments from "./components/consultantDash";
import AdminDashboard from "./components/adminDash";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<AppointmentDashboard />}/>
        <Route path="/conDashboard" element={<ConsultantAppointments />}/>
        <Route path="/adminDashboard" element={<AdminDashboard />}/>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
