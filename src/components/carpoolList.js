import React, { useEffect, useState } from "react";
import CarpoolCard from "./CarpoolCard";
import CustomModal from "../Modals/CustomModal";
import CreateCarpoolModal from "./CreateCarpoolModal";
import "../styles/carpoolList.css";

const CarpoolList = ({ currentUser, isPublicView = false }) => {
  const [carpools, setCarpools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCarpool, setSelectedCarpool] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [actionType, setActionType] = useState(null);

  useEffect(() => {
    const fetchCarpools = async () => {
      try {
        const url = isPublicView
          ? "http://localhost:5001/api/carpool/public-carpools"
          : "http://localhost:5001/api/carpool/show-user-carpools";

        const response = await fetch(url, {
          method: "GET",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (!response.ok) throw new Error("Failed to fetch carpools");
        const data = await response.json();
        setCarpools(data.carpools);
      } catch (error) {
        console.error("Error fetching carpools:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCarpools();
  }, [isPublicView]);

  const openConfirmationModal = (carpool, type) => {
    setSelectedCarpool(carpool);
    setActionType(type);

    const actionMessages = {
      delete: `Are you sure you want to delete the carpool "${carpool.carpoolName}"?`,
      leave: `Are you sure you want to leave the carpool "${carpool.carpoolName}"?`,
      join: `Are you sure you want to join the carpool "${carpool.carpoolName}"?`
    };

    setModalContent(actionMessages[type]);
    setIsModalOpen(type !== "edit");
    setIsEditModalOpen(type === "edit");
  };

  const handleConfirmAction = async () => {
    if (actionType === "leave") await leaveCarpool(selectedCarpool._id);
    else if (actionType === "edit") await editCarpool(selectedCarpool._id);
    else if (actionType === "delete") await deleteCarpool(selectedCarpool._id);
    else if (actionType === "join") await joinCarpool(selectedCarpool._id);
    setIsModalOpen(false);
  };

  const leaveCarpool = async (carpoolId) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/carpool/leave-carpool/${carpoolId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (response.ok) setCarpools(carpools.filter((carpool) => carpool._id !== carpoolId));
      else console.error("Failed to leave carpool");
    } catch (error) {
      console.error("Error leaving carpool:", error);
    }
  };

  const editCarpool = async (updatedDetails) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/carpool/edit-carpool/${selectedCarpool._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(updatedDetails),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setCarpools((prevCarpools) =>
          prevCarpools.map((carpool) =>
            carpool._id === selectedCarpool._id ? { ...carpool, ...data.carpool } : carpool
          )
        );
        setIsEditModalOpen(false);
      } else {
        console.error("Failed to update carpool");
      }
    } catch (error) {
      console.error("Error updating carpool:", error);
    }
  };

  const deleteCarpool = async (carpoolId) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/carpool/delete-carpool/${carpoolId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (response.ok) setCarpools(carpools.filter((carpool) => carpool._id !== carpoolId));
      else console.error("Failed to delete carpool");
    } catch (error) {
      console.error("Error deleting carpool:", error);
    }
  };

  const joinCarpool = async (carpoolId) => {
    const role = prompt(
      `Enter a role (Either Rider or Driver) which you want to join the carpool as:`
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
          body: JSON.stringify({ role: role }),
        }
      );

      if (response.ok) {
        setModalContent("You have joined the carpool successfully!");
        setIsModalOpen(true);
      } else {
        console.error("Failed to join carpool");
      }
    } catch (error) {
      console.error("Error joining carpool:", error);
    }
  };

  if (loading) return <p>Loading carpools...</p>;

  return (
    <div className="carpool-list">
      {isPublicView && (
        <div>
          <h2>Welcome, {currentUser.username}!</h2>
          <p>See available carpools you can join below or create a carpool.</p>
          <button
            className="create-carpool-btn"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create a Carpool
          </button>
        </div>
      )}

      {carpools.length > 0 ? (
        carpools.map((carpool) => {
          const isCreator = currentUser?.userId === carpool.creator;
          const isJoined = !isCreator && carpool.carpoolers?.some(
            (carpooler) => carpooler.user === currentUser?.userId
          );

          return (
            <CarpoolCard
              key={carpool._id}
              carpool={carpool}
              currentUser={currentUser}
              onEdit={isCreator ? () => openConfirmationModal(carpool, "edit") : null}
              onDelete={isCreator ? () => openConfirmationModal(carpool, "delete") : null}
              onJoin={!isCreator && !isJoined && isPublicView ? () => openConfirmationModal(carpool, "join") : null}
              onLeave={!isCreator && isJoined ? () => openConfirmationModal(carpool, "leave") : null}
            />
          );
        })
      ) : (
        <p>No {isPublicView ? "public" : "user"} carpools available.</p>
      )}

      {/* Confirmation Modal */}
      {selectedCarpool && (
        <CustomModal
          isOpen={isModalOpen}
          title={actionType === "delete" ? "Delete Carpool" : actionType === "leave" ? "Leave Carpool" : "Join Carpool"}
          content={modalContent}
          onClose={() => setIsModalOpen(false)}
          actions={[
            {
              label: "Confirm",
              onClick: handleConfirmAction,
              className: actionType === "delete" ? "delete-button" : "leave-button",
            },
            { label: "Cancel", onClick: () => setIsModalOpen(false), className: "cancel-button" },
          ]}
        />
      )}

      {/* Edit Carpool Modal */}
      {isEditModalOpen && (
        <CreateCarpoolModal
          onClose={() => setIsEditModalOpen(false)}
          onCreateCarpool={editCarpool}
          initialData={selectedCarpool}
          currentUserEmail={currentUser.userEmail}
        />
      )}

    </div>
  );
};

export default CarpoolList;
