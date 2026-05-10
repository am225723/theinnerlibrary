// 3D Library Screen for The Inner Library

import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import { BookConfirmationDialog } from '../components/BookConfirmationDialog';
import styles from './Library3D.module.css';

const LibraryScene = React.lazy(() => import('../3d/scenes/LibraryScene'));

export const Library3D = () => {
  const navigate = useNavigate();
  const [selectedBook, setSelectedBook] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showConfirmation) {
          setShowConfirmation(false);
          setSelectedBook(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showConfirmation]);

  const handleBookSelect = useCallback((book) => {
    setSelectedBook(book);
    setShowConfirmation(true);
  }, []);

  const handleConfirmOpen = useCallback(() => {
    setShowConfirmation(false);
    if (selectedBook?.path) {
      navigate(selectedBook.path);
    }
  }, [selectedBook, navigate]);

  const handleCancelOpen = useCallback(() => {
    setShowConfirmation(false);
    setSelectedBook(null);
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
            <LibraryScene onBookSelect={handleBookSelect} />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Bottom controls */}
      <div className={styles.controls} role="navigation" aria-label="Library controls">
        <button className={styles.controlButton} onClick={handleToggleView} aria-label="Switch to classic view">
          <span className={styles.controlIcon} aria-hidden="true">📱</span>
          <span className={styles.controlLabel}>Classic</span>
        </button>
        <button
          className={styles.controlButton}
          onClick={() => navigate('/settings')}
          aria-label="Settings and customization"
        >
          <span className={styles.controlIcon} aria-hidden="true">⚙️</span>
          <span className={styles.controlLabel}>Settings</span>
        </button>
        <button
          className={styles.controlButton}
          onClick={() => navigate('/my-library')}
          aria-label="View my saved pages"
        >
          <span className={styles.controlIcon} aria-hidden="true">📑</span>
          <span className={styles.controlLabel}>My Pages</span>
        </button>
      </div>

      {/* Confirmation dialog */}
      {showConfirmation && selectedBook && (
        <BookConfirmationDialog
          book={selectedBook}
          onConfirm={handleConfirmOpen}
          onCancel={handleCancelOpen}
        />
      )}
    </div>
  );
};
