// src/components/NavBar.js
import React from "react";
import { Link } from "react-router-dom";
import "../styles/navbar.css"; // Import the CSS

const NavBar = ({ onSignOut }) => {
  return (
    <div className="navbar">
      <h3>Student carpool</h3>
      <ul>
        <li>
          <Link to="/">
            <i className="fas fa-home"></i> Home
          </Link>
        </li>
        <li>
          <Link to="/request-ride">
            <i className="fas fa-car"></i> Request Ride
          </Link>
        </li>
        <li>
          <Link to="/offer-ride">
            <i className="fas fa-car-side"></i> Offer Ride
          </Link>
        </li>
        <li>
          <Link to="/match-rider-driver">
            <i className="fas fa-exchange-alt"></i> Match Rider/Driver
          </Link>
        </li>
        <li>
          <Link to="/carpool-history">
            <i className="fas fa-history"></i> Carpool History
          </Link>
        </li>
        <li>
          <Link to="/notifications">
            <i className="fas fa-bell"></i> Notifications
          </Link>
        </li>
        <li>
          <Link to="/tip-contribute-fare">
            <i className="fas fa-hand-holding-usd"></i> Tip Driver/Contribute
            Fare
          </Link>
        </li>
        <li>
          <Link to="/rate-users">
            <i className="fas fa-star"></i> Rate Users
          </Link>
        </li>
      </ul>

      <hr />

      <ul>
        <li>
          <a href="#" onClick={onSignOut}>
            <i className="fas fa-sign-out-alt"></i> Sign Out
          </a>
        </li>
      </ul>
    </div>
  );
};

export default NavBar;
