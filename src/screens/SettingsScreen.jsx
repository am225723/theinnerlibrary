// Settings Screen for The Inner Library
// Contains book customization, account settings, and app preferences

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookCoverDesigner } from '../components/BookCoverDesigner';
import { useAuth } from '../auth/useAuth';
import styles from './SettingsScreen.module.css';

const CORE_BOOKS = [
  { id: 'daily_checkin', title: "Open Today's Page" },
  { id: 'needs_translator', title: 'Reading Between the Lines' },
  { id: 'boundary_scripts', title: 'Dialogue Practice' },
  { id: 'cognitive_reframe', title: 'Rewrite the Page' },
  { id: 'evidence_shelf', title: 'The Evidence Shelf' },
  { id: 'character_notes', title: 'Character Notes' },
  { id: 'younger_self', title: 'Letters to the Younger Self' },
  { id: 'session_prep', title: 'Notes for My Next Chapter' },
];

export const SettingsScreen = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState('customize');
  const [designerBook, setDesignerBook] = useState(null);

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate('/');
  }, [signOut, navigate]);

  // If a book is being customized, show the designer
  if (designerBook) {
    return (
      <BookCoverDesigner
        bookId={designerBook.id}
        bookTitle={designerBook.title}
        onClose={() => setDesignerBook(null)}
        onSave={() => setDesignerBook(null)}
      />
    );
  }

  return (
    <div className={styles.settings}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          ← Library
        </button>
        <h1 className={styles.heading}>Settings</h1>
        <div className={styles.spacer} />
      </div>

      {/* Tab navigation */}
      <div className={styles.tabs}>
        {['customize', 'account', 'about'].map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeSection === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveSection(tab)}
          >
            {tab === 'customize' ? '🎨 Customize' : tab === 'account' ? '👤 Account' : 'ℹ️ About'}
          </button>
        ))}
      </div>

      {/* Customize section */}
      {activeSection === 'customize' && (
        <div className={styles.section}>
          <p className={styles.sectionDesc}>
            Choose a book to customize its cover design, colors, and spine text.
            Your changes will appear on the 3D bookshelf.
          </p>
          <div className={styles.bookGrid}>
            {CORE_BOOKS.map((book) => (
              <button
                key={book.id}
                className={styles.bookCard}
                onClick={() => setDesignerBook(book)}
              >
                <span className={styles.bookEmoji}>📖</span>
                <span className={styles.bookTitle}>{book.title}</span>
                <span className={styles.bookAction}>Customize →</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Account section */}
      {activeSection === 'account' && (
        <div className={styles.section}>
          {user ? (
            <>
              <div className={styles.userInfo}>
                <div className={styles.avatar}>
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className={styles.userDetails}>
                  <p className={styles.userEmail}>{user.email}</p>
                  <p className={styles.userRole}>
                    {user.role === 'admin' ? '🩺 Therapist' : '👤 Client'}
                  </p>
                </div>
              </div>
              <button className={styles.signOutBtn} onClick={handleSignOut}>
                Sign Out
              </button>
              {user.role === 'admin' && (
                <button
                  className={styles.adminBtn}
                  onClick={() => navigate('/admin')}
                >
                  🩺 Therapist Dashboard
                </button>
              )}
            </>
          ) : (
            <div className={styles.notLoggedIn}>
              <p className={styles.notLoggedInText}>
                Sign in to save your progress across devices and access your library from anywhere.
              </p>
              <button
                className={styles.signInBtn}
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      )}

      {/* About section */}
      {activeSection === 'about' && (
        <div className={styles.section}>
          <div className={styles.aboutCard}>
            <h2 className={styles.aboutTitle}>The Inner Library</h2>
            <p className={styles.aboutVersion}>Version 1.0</p>
            <p className={styles.aboutDesc}>
              A therapeutic journaling app designed to help you explore your inner world
              through the metaphor of a personal library. Each book on your shelf represents
              a different tool for self-reflection, growth, and healing.
            </p>
            <p className={styles.aboutNote}>
              This is a safe space. Your entries are stored locally on your device
              and are never shared without your permission.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
