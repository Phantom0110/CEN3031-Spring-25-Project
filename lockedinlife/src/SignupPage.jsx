import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSignup = () => {
        // Save user in localStorage for now (replace with backend later)
        const users = JSON.parse(localStorage.getItem("users")) || [];
        if (users.find(user => user.username === username)) {
        alert("Username already exists!");
        return;
        }

        users.push({ username, password });
        localStorage.setItem("users", JSON.stringify(users));
        alert("Account created! Please log in.");
        navigate("/");
    };

    return (
        <div>
            <h1>Locked-In Life</h1>
            <h2>Create an Account</h2>
            <div>
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div>
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
                <button onClick={handleSignup}>Sign Up</button>
            </div>
            <p>Already have an account? <a href="/">Login</a></p>
        </div>
    );
};

export default SignupPage;
