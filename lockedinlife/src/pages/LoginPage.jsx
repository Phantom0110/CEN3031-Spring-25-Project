import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!username || !password) {
            alert("Please fill in both fields.");
            return;
        }

        try {
            // Send a POST request to check credentials against the backend
            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // If credentials are correct, navigate to home page
                localStorage.setItem('userId', data.userId);
                navigate("/home");
            } else {
                // If credentials are incorrect
                alert("Invalid credentials");
            }
        } catch (error) {
            console.error("Error during login:", error);
            alert("An error occurred while logging in.");
        }
    };

    return (
        <div>
            <h1>Locked-In Life</h1>
            <h2>Welcome back</h2>
            <div>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div>
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <div>
                <button onClick={handleLogin}>Login</button>
            </div>
            <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
        </div>
    );
};

export default LoginPage;
