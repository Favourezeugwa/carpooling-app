import React, { useState } from "react";
import AuthPage from "./components/authpage"; // Adjust the path if needed
import NavBar from "./components/navbar"; // Import NavBar component
import CreateCarpool from "./components/CreateCarpool"; // Import CreateCarpool component
import CarpoolList from "./components/CarpoolList"; // Import CarpoolList component
import CarpoolInvitations from "./components/CarpoolInvitations";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css"; // Your global or App-specific CSS
import { removeToken } from "./utils/auth";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Manage login state
  const [username, setUsername] = useState(""); // Store the username of the logged-in user
  const [userId, setUserId] = useState(""); // Store the user ID of the logged-in user
  const [userEmail, setUserEmail] = useState(""); // Store the user ID of the logged-in user

  // Handle login by setting authentication and saving the username
  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setUsername(user.username); // Save the username from the user object
    setUserId(user._id); // Save the user ID from the user object
    setUserEmail(user.email); // Save the user ID from the user object
  };

  const handleSignOut = () => {
    setIsAuthenticated(false); // Clear the authentication state
    setUsername(""); // Clear the username
    setUserId(""); // Clear the user ID
    setUserEmail(""); // Clear the user ID
    removeToken(); // Optionally clear token on logout
  };

  return (
    <Router>
      <div className="App">
        {!isAuthenticated ? (
          // Render AuthPage if the user is not authenticated
          <AuthPage onLogin={handleLogin} /> // Pass handleLogin to AuthPage
        ) : (
          // Render the main app with NavBar and routes after login
          <div className="app-container">
            <NavBar onSignOut={handleSignOut} username={username} />{" "}
            {/* Pass handleSignOut and username to NavBar */}
            <div className="main-content">
              <Routes>
              <Route
                  path="/"
                  element={<CarpoolList currentUser={{ userId, username, userEmail }} isPublicView={true} />} // Display public carpools on homepage
                />
                <Route
                  path="/request-ride"
                  element={<div>Request Ride Page</div>}
                />
                <Route
                  path="/offer-ride"
                  element={<div>Offer Ride Page</div>}
                />
                <Route path="/create-carpool" element={<CreateCarpool />} />
                <Route
                  path="/carpool-invitations"
                  element={<CarpoolInvitations currentUser={username} />} // Display user's carpools
                />
                <Route
                  path="/my-carpools"
                  element={<CarpoolList currentUser={{ userId, username, userEmail }} />} // Display user's carpools
                />
                <Route
                  path="/notifications"
                  element={<div>Notifications Page</div>}
                />
                <Route
                  path="/tip-contribute-fare"
                  element={<div>Tip/Contribute Fare Page</div>}
                />
                <Route
                  path="/rate-users"
                  element={<div>Rate Users Page</div>}
                />
              </Routes>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
