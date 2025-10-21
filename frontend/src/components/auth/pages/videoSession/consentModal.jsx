import React from 'react';
import './ConsentModal.css'; // see CSS below

export default function ConsentModal({ isOpen, onAccept, onDecline }) {
  console.log('🔍 ConsentModal: Rendering with isOpen:', isOpen);
  
  if (!isOpen) {
    console.log('🔍 ConsentModal: Not rendering (isOpen is false)');
    return null;
  }

  console.log('🔍 ConsentModal: Rendering modal content');

  return (
    <div className="consent-modal-overlay">
      <div className="consent-modal-content">
        <h2>Attention Tracking Consent</h2>
        <p>
          This session includes attention tracking to help improve participation and learning.
          Do you agree to participate in this feature?
        </p>
        <div className="consent-modal-buttons">
          <button onClick={onAccept} className="accept-btn">I Agree</button>
          <button onClick={onDecline} className="decline-btn">No Thanks</button>
        </div>
      </div>
    </div>
  );
}
