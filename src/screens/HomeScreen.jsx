import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomeScreen.module.css';
import { getSettings, saveSettings } from '../utils/storage';
import { CrisisBanner } from '../components/SharedComponents';

const books = [
  {
    id: 'daily_checkin',
    path: '/open-todays-page',
    title: "Open Today's Page",
    subtitle: 'A gentle check-in for what feels present.',
    spineLabel: "Today's\nPage",
    color: 'navy',
    icon: '📖',
    position: 'tall',
  },
  {
    id: 'needs_translator',
    path: '/reading-between-the-lines',
    title: 'Reading Between the Lines',
    subtitle: 'Notice what feels off and name the need underneath.',
    spineLabel: 'Needs\nTranslator',
    color: 'forest',
    icon: '🌿',
    position: 'short',
  },
  {
    id: 'boundary_scripts',
    path: '/dialogue-practice',
    title: 'Dialogue Practice',
    subtitle: 'Practice words for boundaries, needs, and pauses.',
    spineLabel: 'Dialogue\nPractice',
    color: 'brown',
    icon: '🗣',
    position: 'medium',
  },
  {
    id: 'cognitive_reframe',
    path: '/rewrite-the-page',
    title: 'Rewrite the Page',
    subtitle: 'Turn painful thoughts into kinder, truer lines.',
    spineLabel: 'Rewrite\nthe Page',
    color: 'gold',
    icon: '✍️',
    position: 'tall',
  },
  {
    id: 'evidence_shelf',
    path: '/evidence-shelf',
    title: 'The Evidence Shelf',
    subtitle: 'Collect small moments of self-respect and worth.',
    spineLabel: 'Evidence\nShelf',
    color: 'forest',
    icon: '🏺',
    position: 'short',
  },
  {
    id: 'character_notes',
    path: '/character-notes',
    title: 'Character Notes',
    subtitle: 'Understand the protective parts in your inner story.',
    spineLabel: 'Character\nNotes',
    color: 'navy',
    icon: '🎭',
    position: 'medium',
  },
  {
    id: 'younger_self',
    path: '/letters-to-younger-self',
    title: 'Letters to the Younger Self',
    subtitle: 'Offer reassurance to younger parts who need care.',
    spineLabel: 'Younger\nSelf',
    color: 'warm',
    icon: '💌',
    position: 'tall',
  },
  {
    id: 'session_prep',
    path: '/notes-for-next-chapter',
    title: 'Notes for My Next Chapter',
    subtitle: 'Gather reflections to bring into therapy.',
    spineLabel: "Next\nChapter",
    color: 'gold',
    icon: '📋',
    position: 'medium',
  },
];

const greetings = [
  'Go slowly.',
  'One page is enough.',
  'You do not have to figure everything out today.',
  'Small noticing matters.',
  'You are allowed to need care.',
  'We can listen without rushing.',
  'You can be learning and still be worthy.',
];

export const HomeScreen = () => {
  const navigate = useNavigate();
  const [showCrisis, setShowCrisis] = useState(false);
  const [greeting] = useState(() => greetings[Math.floor(Math.random() * greetings.length)]);

  useEffect(() => {
    const settings = getSettings();
    if (!settings.crisisDisclaimerSeen) {
      setShowCrisis(true);
    }
  }, []);

  const handleCloseCrisis = () => {
    setShowCrisis(false);
    saveSettings({ crisisDisclaimerSeen: true });
  };

  return (
    <div className={styles.homeScreen}>
      {/* Decorative bookshelf top */}
      <div className={styles.shelfDecor} aria-hidden="true">
        <div className={styles.shelfWood} />
      </div>

      {/* Header */}
      <header className={styles.homeHeader}>
        <div className={styles.headerInner}>
          <div className={styles.libraryBadge}>
            <span className={styles.libraryIcon}>🕯️</span>
          </div>
          <h1 className={styles.homeTitle}>
            Welcome back to your<br />
            <em>Inner Library</em>
          </h1>
          <p className={styles.homeSubtitle}>Choose a page to open today.</p>
          <p className={styles.homeGreeting}>{greeting}</p>
          <button className={styles.view3DButton} onClick={() => navigate('/')}>
            <span className={styles.view3DIcon}>✨</span>
            <span className={styles.view3DText}>View 3D Library</span>
          </button>
        </div>
      </header>

      {/* Bookshelf illustration */}
      <div className={styles.bookshelfVisual} aria-hidden="true">
        <div className={styles.shelfRow}>
          {books.slice(0, 4).map((book) => (
            <div
              key={book.id}
              className={`${styles.miniSpine} ${styles[`miniSpine_${book.color}`]} ${styles[`miniSpine_${book.position}`]}`}
            >
              <span className={styles.miniSpineText}>{book.spineLabel}</span>
            </div>
          ))}
        </div>
        <div className={styles.shelfPlank} />
        <div className={styles.shelfRow}>
          {books.slice(4).map((book) => (
            <div
              key={book.id}
              className={`${styles.miniSpine} ${styles[`miniSpine_${book.color}`]} ${styles[`miniSpine_${book.position}`]}`}
            >
              <span className={styles.miniSpineText}>{book.spineLabel}</span>
            </div>
          ))}
        </div>
        <div className={styles.shelfPlank} />
      </div>

      {/* Book Cards Grid */}
      <main className={styles.booksGrid}>
        <p className={styles.gridLabel}>Your shelves</p>
        <div className={styles.cardsGrid}>
          {books.map((book) => (
            <button
              key={book.id}
              className={`${styles.bookCard} ${styles[`bookCard_${book.color}`]}`}
              onClick={() => navigate(book.path)}
            >
              <div className={styles.bookCardSpine} />
              <div className={styles.bookCardBody}>
                <div className={styles.bookCardIcon}>{book.icon}</div>
                <div className={styles.bookCardContent}>
                  <h3 className={styles.bookCardTitle}>{book.title}</h3>
                  <p className={styles.bookCardSubtitle}>{book.subtitle}</p>
                </div>
                <span className={styles.bookCardArrow}>→</span>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Footer note */}
      <footer className={styles.homeFooter}>
        <p>One page at a time. You do not have to figure everything out today.</p>
      </footer>

      {showCrisis && <CrisisBanner onClose={handleCloseCrisis} />}
    </div>
  );
};
