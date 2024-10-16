import React, { useState } from "react";
import "../styles/auth.css"; // Assuming your CSS file is named auth.css

function AuthPage({ onLogin }) { // Accept onLogin prop from App.js
  const [isLogin, setIsLogin] = useState(false); // Switch between login and signup

  const handleToggle = () => {
    setIsLogin(!isLogin);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mock login/signup logic
    // Normally, here you'd make an API request to your backend for login/signup
    // For now, we'll just simulate a successful login by calling onLogin.

    console.log("Form submitted!");
    onLogin(); // Simulate a successful login by calling onLogin
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-logo">
          <h2>Student Carpooling Service</h2>
        </div>
        <h1>{isLogin ? "Welcome back" : "Create an account"}</h1>
        <p>{isLogin ? "Sign in to continue" : "Create a free account"}</p>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <input
                type="email"
                placeholder="University email address"
                required
              />
              <input type="text" placeholder="Username" required />
              <input type="password" placeholder="Password" required />
              <input type="password" placeholder="Repeat password" required />
            </>
          )}

          {isLogin && (
            <>
              <input
                type="email"
                placeholder="University email address"
                required
              />
              <input type="text" placeholder="Username" required />
              <input type="password" placeholder="Password" required />
            </>
          )}

          <button type="submit">{isLogin ? "Sign in" : "Sign up"}</button>
        </form>

        <p>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span onClick={handleToggle} className="toggle-auth">
            {isLogin ? "Sign up" : "Sign in"}
          </span>
        </p>
      </div>
      <div className="auth-image-container">
        <img src="../images/carpool3.jpg" alt="illustration" />
      </div>
    </div>
  );
}

export default AuthPage;
