import React, { useState, useEffect } from "react";
import "../styles/createcarpoolModal.css";
import CustomModal from "../Modals/CustomModal";

const CreateCarpoolModal = ({ onClose, onCreateCarpool, initialData, currentUserEmail }) => {
  const [name, setName] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [invitees, setInvitees] = useState([{ email: "", role: "Rider" }]);
  const [userRole, setUserRole] = useState("Rider");
  const [maxCarpoolers, setMaxCarpoolers] = useState(4);
  const [isPublic, setIsPublic] = useState(false);
  const [carType, setCarType] = useState("Private");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Populate form with initial data when editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.carpoolName || "");
      setPickupLocation(initialData.pickupLocation || "");
      setDropoffLocation(initialData.dropoffLocation || "");
      setInvitees(initialData.invitations || [{ email: "", role: "Rider" }]);
      setUserRole(initialData.role || "Rider");
      setMaxCarpoolers(initialData.maxCarpoolers || 4);
      setIsPublic(initialData.isPublic || false);
      setCarType(initialData.carType || "Private");
      const [initialDate, initialTime] = initialData.dateTime
        ? initialData.dateTime.split("T")
        : ["", ""];
      setDate(initialDate);
      setTime(initialTime.split(":").slice(0, 2).join(":"));
      setNotes(initialData.specialNotes || "");
      setEstimatedCost(initialData.estimatedCost || "");
    }
  }, [initialData]);

  // Validate invitee email
  const validateInviteeEmail = (email) => {
    if (email === currentUserEmail) {
      triggerErrorModal("You cannot invite yourself.");
      return false;
    }
    if (!email.endsWith("@pvamu.edu")) {
      triggerErrorModal("Only @pvamu.edu emails can be invited.");
      return false;
    }
    return true;
  };

  // Open error modal with a specific message
  const triggerErrorModal = (message) => {
    setErrorMessage(message);
    setErrorModalOpen(true);
  };

  const handleInviteeChange = (index, field, value) => {
    const updatedInvitees = [...invitees];
    updatedInvitees[index][field] = value;
    setInvitees(updatedInvitees);
  };

  const handleAddInvitee = () => {
    setInvitees([...invitees, { email: "", role: "Rider" }]);
  };

  const handleRemoveInvitee = (index) => {
    const updatedInvitees = invitees.filter((_, i) => i !== index);
    setInvitees(updatedInvitees);
  };

   // Trigger email validation only when the input loses focus
  const handleEmailBlur = (email) => {
    if (email && !validateInviteeEmail(email)) {
      const updatedInvitees = invitees.map((invitee) =>
        invitee.email === email ? { ...invitee, email: "" } : invitee
      );
      setInvitees(updatedInvitees);
    }
  };

  const handleCreate = async () => {
    const validInvitees = invitees.filter(({ email }) => validateInviteeEmail(email));
    if (errorMessage) return;

    const newCarpool = {
      carpoolName: name,
      pickupLocation,
      dropoffLocation,
      dateTime: `${date}T${time}`,
      role: userRole,
      carType,
      maxCarpoolers,
      isPublic,
      estimatedCost,
      specialNotes: notes,
      invitations: validInvitees,
    };

    try {
      const response = await fetch(
        initialData
          ? `http://localhost:5001/api/carpool/edit-carpool/${initialData._id}`
          : "http://localhost:5001/api/carpool/create-carpool",
        {
          method: initialData ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(newCarpool),
        }
      );

      if (response.ok) {
        const data = await response.json();
        onCreateCarpool(data.carpool);
        onClose();
      } else {
        const errorData = await response.json();
        triggerErrorModal(errorData.message || "Failed to save carpool. Please try again.");
      }
    } catch (error) {
      triggerErrorModal("Failed to save carpool. Please try again.");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-content">
          <h2>{initialData ? "Edit Carpool" : "Create Carpool"}</h2>
          <label>Carpool Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Pickup Location:</label>
          <input
            type="text"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            required
          />

          <label>Dropoff Location:</label>
          <input
            type="text"
            value={dropoffLocation}
            onChange={(e) => setDropoffLocation(e.target.value)}
            required
          />

          <label>Your Role in this Carpool:</label>
          <select value={userRole} onChange={(e) => setUserRole(e.target.value)}>
            <option value="Rider">Rider</option>
            <option value="Driver">Driver</option>
          </select>

          <label>Invite Friends:</label>
          {invitees.map((invitee, index) => (
            <div key={index} className="invitee-row">
              <input
                type="email"
                placeholder="Friend's Email"
                value={invitee.email}
                onChange={(e) => handleInviteeChange(index, "email", e.target.value)}
                onBlur={() => handleEmailBlur(invitee.email)}
                required
              />
              <select
                value={invitee.role}
                onChange={(e) => handleInviteeChange(index, "role", e.target.value)}
              >
                <option value="Rider">Rider</option>
                <option value="Driver">Driver</option>
              </select>
              <button
                type="button"
                className="remove-btn"
                onClick={() => handleRemoveInvitee(index)}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={handleAddInvitee}>
            + Add Friend
          </button>

          <label>Car Type:</label>
          <select value={carType} onChange={(e) => setCarType(e.target.value)}>
            <option value="Private">Private</option>
            <option value="Rental">Rental</option>
          </select>

          <label>Maximum Carpoolers per Car:</label>
          <input
            type="number"
            value={maxCarpoolers}
            onChange={(e) => setMaxCarpoolers(e.target.value)}
            min="1"
            required
          />

          <label>Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <label>Time:</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />

          <label>Estimated Cost (optional):</label>
          <input
            type="text"
            value={estimatedCost}
            onChange={(e) => setEstimatedCost(e.target.value)}
            placeholder="E.g., $20 per person"
          />

          <div className="radio-row">
            <label>
              <input
                type="radio"
                name="carpoolType"
                value="Public"
                checked={isPublic}
                onChange={() => setIsPublic(true)}
              />
              Make Public
            </label>
            <label>
              <input
                type="radio"
                name="carpoolType"
                value="Private"
                checked={!isPublic}
                onChange={() => setIsPublic(false)}
              />
              Make Private
            </label>
          </div>

          <label>Special Notes:</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional information (e.g., meet-up point)"
          ></textarea>
        </div>
        <div className="modal-actions">
          <button onClick={handleCreate}>{initialData ? "Save Changes" : "Create Carpool"}</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>

      {/* Custom Modal for error messages */}
      {errorModalOpen && (
        <CustomModal
          isOpen={errorModalOpen}
          title="Error"
          content={<p>{errorMessage}</p>}
          onClose={() => setErrorModalOpen(false)}
          actions={[{ label: "Close", onClick: () => setErrorModalOpen(false), className: "close-button" }]}
        />
      )}
    </div>
  );
};

export default CreateCarpoolModal;
