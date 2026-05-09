// 3D Library Screen for The Inner Library

import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import { BookConfirmationDialog } from '../components/BookConfirmationDialog';
import { BookCoverDesigner } from '../components/BookCoverDesigner';
import styles from './Library3D.module.css';

// Lazy load the 3D scene to avoid blocking initial render
const LibraryScene = React.lazy(() => import('../3d/scenes/LibraryScene'));

export const Library3D = () => {
  const navigate = useNavigate();
  const [selectedBook, setSelectedBook] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDesigner, setShowDesigner] = useState(false);
  const [designerBook, setDesignerBook] = useState(null);
  const [showFallback, setShowFallback] = useState(false);

  // Check WebGL support on mount
  useEffect(() => {
    const checkWebGL = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return false;
        const renderer = gl.getParameter(gl.RENDERER);
        return !!renderer;
      } catch (e) {
        return false;
      }
    };

    if (!checkWebGL()) {
      setShowFallback(true);
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showConfirmation) {
          setShowConfirmation(false);
          setSelectedBook(null);
        } else if (showDesigner) {
          setShowDesigner(false);
          setDesignerBook(null);
        } else {
          navigate('/');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showConfirmation, showDesigner, navigate]);

  // When a book is clicked in the 3D scene, show the confirmation dialog
  const handleBookSelect = useCallback((book) => {
    setSelectedBook(book);
    setShowConfirmation(true);
  }, []);

  // User confirms they want to open the tool
  const handleConfirmOpen = useCallback(() => {
    setShowConfirmation(false);
    if (selectedBook?.path) {
      navigate(selectedBook.path);
    }
  }, [selectedBook, navigate]);

  // User cancels - go back to the shelf
  const handleCancelOpen = useCallback(() => {
    setShowConfirmation(false);
    setSelectedBook(null);
  }, []);

  const handleOpenDesigner = useCallback((book) => {
    setDesignerBook(book);
    setShowDesigner(true);
  }, []);

  const handleCloseDesigner = useCallback(() => {
    setShowDesigner(false);
    setDesignerBook(null);
  }, []);

  const handleToggleView = useCallback(() => {
    navigate('/classic');
  }, [navigate]);

  // Fallback view for no WebGL
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

  // Cover designer overlay
  if (showDesigner && designerBook) {
    return (
      <BookCoverDesigner
        bookId={designerBook.id}
        bookTitle={designerBook.title}
        onClose={handleCloseDesigner}
        onSave={() => setShowDesigner(false)}
      />
    );
  }

  return (
    <div className={styles.library3D} role="main" aria-label="3D Library View">
      {/* Header overlay */}
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
        </div>
      </div>

      {/* 3D Scene with Error Boundary */}
      <div 
        className={styles.sceneContainer} 
        role="region" 
        aria-label="Interactive 3D bookshelf"
      >
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
              <p>Loading 3D Library...</p>
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
          <span className={styles.controlLabel}>Classic View</span>
        </button>
        <button
          className={styles.controlButton}
          onClick={() => handleOpenDesigner(selectedBook || { id: 'daily_checkin', title: "Today's Page" })}
          aria-label="Customize book cover"
        >
          <span className={styles.controlIcon} aria-hidden="true">🎨</span>
          <span className={styles.controlLabel}>Customize</span>
        </button>
      </div>

      {/* Confirmation dialog when a book is selected */}
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