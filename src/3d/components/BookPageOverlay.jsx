// BookPageOverlay.jsx - Displays content on the open book pages
// This component shows messages and buttons directly on the book when it's open

import React, { useState, useEffect, useRef } from 'react';
import styles from './BookPageOverlay.module.css';

export const BookPageOverlay = ({ book, visible, onOpenPage, onReturnToShelf }) => {
  const overlayRef = useRef(null);
  const [opacity, setOpacity] = useState(0);

  // Track visibility
  useEffect(() => {
    if (!visible) {
      setOpacity(0);
      return;
    }

    // Fade in
    const fadeIn = setTimeout(() => setOpacity(1), 100);

    return () => {
      clearTimeout(fadeIn);
    };
  }, [visible]);

  if (!visible || !book) return null;

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      style={{
        opacity,
      }}
    >
      {/* Book page container */}
      <div className={styles.pageContainer}>
        {/* Left page - decorative */}
        <div className={styles.pageLeft}>
          <div className={styles.pageDecoration}>
            <div className={`${styles.corner} ${styles.topLeft}`} />
            <div className={`${styles.corner} ${styles.topRight}`} />
            <div className={`${styles.corner} ${styles.bottomLeft}`} />
            <div className={`${styles.corner} ${styles.bottomRight}`} />
            <div className={styles.spineLine} />
          </div>
        </div>

        {/* Right page - content */}
        <div className={styles.pageRight}>
          <div className={styles.pageContent}>
            {/* Book icon */}
            <div className={styles.bookIcon}>{book.icon}</div>

            {/* Title */}
            <h2 className={styles.title}>{book.title}</h2>

            {/* Subtitle/description */}
            <p className={styles.subtitle}>{book.subtitle}</p>

            {/* Special message for Letters to Younger Self */}
            {book.id === 'younger_self' && (
              <p className={styles.specialMessage}>
                Letters to the Younger Self Offer reassurance to younger parts who need care.
              </p>
            )}

            {/* Question */}
            <p className={styles.question}>
              Would you like to open this page?
            </p>

            {/* Action buttons */}
            <div className={styles.buttonGroup}>
              <button
                className={styles.returnButton}
                onClick={onReturnToShelf}
                aria-label="Return book to shelf"
              >
                ← Return to Shelf
              </button>
              <button
                className={styles.openButton}
                onClick={onOpenPage}
                aria-label={`Open ${book.title}`}
              >
                Open Page →
              </button>
            </div>
          </div>

          {/* Page decorations */}
          <div className={styles.pageDecoration}>
            <div className={`${styles.corner} ${styles.topLeft}`} />
            <div className={`${styles.corner} ${styles.topRight}`} />
            <div className={`${styles.corner} ${styles.bottomLeft}`} />
            <div className={`${styles.corner} ${styles.bottomRight}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookPageOverlay;