import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("STUDENT");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:8081/api/users/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role }),
            });
            console.log("response: ", response);
            if (!response.ok) {
                const errorData = await response.text();
                alert(errorData);
                navigate("/register");
            } else {
                alert("Registration successful! Please login.");
                localStorage.removeItem("token");
                navigate("/login");
            }
        } catch (error) {
            console.error("Registration error:", error);
        }
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <h2>Register</h2>
                <form onSubmit={handleRegister}>
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
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
                    <select value={role} onChange={(e) => setRole(e.target.value)} required>
                        <option value="STUDENT">Student</option>
                        <option value="CONSULTANT">Consultant</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                    <button type="submit">Register</button>
                </form>
                <p>
                    Already have an account?{" "}
                    <span className="login-link" onClick={() => navigate("/login")}>
                        Login
                    </span>
                </p>
            </div>
        </div>
    );
}
