import React, { useState } from "react";
import "../styles/createcarpoolModal.css"; // Import the specific CSS for the modal

const CreateCarpoolModal = ({ onClose, onCreateCarpool }) => {
  const [name, setName] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [invitees, setInvitees] = useState([{ email: "", role: "Rider" }]); // Initial invitees with default role as Rider
  const [carType, setCarType] = useState("Private");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [estimatedCost, setEstimatedCost] = useState(""); // New field for estimated cost

  // Handle changes for invitees
  const handleInviteeChange = (index, field, value) => {
    const updatedInvitees = [...invitees];
    updatedInvitees[index][field] = value;
    setInvitees(updatedInvitees);
  };

  // Add new invitee row
  const handleAddInvitee = () => {
    setInvitees([...invitees, { email: "", role: "Rider" }]); // Add new invitee with default role
  };

  // Remove invitee row
  const handleRemoveInvitee = (index) => {
    const updatedInvitees = invitees.filter((_, i) => i !== index);
    setInvitees(updatedInvitees);
  };

  const handleCreate = () => {
    const newCarpool = {
      name,
      pickupLocation,
      dropoffLocation,
      date,
      time,
      invitees,
      carType,
      notes,
      estimatedCost, // Include estimated cost
      description: `Carpool from ${pickupLocation} to ${dropoffLocation}`,
    };
    onCreateCarpool(newCarpool);
    onClose(); // Close the modal after creation
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Create Carpool</h2>

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

        <label>Invite Friends:</label>
        {invitees.map((invitee, index) => (
          <div key={index} className="invitee-row">
            <input
              type="email"
              placeholder="Friend's Email"
              value={invitee.email}
              onChange={(e) =>
                handleInviteeChange(index, "email", e.target.value)
              }
              required
            />
            <select
              value={invitee.role}
              onChange={(e) =>
                handleInviteeChange(index, "role", e.target.value)
              }
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

        <label>Special Notes:</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional information (e.g., meet-up point)"
        ></textarea>

        <button onClick={handleCreate}>Create Carpool</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default CreateCarpoolModal;
