// Bookshelf layout hook for The Inner Library 3D Bookshelf

import { useMemo } from 'react';
import { SHELF_DIMENSIONS } from '../utils/bookGeometry';

// Core book definitions - each with unique visual properties
export const CORE_BOOKS = [
  {
    id: 'daily_checkin',
    path: '/open-todays-page',
    title: "Open Today's Page",
    subtitle: 'A gentle check-in for what feels present.',
    spineLabel: "Today's Page",
    color: 'navy',
    icon: '📖',
    position: 'tall',
    isCore: true,
  },
  {
    id: 'needs_translator',
    path: '/reading-between-the-lines',
    title: 'Reading Between the Lines',
    subtitle: 'Notice what feels off and name the need underneath.',
    spineLabel: 'Needs Translator',
    color: 'forest',
    icon: '🌿',
    position: 'short',
    isCore: true,
  },
  {
    id: 'boundary_scripts',
    path: '/dialogue-practice',
    title: 'Dialogue Practice',
    subtitle: 'Practice words for boundaries, needs, and pauses.',
    spineLabel: 'Dialogue Practice',
    color: 'burgundy',
    icon: '🗣️',
    position: 'medium',
    isCore: true,
  },
  {
    id: 'cognitive_reframe',
    path: '/rewrite-the-page',
    title: 'Rewrite the Page',
    subtitle: 'Turn painful thoughts into kinder, truer lines.',
    spineLabel: 'Rewrite the Page',
    color: 'gold',
    icon: '✍️',
    position: 'medium',
    isCore: true,
  },
  {
    id: 'evidence_shelf',
    path: '/evidence-shelf',
    title: 'The Evidence Shelf',
    subtitle: 'Collect small moments of self-respect and worth.',
    spineLabel: 'Evidence Shelf',
    color: 'teal',
    icon: '🏆',
    position: 'short',
    isCore: true,
  },
  {
    id: 'character_notes',
    path: '/character-notes',
    title: 'Character Notes',
    subtitle: 'Understand the protective parts in your inner story.',
    spineLabel: 'Character Notes',
    color: 'plum',
    icon: '🎭',
    position: 'tall',
    isCore: true,
  },
  {
    id: 'younger_self',
    path: '/letters-to-younger-self',
    title: 'Letters to the Younger Self',
    subtitle: 'Offer reassurance to younger parts who need care.',
    spineLabel: 'Younger Self',
    color: 'terracotta',
    icon: '💌',
    position: 'medium',
    isCore: true,
  },
  {
    id: 'session_prep',
    path: '/notes-for-next-chapter',
    title: 'Notes for My Next Chapter',
    subtitle: 'Gather reflections to bring into therapy.',
    spineLabel: 'Next Chapter',
    color: 'brown',
    icon: '📋',
    position: 'medium',
    isCore: true,
  },
];

export const useBookshelfLayout = (savedEntries = []) => {
  const layout = useMemo(() => {
    // Only core books on the shelf (no saved entries as books - they go in My Library)
    const allBooks = [...CORE_BOOKS];

    const shelfCount = Math.ceil(allBooks.length / SHELF_DIMENSIONS.booksPerShelf);

    return {
      books: allBooks,
      shelfCount,
      totalBooks: allBooks.length,
    };
  }, []);

  return layout;
};

// Get book by ID
export const getBookByIdUtil = (bookId) => {
  return CORE_BOOKS.find((book) => book.id === bookId);
};
