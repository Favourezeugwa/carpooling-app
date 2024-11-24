import React, { useEffect, useState } from "react";
import CarpoolCard from "./CarpoolCard";
import CustomModal from "../Modals/CustomModal"; // Import your custom modal
import "../styles/carpoolList.css";

const CarpoolInvitations = ({ currentUser }) => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null); // Content to display in the modal
  const [selectedCarpoolId, setSelectedCarpoolId] = useState(null); // Carpool ID for decline confirmation

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const response = await fetch(
          "http://localhost:5001/api/carpool/user-invitations",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch invitations");
        }

        const data = await response.json();
        setInvitations(data.carpools);
      } catch (error) {
        console.error("Error fetching invitations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, []);

  const handleAccept = async (carpoolId, defaultRole) => {
    // Prompt user to accept or modify the default role
    const role = prompt(
      `You were invited as a ${defaultRole}. Enter a role (Rider/Driver) or press Cancel to accept as ${defaultRole}:`,
      defaultRole
    );

    try {
      const response = await fetch(
        `http://localhost:5001/api/carpool/join-carpool/${carpoolId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: role || defaultRole }), // Use the role chosen by the user or the default
        }
      );

      if (response.ok) {
        setModalContent("Invite accepted! The carpool has been added to your carpools.");
        setIsModalOpen(true);
        setInvitations(invitations.filter((invitation) => invitation._id !== carpoolId));
      } else {
        console.error("Failed to accept invitation");
      }
    } catch (error) {
      console.error("Error accepting invitation:", error);
    }
  };

  const confirmDecline = (carpoolId) => {
    setSelectedCarpoolId(carpoolId);
    setModalContent("Are you sure you want to decline this invitation?");
    setIsModalOpen(true);
  };

  const handleDecline = async () => {
    try {
      await fetch(`http://localhost:5001/api/carpool/decline-invite/${selectedCarpoolId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setInvitations(invitations.filter((invitation) => invitation._id !== selectedCarpoolId));
      setIsModalOpen(false);
      setSelectedCarpoolId(null);
    } catch (error) {
      console.error("Error declining invitation:", error);
    }
  };

  if (loading) {
    return <p>Loading invitations...</p>;
  }

  return (
    <div className="carpool-list">
      <h2>Carpool Invitations</h2>

      {invitations.length > 0 ? (
        invitations.map((carpool) => (
          <CarpoolCard
            key={carpool._id}
            carpool={carpool}
            currentUser={currentUser}
            onAccept={() => handleAccept(carpool._id, carpool.invitationRole)}
            onDecline={() => confirmDecline(carpool._id)}
            isInvitation
          />
        ))
      ) : (
        <p>No pending invitations.</p>
      )}

      <CustomModal
        isOpen={isModalOpen}
        title={selectedCarpoolId ? "Confirm Decline" : "Invite Accepted"}
        content={<p>{modalContent}</p>}
        onClose={() => setIsModalOpen(false)}
        actions={
          selectedCarpoolId
            ? [
                { label: "Yes, Decline", onClick: handleDecline, className: "decline-button" },
                { label: "Cancel", onClick: () => setIsModalOpen(false), className: "cancel-button" }
              ]
            : [
                { label: "Close", onClick: () => setIsModalOpen(false), className: "close-button" }
              ]
        }
      />
    </div>
  );
};

export default CarpoolInvitations;
