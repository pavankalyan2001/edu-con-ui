import { BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import Login from "./components/login";
import Dashboard from "./components/dashboard";
import Register from "./components/register";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />}/>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
