import React, { useState, useEffect } from 'react';
import {
  PageWrapper, PageHeader, FilterPills, BookmarkCard,
  EmptyState, Button, Modal, GentleNote, StyledTextArea
} from '../components/SharedComponents';
import {
  getEntries, searchEntries, deleteEntry,
  toggleBookmark, updateEntry
} from '../utils/storage';
import { formatDate, formatRelative, ALL_CATEGORIES } from '../utils/helpers';
import styles from './MyLibrary.module.css';

export const MyLibrary = () => {
  const [entries, setEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    const all = getEntries();
    setEntries(all);
  };

  const getFilteredEntries = () => {
    let list = searchQuery.trim()
      ? searchEntries(searchQuery)
      : entries;
    if (activeFilter !== 'All') {
      list = list.filter((e) => e.category === activeFilter);
    }
    return list;
  };

  const handleToggleBookmark = (id) => {
    toggleBookmark(id);
    loadEntries();
  };

  const handleDelete = (id) => {
    deleteEntry(id);
    loadEntries();
    setSelectedEntry(null);
  };

  const handleOpenEntry = (entry) => {
    setSelectedEntry(entry);
    setEditNotes(entry.notes || '');
  };

  const handleSaveNotes = () => {
    if (!selectedEntry) return;
    updateEntry(selectedEntry.id, { notes: editNotes });
    loadEntries();
    setSelectedEntry(null);
  };

  const filtered = getFilteredEntries();

  const prepareEntryForCard = (entry) => ({
    ...entry,
    dateFormatted: formatRelative(entry.date),
    preview: entry.generatedOutput
      ? entry.generatedOutput.slice(0, 100) + (entry.generatedOutput.length > 100 ? '…' : '')
      : entry.userInput?.slice(0, 100) || '',
  });

  return (
    <PageWrapper className={styles.myLibraryPage}>
      <PageHeader
        title="My Library"
        subtitle="These are pages you have already opened. You can return to them anytime."
        icon="🔖"
      />

      {/* Search */}
      <div className={styles.searchBar}>
        <input
          type="search"
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your pages…"
          aria-label="Search saved entries"
        />
        {searchQuery && (
          <button className={styles.searchClear} onClick={() => setSearchQuery('')} aria-label="Clear search">×</button>
        )}
      </div>

      {/* Filters */}
      <FilterPills
        options={ALL_CATEGORIES}
        selected={activeFilter}
        onSelect={setActiveFilter}
      />

      {/* Stats */}
      <div className={styles.libraryStats}>
        <span className={styles.statItem}>
          <strong>{entries.length}</strong> pages saved
        </span>
        <span className={styles.statDot}>·</span>
        <span className={styles.statItem}>
          <strong>{entries.filter((e) => e.bookmarked).length}</strong> bookmarked
        </span>
      </div>

      {/* Entry list */}
      {filtered.length === 0 ? (
        <EmptyState
          message={
            searchQuery
              ? `No pages found for "${searchQuery}". Try a different search.`
              : 'No pages saved yet. One small reflection can begin the shelf.'
          }
          icon="📚"
        />
      ) : (
        <div className={styles.entryGrid}>
          {filtered.map((entry) => (
            <BookmarkCard
              key={entry.id}
              entry={prepareEntryForCard(entry)}
              onOpen={handleOpenEntry}
              onDelete={handleDelete}
              onToggleBookmark={handleToggleBookmark}
            />
          ))}
        </div>
      )}

      {/* Bookmarked section */}
      {!searchQuery && activeFilter === 'All' && entries.filter((e) => e.bookmarked).length > 0 && (
        <div className={styles.bookmarkedSection}>
          <p className={styles.bookmarkedTitle}>🔖 Bookmarked pages</p>
          <div className={styles.entryGrid}>
            {entries
              .filter((e) => e.bookmarked)
              .slice(0, 3)
              .map((entry) => (
                <BookmarkCard
                  key={entry.id}
                  entry={prepareEntryForCard(entry)}
                  onOpen={handleOpenEntry}
                  onDelete={handleDelete}
                  onToggleBookmark={handleToggleBookmark}
                  compact
                />
              ))}
          </div>
        </div>
      )}

      <GentleNote>
        You can come back to these pages anytime. There is no deadline on reflection.
      </GentleNote>

      {/* Entry detail modal */}
      <Modal
        isOpen={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        title={selectedEntry?.toolName || 'Entry'}
      >
        {selectedEntry && (
          <div className={styles.modalEntryDetail}>
            <p className={styles.modalDate}>{formatDate(selectedEntry.date)}</p>

            {selectedEntry.selectedEmotion && (
              <div className={styles.modalField}>
                <span className={styles.modalFieldLabel}>Feeling / Concern</span>
                <span className={styles.modalFieldValue}>{selectedEntry.selectedEmotion}</span>
              </div>
            )}

            {selectedEntry.selectedNeed && (
              <div className={styles.modalField}>
                <span className={styles.modalFieldLabel}>Need</span>
                <span className={styles.modalFieldValue}>{selectedEntry.selectedNeed}</span>
              </div>
            )}

            {selectedEntry.userInput && (
              <div className={styles.modalField}>
                <span className={styles.modalFieldLabel}>Your input</span>
                <p className={styles.modalFieldText}>{selectedEntry.userInput}</p>
              </div>
            )}

            {selectedEntry.generatedOutput && (
              <div className={styles.modalField}>
                <span className={styles.modalFieldLabel}>Reflection</span>
                <p className={styles.modalFieldText}>{selectedEntry.generatedOutput}</p>
              </div>
            )}

            <StyledTextArea
              label="Notes:"
              value={editNotes}
              onChange={setEditNotes}
              rows={3}
              placeholder="Add or edit your notes…"
            />

            <div className={styles.modalActions}>
              <Button variant="primary" size="sm" onClick={handleSaveNotes}>
                Save notes
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(selectedEntry.id)}
              >
                Remove page
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageWrapper>
  );
};
