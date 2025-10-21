import React from 'react';
import Modal from '@/components/ui/Modal';

const ConsentModal = ({ isOpen, onAccept, onDecline }) => {
  return (
    <Modal isOpen={isOpen} onClose={onDecline} title="Attention Tracking Consent" size="md">
      <div className="space-y-4">
        <p className="text-gray-700">
          <strong>Why do we need your camera?</strong>
          <br />
          To help you and your instructor stay engaged, we use your camera to analyze your attention and facial expressions <strong>in real time</strong> during video sessions.
        </p>
        <ul className="list-disc pl-6 text-gray-600 text-sm">
          <li>We <strong>never</strong> store your raw camera image or video.</li>
          <li>We extract face features (embeddings) in memory, encrypt them, and store them only for engagement analytics.</li>
          <li>You can delete your face data anytime from your settings.</li>
          <li>Attention tracking is <strong>mandatory</strong> for all participants in this session.</li>
          <li>We comply with privacy laws (GDPR, CCPA).</li>
        </ul>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end mt-6">
          <button
            className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            onClick={onAccept}
          >
            I Agree
          </button>
          <button
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            onClick={onDecline}
          >
            Decline
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConsentModal; 