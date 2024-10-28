import React, { useState } from "react";
import "../styles/carpoolcard.css"; // Import the specific CSS for CarpoolCard

const CarpoolCard = ({ carpool, currentUser, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = (e) => {
    e.stopPropagation(); // Prevent card expansion on menu click
    setShowMenu(!showMenu);
  };

  const handleAction = (action) => {
    if (action === "edit") onEdit(carpool);
    if (action === "delete") onDelete(carpool);
    setShowMenu(false);
  };

  const isCreator = currentUser === carpool.creator; // Check if current user is the creator

  return (
    <div className="carpool-card" onClick={() => setIsExpanded(!isExpanded)}>
      <h3>{carpool.name}</h3>
      <p>{carpool.description}</p>

      {/* Three-dot menu for Edit and Delete */}
      {isCreator && (
        <div className="menu-icon" onClick={toggleMenu}>
          &#x22EE;
          {showMenu && (
            <div className="menu-dropdown">
              <button onClick={() => handleAction("edit")}>Edit Carpool</button>
              <button onClick={() => handleAction("delete")}>Delete Carpool</button>
            </div>
          )}
        </div>
      )}

      {/* Expanded content */}
      {isExpanded && (
        <div className="carpool-details">
          <p><strong>Pickup Location:</strong> {carpool.pickupLocation}</p>
          <p><strong>Dropoff Location:</strong> {carpool.dropoffLocation}</p>
          <p><strong>Your Role:</strong> {carpool.userRole}</p>
          <p><strong>Time & Date:</strong> {carpool.date} at {carpool.time}</p>
          <p><strong>Car Type:</strong> {carpool.carType}</p>
          <p><strong>Carpool Type:</strong> {carpool.isPublic ? "Public" : "Private"}</p>
          <p><strong>Maximum Carpoolers per Car:</strong> {carpool.maxCarpoolers}</p>
          {carpool.estimatedCost && (
            <p><strong>Estimated Cost:</strong> ${carpool.estimatedCost}</p>
          )}
          <p><strong>Invitees:</strong></p>
          <ul>
            {carpool.invitees.map((invitee, index) => (
              <li key={index}>{invitee.email} - {invitee.role}</li>
            ))}
          </ul>
          {carpool.notes && (
            <p><strong>Special Notes:</strong> {carpool.notes}</p>
          )}
        </div>
      )}

      {/* See More/See Less button */}
      <button
        className="toggle-button"
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
      >
        {isExpanded ? "See Less" : "See More"}
      </button>
    </div>
  );
};

export default CarpoolCard;

