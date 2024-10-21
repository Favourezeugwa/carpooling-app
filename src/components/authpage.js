import React, { useState } from "react";
import "../styles/auth.css"; // Assuming your CSS file is named auth.css

function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(false); // Switch between login and signup
  const [isForgotPassword, setIsForgotPassword] = useState(false); // Toggle forgot password view
  const [isResetPassword, setIsResetPassword] = useState(false); // Toggle reset password view
  const [email, setEmail] = useState(""); // Email input
  const [username, setUsername] = useState(""); // Username input (signup only)
  const [password, setPassword] = useState(""); // Password input
  const [repeatPassword, setRepeatPassword] = useState(""); // Repeat password (signup only)
  const [newPassword, setNewPassword] = useState(""); // New password for reset
  const [otp, setOtp] = useState(""); // OTP input
  const [showOtp, setShowOtp] = useState(false); // Show OTP input

  // State for notifications
  const [statusMessage, setStatusMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setShowOtp(false); // Hide OTP field on toggle
    setStatusMessage(null); // Reset the message
  };

  const handleForgotPasswordToggle = () => {
    setIsForgotPassword(true);
    setIsLogin(false);
    setStatusMessage(null); // Reset the message
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && !isForgotPassword) {
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
        setStatusMessage("Signup successful. Please verify your email.");
        setIsError(false);
        setShowOtp(true); // Show OTP field after signup
      } else {
        setStatusMessage(`Signup failed: ${signupData.message}`);
        setIsError(true);
      }
    } else if (isLogin) {
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
        setStatusMessage("Login successful!");
        setIsError(false);
        onLogin(); // Call the onLogin function after successful login
      } else {
        setStatusMessage(`Login failed: ${loginData.message}`);
        setIsError(true);
      }
    } else if (isForgotPassword) {
      // Forgot password request
      const forgotPasswordResponse = await fetch(
        "http://localhost:5001/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const forgotPasswordData = await forgotPasswordResponse.json();
      if (forgotPasswordResponse.ok) {
        setStatusMessage("Password reset link sent to your email.");
        setIsError(false);
        setIsForgotPassword(false);
        setIsResetPassword(true); // Proceed to reset password view
      } else {
        setStatusMessage(
          `Failed to send reset link: ${forgotPasswordData.message}`
        );
        setIsError(true);
      }
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const resetPasswordResponse = await fetch(
      `http://localhost:5001/api/auth/reset-password/${otp}?email=${email}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword }),
      }
    );

    const resetPasswordData = await resetPasswordResponse.json();
    if (resetPasswordResponse.ok) {
      setStatusMessage("Password reset successful. Please log in.");
      setIsError(false);
      setIsResetPassword(false);
      setIsLogin(true); // After resetting password, redirect to login
    } else {
      setStatusMessage(`Password reset failed: ${resetPasswordData.message}`);
      setIsError(true);
    }
  };

  const handleResendOtp = async () => {
    // Resend OTP request to the correct route
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
      setStatusMessage("A new OTP has been sent to your email.");
      setIsError(false);
    } else {
      setStatusMessage(`Resend OTP failed: ${resendOtpData.message}`);
      setIsError(true);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-logo">
          <h2>Student Carpooling Service</h2>
        </div>

        {/* Notification Message */}
        {statusMessage && (
          <p className={`status-message ${isError ? "error" : "success"}`}>
            {statusMessage}
          </p>
        )}

        {!isForgotPassword && !isResetPassword ? (
          <>
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
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              )}
              <button type="submit">{isLogin ? "Sign in" : "Sign up"}</button>
            </form>

            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <span onClick={handleToggle} className="toggle-auth">
                {isLogin ? "Sign up" : "Sign in"}
              </span>
            </p>
            {isLogin && (
              <p>
                Forgot your password?{" "}
                <span
                  onClick={handleForgotPasswordToggle}
                  className="toggle-auth"
                >
                  Reset it here
                </span>
              </p>
            )}
          </>
        ) : isForgotPassword ? (
          <>
            <h1>Forgot Password</h1>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="University email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">Send Reset Link</button>
            </form>
          </>
        ) : (
          <>
            <h1>Reset Password</h1>
            <form onSubmit={handleResetPassword}>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button type="submit">Reset Password</button>
            </form>
            <p>
              Didn’t receive the OTP?{" "}
              <span onClick={handleResendOtp} className="resend-otp">
                Resend OTP
              </span>
            </p>
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
