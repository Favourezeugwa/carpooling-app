import React, { useState } from "react";
import CarpoolCard from "./carpoolcard"; // Importing the CarpoolCard component
import CreateCarpoolModal from "./createCarpoolModal"; // Importing the CreateCarpoolModal component
import "../styles/createcarpool.css"; // Import the specific CSS for CreateCarpool

const CreateCarpool = () => {
  const [carpools, setCarpools] = useState([]); // Store the list of carpools
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open/close state

  const handleCreateCarpool = (newCarpool) => {
    setCarpools([...carpools, newCarpool]); // Add new carpool to the list
    setIsModalOpen(false); // Close the modal after creating the carpool
  };

  return (
    <div className="create-carpool">
      <h1>Carpools</h1>

      <button
        className="create-carpool-btn"
        onClick={() => setIsModalOpen(true)}
      >
        Create Carpool
      </button>

      <div className="carpool-list">
        {carpools.map((carpool, index) => (
          <CarpoolCard key={index} carpool={carpool} />
        ))}
      </div>

      {isModalOpen && (
        <CreateCarpoolModal
          onClose={() => setIsModalOpen(false)}
          onCreateCarpool={handleCreateCarpool}
        />
      )}
    </div>
  );
};

export default CreateCarpool;
