// Bookshelf layout hook for The Inner Library 3D Bookshelf

import { useMemo } from 'react';
import { calculateBookPosition, getBookDimensions, SHELF_DIMENSIONS } from '../utils/bookGeometry';

// Core book definitions
export const CORE_BOOKS = [
  {
    id: 'daily_checkin',
    path: '/open-todays-page',
    title: "Open Today's Page",
    subtitle: 'A gentle check-in for what feels present.',
    spineLabel: "Today's\nPage",
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
    spineLabel: 'Needs\nTranslator',
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
    spineLabel: 'Dialogue\nPractice',
    color: 'brown',
    icon: '🗣️',
    position: 'medium',
    isCore: true,
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
    isCore: true,
  },
  {
    id: 'evidence_shelf',
    path: '/evidence-shelf',
    title: 'The Evidence Shelf',
    subtitle: 'Collect small moments of self-respect and worth.',
    spineLabel: 'Evidence\nShelf',
    color: 'forest',
    icon: '🏆',
    position: 'short',
    isCore: true,
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
    isCore: true,
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
    isCore: true,
  },
  {
    id: 'session_prep',
    path: '/notes-for-next-chapter',
    title: 'Notes for My Next Chapter',
    subtitle: 'Gather reflections to bring into therapy.',
    spineLabel: 'Next\nChapter',
    color: 'gold',
    icon: '📋',
    position: 'medium',
    isCore: true,
  },
];

export const useBookshelfLayout = (savedEntries = []) => {
  const layout = useMemo(() => {
    // Combine core books with saved entries
    const allBooks = [...CORE_BOOKS];
    
    // Add saved entries as additional books (limit to 8 to avoid overcrowding)
    const recentEntries = savedEntries.slice(0, 8);
    recentEntries.forEach((entry, index) => {
      allBooks.push({
        id: entry.id,
        path: `/my-library?entry=${entry.id}`,
        title: entry.toolName || 'Saved Entry',
        subtitle: new Date(entry.date).toLocaleDateString(),
        spineLabel: entry.toolName?.substring(0, 10) || 'Saved',
        color: 'navy',
        icon: '📝',
        position: 'medium',
        isCore: false,
        entryData: entry,
      });
    });

    // Calculate positions for all books
    const booksWithPositions = allBooks.map((book, index) => {
      const shelfIndex = Math.floor(index / SHELF_DIMENSIONS.booksPerShelf);
      const position = calculateBookPosition(index, shelfIndex, allBooks.length);
      const dimensions = getBookDimensions(book.position);

      return {
        ...book,
        position,
        dimensions,
        shelfIndex,
      };
    });

    // Calculate shelf count
    const shelfCount = Math.ceil(booksWithPositions.length / SHELF_DIMENSIONS.booksPerShelf);

    return {
      books: booksWithPositions,
      shelfCount,
      totalBooks: booksWithPositions.length,
    };
  }, [savedEntries]);

  return layout;
};

// Get book by ID (non-hook utility)
export const getBookByIdUtil = (bookId, savedEntries = []) => {
  const allBooks = [...CORE_BOOKS];
  const recentEntries = savedEntries.slice(0, 8);
  recentEntries.forEach((entry) => {
    allBooks.push({
      id: entry.id,
      path: `/my-library?entry=${entry.id}`,
      title: entry.toolName || 'Saved Entry',
      subtitle: new Date(entry.date).toLocaleDateString(),
      spineLabel: entry.toolName?.substring(0, 10) || 'Saved',
      color: 'navy',
      icon: '📝',
      position: 'medium',
      isCore: false,
      entryData: entry,
    });
  });
  return allBooks.find((book) => book.id === bookId);
};

// Get books by shelf (non-hook utility)
export const getBooksByShelfUtil = (shelfIndex, savedEntries = []) => {
  const allBooks = [...CORE_BOOKS];
  const recentEntries = savedEntries.slice(0, 8);
  recentEntries.forEach((entry) => {
    allBooks.push({
      id: entry.id,
      path: `/my-library?entry=${entry.id}`,
      title: entry.toolName || 'Saved Entry',
      subtitle: new Date(entry.date).toLocaleDateString(),
      spineLabel: entry.toolName?.substring(0, 10) || 'Saved',
      color: 'navy',
      icon: '📝',
      position: 'medium',
      isCore: false,
      entryData: entry,
    });
  });
  const booksPerShelf = SHELF_DIMENSIONS.booksPerShelf;
  return allBooks.filter((_, index) => Math.floor(index / booksPerShelf) === shelfIndex);
};

// Calculate shelf Y position
export const getShelfYPosition = (shelfIndex) => {
  return -shelfIndex * SHELF_DIMENSIONS.shelfGap;
};