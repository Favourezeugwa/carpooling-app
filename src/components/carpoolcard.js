import React, { useState } from "react";
import "../styles/carpoolcard.css";

const CarpoolCard = ({
  carpool,
  currentUser,
  onEdit,
  onDelete,
  onLeave,
  onJoin,
  onAccept,
  onDecline,
  isInvitation
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Toggle menu for options
  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  // Handle actions based on the button clicked
  const handleAction = (action) => {
    if (action === "edit") onEdit?.(carpool);
    if (action === "leave") onLeave?.(carpool);
    if (action === "delete") onDelete?.(carpool);
    if (action === "join") onJoin?.(carpool);
    setShowMenu(false);
  };

  // Check if the current user is the creator of the carpool
  const isCreator = currentUser?.userId === carpool.creator?._id || carpool.creator === currentUser?.userId;
  
  const isJoined = !isCreator && carpool.carpoolers?.some(
    (carpooler) => carpooler.user === currentUser?.userId
  );

  const description = `Trip from ${carpool.pickupLocation} to ${carpool.dropoffLocation}`;

  // Find the current user's role in the carpoolers array
  const userCarpoolRole = carpool.carpoolers?.find(
    (carpooler) => carpooler.user === currentUser?.userId
  )?.role || "Not specified";

  // Format the date and time
  const formattedDate = new Date(carpool.dateTime).toLocaleDateString();
  const formattedTime = new Date(carpool.dateTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="carpool-card" onClick={() => setIsExpanded(!isExpanded)}>
      <h3>{carpool.carpoolName || "Carpool Name Not Available"}</h3>
      <p>{description || "No description available."}</p>

      {/* Conditional menu for creator or invitee or public carpool */}
      {showMenu && (
        <div className="menu-dropdown">
          {isCreator && (
            <>
              <button onClick={() => handleAction("edit")}>Edit Carpool</button>
              <button onClick={() => handleAction("delete")}>Delete Carpool</button>
            </>
          )}
          {!isCreator && isJoined && (
            <button onClick={() => handleAction("leave")}>Leave Carpool</button>
          )}
          {!isCreator && !isJoined && (
            <button onClick={() => handleAction("join")}>Join Carpool</button>
          )}
        </div>
      )}

      {/* Three-dot menu icon*/}
      {!isInvitation && (
        <div className="menu-icon" onClick={toggleMenu}>
          &#x22EE;
        </div>
      )}

      {/* Expanded content */}
      {isExpanded && (
        <div className="carpool-details">
          <p><strong>Pickup Location:</strong> {carpool.pickupLocation || "Not specified"}</p>
          <p><strong>Dropoff Location:</strong> {carpool.dropoffLocation || "Not specified"}</p>
          <p><strong>Your Role:</strong> {userCarpoolRole}</p>
          <p><strong>Time & Date:</strong> {formattedDate} at {formattedTime}</p>
          <p><strong>Car Type:</strong> {carpool.carType || "Not specified"}</p>
          <p><strong>Carpool Type:</strong> {carpool.isPublic ? "Public" : "Private"}</p>
          <p><strong>Maximum Carpoolers per Car:</strong> {carpool.maxCarpoolers || "Not specified"}</p>
          {carpool.estimatedCost && (
            <p><strong>Estimated Cost:</strong> ${carpool.estimatedCost}</p>
          )}
          <p><strong>Invitees:</strong></p>
          <ul>
            {carpool.invitations && carpool.invitations.length > 0 ? (
              carpool.invitations.map((invitee, index) => (
                <li key={index}>{invitee.email} - {invitee.role}</li>
              ))
            ) : (
              <li>No invitees added.</li>
            )}
          </ul>
          {carpool.notes && (
            <p><strong>Special Notes:</strong> {carpool.notes || "No special notes."}</p>
          )}
        </div>
      )}

      {/* Invitation actions for accept and decline */}
      {isInvitation ? (
        <div className="invitation-actions">
          <button onClick={() => onAccept(carpool)} className="accept-button">Accept</button>
          <button onClick={() => onDecline(carpool)} className="decline-button">Decline</button>
        </div>
      ) : (
        <button
          className="toggle-button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? "See Less" : "See More"}
        </button>
      )}
    </div>
  );
};

export default CarpoolCard;
