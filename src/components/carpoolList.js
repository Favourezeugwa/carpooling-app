// import React, { useEffect, useState } from "react";
// import CarpoolCard from "./carpoolcard"; // Import the CarpoolCard component
// import "../styles/carpoollist.css"; // Import your CSS for the carpool list

// const CarpoolList = ({ currentUser }) => {
//   const [carpools, setCarpools] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Fetch carpools from the backend API
//   useEffect(() => {
//     const fetchCarpools = async () => {
//       try {
//         const response = await fetch("http://localhost:5001/api/carpools"); // Adjust the endpoint as needed
//         if (!response.ok) {
//           throw new Error("Failed to fetch carpools");
//         }
//         const data = await response.json();
//         setCarpools(data); // Assuming the response is an array of carpools
//       } catch (error) {
//         console.error("Error fetching carpools:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCarpools();
//   }, []);

//   const handleEdit = (carpool) => {
//     console.log("Edit carpool:", carpool);
//     // Implement your edit logic here
//   };

//   const handleDelete = (carpool) => {
//     console.log("Delete carpool:", carpool);
//     // Implement your delete logic here
//   };

//   if (loading) {
//     return <p>Loading carpools...</p>; // Show a loading message while fetching
//   }

//   return (
//     <div className="carpool-list">
//       {carpools.length > 0 ? (
//         carpools.map((carpool) => (
//           <CarpoolCard
//             key={carpool.id} // Assuming each carpool has a unique ID
//             carpool={carpool}
//             currentUser={currentUser}
//             onEdit={handleEdit}
//             onDelete={handleDelete}
//           />
//         ))
//       ) : (
//         <p>No carpools available.</p> // Message when no carpools are found
//       )}
//     </div>
//   );
// };

// export default CarpoolList;
