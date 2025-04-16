import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!username || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      // Send a POST request to the backend to create the user
      const response = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password, // Send password as plain text
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert("Account created successfully! Please log in.");
        navigate("/"); // Redirect to the login page
      } else {
        alert("Error creating account. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while creating the account.");
    }
  };

  return (
    <div>
      <h1>Locked-In Life</h1>
      <h2>Create an Account</h2>
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
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
        <button onClick={handleSignup}>Sign Up</button>
      </div>
      <p>
        Already have an account? <a href="/">Login</a>
      </p>
    </div>
  );
};

export default SignupPage;
