// 3D Library Screen for The Inner Library

import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import styles from './Library3D.module.css';

const LibraryScene = React.lazy(() => import('../3d/scenes/LibraryScene'));

export const Library3D = () => {
  const navigate = useNavigate();
  const [returnToShelfId, setReturnToShelfId] = useState(null);
  const [openBookId, setOpenBookId] = useState(null);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const checkWebGL = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return false;
        return !!gl.getParameter(gl.RENDERER);
      } catch (e) {
        return false;
      }
    };
    if (!checkWebGL()) setShowFallback(true);
  }, []);

  // Navigate to the tool page – called when user clicks right side of open book
  const handleOpenPage = useCallback((book) => {
    if (book?.path) {
      navigate(book.path);
    }
  }, [navigate]);

  // Return book to shelf with animation – called when user clicks left side of open book
  const handleReturnToShelf = useCallback((bookId) => {
    setReturnToShelfId(bookId);
    // Clear the return trigger after animation completes
    setTimeout(() => {
      setReturnToShelfId(null);
    }, 800);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && openBookId) {
        handleReturnToShelf(openBookId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openBookId, handleReturnToShelf]);

  // Called when book is selected (clicked on shelf) - track for Escape key
  const handleBookSelect = useCallback((book) => {
    setOpenBookId(book.id);
  }, []);

  // Called when book has returned to shelf in the 3D scene
  const handleBookReturn = useCallback((bookId) => {
    setOpenBookId(null);
  }, []);

  const handleToggleView = useCallback(() => {
    navigate('/classic');
  }, [navigate]);

  if (showFallback) {
    return (
      <div className={styles.fallback}>
        <div className={styles.fallbackContent}>
          <h2 className={styles.fallbackTitle}>📚 Your Library</h2>
          <p className={styles.fallbackText}>
            Your device doesn't support 3D graphics. Using the classic view instead.
          </p>
          <button className={styles.fallbackButton} onClick={handleToggleView}>
            Go to Classic View
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.library3D} role="main" aria-label="3D Library View">
      {/* Header overlay with settings */}
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <button
            className={styles.backButton}
            onClick={handleToggleView}
            aria-label="Back to classic view"
          >
            ←
          </button>
          <div className={styles.libraryBadge} aria-hidden="true">
            <span className={styles.libraryIcon}>📚</span>
          </div>
          <div>
            <h1 className={styles.title}>The Inner Library</h1>
            <p className={styles.subtitle}>Welcome back. Your shelves are waiting.</p>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.settingsButton}
              onClick={() => navigate('/settings')}
              aria-label="Settings"
            >
              ⚙️
            </button>
          </div>
        </div>
      </div>

      {/* 3D Scene */}
      <div className={styles.sceneContainer} role="region" aria-label="Interactive 3D bookshelf">
        <ErrorBoundary fallback={(error) => (
          <div className={styles.errorState}>
            <h3>3D Scene Error</h3>
            <p>{error?.message || 'Failed to load 3D scene'}</p>
            <button className={styles.fallbackButton} onClick={handleToggleView}>
              Go to Classic View
            </button>
          </div>
        )}>
          <Suspense fallback={
            <div className={styles.loadingOverlay}>
              <div className={styles.loadingSpinner} />
              <p>Loading your library...</p>
            </div>
          }>
            <LibraryScene
              onBookSelect={handleBookSelect}
              onBookOpen={handleOpenPage}
              onBookReturn={handleBookReturn}
              returnToShelfId={returnToShelfId}
            />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
};
