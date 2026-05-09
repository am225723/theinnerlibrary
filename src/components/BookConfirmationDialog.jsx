// Book Confirmation Dialog for The Inner Library

import React from 'react';
import styles from './BookConfirmationDialog.module.css';

export const BookConfirmationDialog = ({ book, onConfirm, onCancel }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.dialogHeader}>
          <div className={styles.bookIcon}>{book.icon}</div>
          <h2 className={styles.dialogTitle}>{book.title}</h2>
          <p className={styles.dialogSubtitle}>{book.subtitle}</p>
        </div>
        
        <div className={styles.dialogBody}>
          <p className={styles.dialogQuestion}>
            Would you like to open this page?
          </p>
        </div>

        <div className={styles.dialogActions}>
          <button 
            className={styles.cancelButton}
            onClick={onCancel}
          >
            Back to Shelf
          </button>
          <button 
            className={styles.confirmButton}
            onClick={onConfirm}
          >
            Open Page
          </button>
        </div>
      </div>
    </div>
  );
};