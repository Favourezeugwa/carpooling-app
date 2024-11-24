import React, { useState } from "react";
import CarpoolCard from "./CarpoolCard";
import CreateCarpoolModal from "./CreateCarpoolModal";
import "../styles/createcarpool.css";

const CreateCarpool = () => {
  const [carpools, setCarpools] = useState([]); // Store the list of carpools
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open/close state
  const [currentCarpool, setCurrentCarpool] = useState(null); // Stores the carpool being edited

  const handleCreateCarpool = (newCarpool) => {
    if (currentCarpool) {
      // Update the existing carpool if editing
      setCarpools(
        carpools.map((carpool) =>
          carpool._id === newCarpool._id ? newCarpool : carpool
        )
      );
    } else {
      // Add a new carpool if creating
      setCarpools([...carpools, newCarpool]);
    }
    setIsModalOpen(false);
    setCurrentCarpool(null); // Reset currentCarpool after creating/editing
  };

  const handleEditCarpool = (carpool) => {
    setCurrentCarpool(carpool); // Set the carpool data to be edited
    setIsModalOpen(true); // Open the modal
  };

  return (
    <div className="create-carpool">
      <h1>Carpools</h1>

      <button className="create-carpool-btn" onClick={() => setIsModalOpen(true)}>
        Create Carpool
      </button>

      <div className="carpool-list">
        {carpools.map((carpool, index) => (
          <CarpoolCard
            key={index}
            carpool={carpool}
            onEdit={() => handleEditCarpool(carpool)}
          />
        ))}
      </div>

      {isModalOpen && (
        <CreateCarpoolModal
          onClose={() => {
            setIsModalOpen(false);
            setCurrentCarpool(null); // Reset if closing without saving
          }}
          onCreateCarpool={handleCreateCarpool}
          initialData={currentCarpool} // Pass currentCarpool data as initialData
        />
      )}
    </div>
  );
};

export default CreateCarpool;
