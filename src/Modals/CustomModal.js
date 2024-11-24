// customModal.js
import React from "react";
import "../styles/customModal.css"; // New CSS file for the modal

const CustomModal = ({ isOpen, title, content, onClose, actions }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="carpool-card modal-content">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {content}
        </div>
        <div className="modal-footer">
          {actions ? (
            actions.map((action, index) => (
              <button key={index} onClick={action.onClick} className={`action-button ${action.className}`}>
                {action.label}
              </button>
            ))
          ) : (
            <button onClick={onClose} className="action-button close-button">
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
