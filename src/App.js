// import React from "react";
// import AuthPage from "./components/authpage";
// import "./App.css";

// function App() {
//   return (
//     <div className="App">
//       <AuthPage />
//     </div>
//   );
// }

// export default App;

// src/App.js
import React, { useState } from "react";
import AuthPage from "./components/authpage"; // Adjust the path if needed
import NavBar from "./components/navbar"; // Import NavBar component
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css"; // Your global or App-specific CSS

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Manage login state

  // Handle user login (this can be passed to AuthPage and triggered on successful login)
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // Handle user sign out (this will be passed to NavBar)
  const handleSignOut = () => {
    setIsAuthenticated(false); // Clear the authentication state
  };

  return (
    <Router>
      <div className="App">
        {!isAuthenticated ? (
          // Render AuthPage if the user is not authenticated
          <AuthPage onLogin={handleLogin} />
        ) : (
          // Render the main app with NavBar and routes after login
          <div className="app-container">
            <NavBar onSignOut={handleSignOut} />{" "}
            {/* Pass handleSignOut to NavBar */}
            <div className="main-content">
              <Routes>
                <Route
                  path="/request-ride"
                  element={<div>Request Ride Page</div>}
                />
                <Route
                  path="/offer-ride"
                  element={<div>Offer Ride Page</div>}
                />
                <Route
                  path="/match-rider-driver"
                  element={<div>Match Rider/Driver Page</div>}
                />
                <Route
                  path="/carpool-history"
                  element={<div>Carpool History Page</div>}
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
