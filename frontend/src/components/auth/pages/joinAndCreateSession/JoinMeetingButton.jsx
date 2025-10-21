import React from 'react';
import styles from'./JoinMeetingButton.module.css';

const JoinMeetingButton = ({ label = "Join Meeting", onClick }) => {
  return (
    <button className={styles.joinMeetingButton} onClick={onClick}>
      {label}
    </button>
  );
};

export default JoinMeetingButton;