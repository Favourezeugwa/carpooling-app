import React, { useEffect, useState } from "react";
import CarpoolCard from "./carpoolcard"; // Import CarpoolCard
import "../styles/carpoolList.css"; // Import your styles

const CarpoolList = ({ currentUser }) => {
  const [carpools, setCarpools] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's carpools
  useEffect(() => {
    const fetchCarpools = async () => {
      try {
        const response = await fetch(
          "http://localhost:5001/api/carpool/show-user-carpools",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, // Send the token with the request
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch carpools");
        }

        const data = await response.json();
        setCarpools(data.carpools); // Assuming the response contains carpools in this structure
      } catch (error) {
        console.error("Error fetching carpools:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCarpools();
  }, []);

  const handleEdit = (carpool) => {
    console.log("Edit carpool:", carpool);
    // Implement your edit logic here
  };

  const handleDelete = (carpool) => {
    console.log("Delete carpool:", carpool);
    // Implement your delete logic here
  };

  if (loading) {
    return <p>Loading carpools...</p>; // Show loading message
  }

  return (
    <div className="carpool-list">
      {carpools.length > 0 ? (
        carpools.map((carpool) => (
          <CarpoolCard
            key={carpool._id} // Ensure you use a unique identifier
            carpool={carpool}
            currentUser={currentUser}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))
      ) : (
        <p>No carpools available.</p> // Message when no carpools are found
      )}
    </div>
  );
};

export default CarpoolList;
