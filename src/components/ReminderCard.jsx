// Reminder Card component for The Inner Library

import React, { useState, useCallback } from 'react';
import styles from './ReminderCard.module.css';

const REMINDER_TYPES = {
  daily: {
    label: 'Daily check-in',
    icon: '🔖',
    color: '#B8922A',
    ribbonStyle: 'gold',
  },
  weekly: {
    label: 'Weekly summary',
    icon: '📋',
    color: '#C0C0C0',
    ribbonStyle: 'silver',
  },
  unfinished: {
    label: 'Unfinished entry',
    icon: '📝',
    color: '#CC3333',
    ribbonStyle: 'red',
  },
  bookmarked: {
    label: 'Bookmarked entry',
    icon: '⭐',
    color: '#B8922A',
    ribbonStyle: 'gold',
  },
  therapist: {
    label: 'Therapist note',
    icon: '💬',
    color: '#4A7AB5',
    ribbonStyle: 'blue',
  },
};

export const ReminderCard = ({ 
  reminders = [], 
  bookTitle, 
  onOpen, 
  onSnooze, 
  onDismiss, 
  onView, 
  onClose 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  if (!reminders || reminders.length === 0) return null;

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header} onClick={handleToggle}>
        <div className={styles.headerLeft}>
          <span className={styles.bookmarkIcon}>🔖</span>
          <span className={styles.bookTitle}>{bookTitle}</span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.count}>{reminders.length}</span>
          <span className={styles.expandIcon}>{isExpanded ? '▾' : '▸'}</span>
        </div>
      </div>

      {/* Reminder list */}
      {isExpanded && (
        <div className={styles.reminders}>
          {reminders.map((reminder, index) => {
            const typeInfo = REMINDER_TYPES[reminder.type] || REMINDER_TYPES.daily;
            return (
              <div key={index} className={styles.reminder}>
                <div className={styles.reminderContent}>
                  <span className={styles.reminderIcon}>{typeInfo.icon}</span>
                  <div className={styles.reminderInfo}>
                    <p className={styles.reminderLabel}>{reminder.label || typeInfo.label}</p>
                    {reminder.description && (
                      <p className={styles.reminderDesc}>{reminder.description}</p>
                    )}
                  </div>
                </div>
                <div className={styles.reminderActions}>
                  {reminder.type === 'daily' && (
                    <>
                      <button
                        className={styles.actionPrimary}
                        onClick={() => onOpen && onOpen(reminder)}
                      >
                        Open now
                      </button>
                      <button
                        className={styles.actionSecondary}
                        onClick={() => onSnooze && onSnooze(reminder, 60)}
                      >
                        Snooze 1h
                      </button>
                    </>
                  )}
                  {reminder.type === 'unfinished' && (
                    <>
                      <button
                        className={styles.actionPrimary}
                        onClick={() => onOpen && onOpen(reminder)}
                      >
                        Continue
                      </button>
                      <button
                        className={styles.actionSecondary}
                        onClick={() => onDismiss && onDismiss(reminder)}
                      >
                        Dismiss
                      </button>
                    </>
                  )}
                  {reminder.type === 'bookmarked' && (
                    <>
                      <button
                        className={styles.actionPrimary}
                        onClick={() => onView && onView(reminder)}
                      >
                        View
                      </button>
                    </>
                  )}
                  {reminder.type === 'weekly' && (
                    <button
                      className={styles.actionPrimary}
                      onClick={() => onOpen && onOpen(reminder)}
                    >
                      View summary
                    </button>
                  )}
                  {reminder.type === 'therapist' && (
                    <button
                      className={styles.actionPrimary}
                      onClick={() => onView && onView(reminder)}
                    >
                      View note
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Reminder data utilities
export const getRemindersForBook = (bookId, entries = []) => {
  const reminders = [];
  
  // Check for daily check-in
  const today = new Date().toISOString().split('T')[0];
  const todayEntries = entries.filter((e) => e.date && e.date.startsWith(today));
  
  if (bookId === 'daily_checkin' && todayEntries.length === 0) {
    reminders.push({
      type: 'daily',
      label: 'Daily check-in pending',
      description: 'Take a moment to notice how you feel today.',
    });
  }

  // Check for unfinished entries
  const unfinished = entries.find(
    (e) => e.toolId === bookId && !e.generatedOutput
  );
  if (unfinished) {
    reminders.push({
      type: 'unfinished',
      label: 'Unfinished entry from earlier',
      description: 'You started something here. It can wait.',
      entryId: unfinished.id,
    });
  }

  // Check for bookmarked entries
  const bookmarked = entries.filter(
    (e) => e.toolId === bookId && e.bookmarked
  );
  if (bookmarked.length > 0) {
    reminders.push({
      type: 'bookmarked',
      label: `${bookmarked.length} bookmarked ${bookmarked.length === 1 ? 'entry' : 'entries'}`,
      description: bookmarked[0]?.generatedOutput?.substring(0, 50) + '...',
    });
  }

  return reminders;
};

export default ReminderCard;
