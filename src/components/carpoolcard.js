import React, { useState } from "react";
import "../styles/carpoolcard.css"; // Import the specific CSS for CarpoolCard

const CarpoolCard = ({ carpool }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="carpool-card" onClick={() => setIsExpanded(!isExpanded)}>
      <h3>{carpool.name}</h3>
      <p>{carpool.description}</p>
      {isExpanded && (
        <div className="carpool-details">
          <p>
            <strong>Pickup:</strong> {carpool.pickupLocation}
          </p>
          <p>
            <strong>Dropoff:</strong> {carpool.dropoffLocation}
          </p>
          <p>
            <strong>Time & Date:</strong> {carpool.date} at {carpool.time}
          </p>
          <p>
            <strong>Car Type:</strong> {carpool.carType}
          </p>
          {carpool.estimatedCost && (
            <p>
              <strong>Estimated Cost per person: $</strong>{" "}
              {carpool.estimatedCost}
            </p>
          )}
          <p>
            <strong>Invitees:</strong>
          </p>
          <ul>
            {carpool.invitees.map((invitee, index) => (
              <li key={index}>
                {invitee.email} - {invitee.role}
              </li>
            ))}
          </ul>
          {carpool.notes && (
            <p>
              <strong>Special Notes:</strong> {carpool.notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CarpoolCard;
