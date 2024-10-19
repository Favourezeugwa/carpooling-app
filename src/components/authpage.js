import React, { useState } from "react";
import "../styles/auth.css"; // Assuming your CSS file is named auth.css

function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(false); // Switch between login and signup
  const [email, setEmail] = useState(""); // Email input
  const [username, setUsername] = useState(""); // Username input (signup only)
  const [password, setPassword] = useState(""); // Password input
  const [repeatPassword, setRepeatPassword] = useState(""); // Repeat password (signup only)
  const [otp, setOtp] = useState(""); // OTP input
  const [showOtp, setShowOtp] = useState(false); // Show OTP input

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setShowOtp(false); // Hide OTP field on toggle
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin) {
      // Signup request
      const signupResponse = await fetch(
        "http://localhost:5001/api/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            username,
            password,
          }),
        }
      );

      const signupData = await signupResponse.json();
      if (signupResponse.ok) {
        console.log("Signup successful", signupData);
        setShowOtp(true); // Show OTP field after signup
      } else {
        console.error("Signup failed:", signupData.message);
      }
    } else {
      // Login request
      const loginResponse = await fetch(
        "http://localhost:5001/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const loginData = await loginResponse.json();
      if (loginResponse.ok) {
        console.log("Login successful", loginData);
        onLogin(); // Call the onLogin function after successful login
      } else {
        console.error("Login failed:", loginData.message);
      }
    }
  };

  const handleVerifyOtp = async () => {
    // Verify OTP request
    const otpResponse = await fetch(
      "http://localhost:5001/api/auth/verify-otp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      }
    );

    const otpData = await otpResponse.json();
    if (otpResponse.ok) {
      console.log("OTP verified", otpData);
      onLogin(); // Simulate login on OTP verification
    } else {
      console.error("OTP verification failed:", otpData.message);
    }
  };

  const handleResendOtp = async () => {
    // Resend OTP request
    const resendOtpResponse = await fetch(
      "http://localhost:5001/api/auth/resend-otp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    const resendOtpData = await resendOtpResponse.json();
    if (resendOtpResponse.ok) {
      console.log("OTP resent", resendOtpData);
    } else {
      console.error("Resend OTP failed:", resendOtpData.message);
    }
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
          <input
            type="email"
            placeholder="University email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Repeat password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                required
              />
            </>
          )}

          {isLogin && (
            <>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
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

        {showOtp && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button onClick={handleVerifyOtp}>Verify OTP</button>
            <button onClick={handleResendOtp}>Resend OTP</button>
          </>
        )}
      </div>
      <div className="auth-image-container">
        <img src="../images/carpool3.jpg" alt="illustration" />
      </div>
    </div>
  );
}

export default AuthPage;
