import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      localStorage.removeItem("token");
      const response = await fetch("http://localhost:8081/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        const userDataResponse = await fetch("http://localhost:8081/api/auth/me", {
          method: "GET",
          headers: { Authorization: `Bearer ${data.token}` },
        });
        if(userDataResponse.ok){
          const Userdata = await userDataResponse.json();
          localStorage.setItem("user", Userdata.id);
          localStorage.setItem("role", Userdata.role);
          if(Userdata.role==='CONSULTANT'){
            navigate("/conDashboard");
          }else if(Userdata.role==='STUDENT'){
            navigate("/dashboard");
          }else if(Userdata.role==='ADMIN'){
            navigate("/adminDashboard");
          }
        }else{
          alert("Error fetching user details");
        }      
      } else {
        alert("Login failed");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        <p>
          Don't have an account?{" "}
          <span className="register-link" onClick={() => navigate("/register")}>
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
