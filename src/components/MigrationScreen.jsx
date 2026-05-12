// Migration Screen - The Inner Library
// Migrates localStorage data to Supabase on first login

import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/useAuth';
import * as migrationUtils from '../utils/supabase/migration';
import styles from './MigrationScreen.module.css';

export const MigrationScreen = ({ onComplete }) => {
  const { user } = useAuth();
  const [status, setStatus] = useState('checking'); // checking, ready, migrating, completed, error
  const [migrationData, setMigrationData] = useState(null);
  const [migrationResult, setMigrationResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkMigrationStatus();
  }, [user]);

  const checkMigrationStatus = async () => {
    setStatus('checking');
    const { completed, hasLocalData, localEntriesCount, localCoversCount } = await migrationUtils.getMigrationStatus();

    if (completed) {
      setStatus('completed');
      setTimeout(() => onComplete?.(), 1000);
    } else if (!hasLocalData) {
      // No data to migrate, skip automatically
      setStatus('migrating');
      const result = await migrationUtils.runMigration();
      setMigrationResult(result);
      setStatus('completed');
      setTimeout(() => onComplete?.(), 1000);
    } else {
      setMigrationData({
        localEntriesCount,
        localCoversCount,
      });
      setStatus('ready');
    }
  };

  const handleMigrate = async () => {
    setStatus('migrating');
    setError(null);

    const result = await migrationUtils.runMigration();
    setMigrationResult(result);

    if (result.success) {
      setStatus('completed');
      setTimeout(() => onComplete?.(), 1500);
    } else {
      setStatus('error');
      setError(result.error || 'Migration failed');
    }
  };

  const handleSkip = async () => {
    // Mark as complete even if skipped
    await migrationUtils.completeMigration();
    setStatus('completed');
    setTimeout(() => onComplete?.(), 1000);
  };

  if (status === 'checking') {
    return (
      <div className={styles.screen}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Checking for existing data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div className={styles.screen}>
        <div className={styles.container}>
          <div className={styles.success}>
            <div className={styles.icon}>✓</div>
            <h2>Setup Complete!</h2>
            <p>Your library has been successfully set up.</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={styles.screen}>
        <div className={styles.container}>
          <div className={styles.error}>
            <div className={styles.icon}>⚠</div>
            <h2>Migration Error</h2>
            <p>{error}</p>
            {migrationResult && (
              <div className={styles.result}>
                <p>Entries migrated: {migrationResult.entriesMigrated}</p>
                <p>Covers migrated: {migrationResult.coversMigrated}</p>
              </div>
            )}
            <div className={styles.buttons}>
              <button className={styles.primaryButton} onClick={handleMigrate}>
                Try Again
              </button>
              <button className={styles.secondaryButton} onClick={handleSkip}>
                Skip Migration
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'migrating') {
    return (
      <div className={styles.screen}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Migrating your data...</p>
            <p className={styles.subtitle}>This may take a moment</p>
          </div>
        </div>
      </div>
    );
  }

  // Ready state - show migration prompt
  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.icon}>📚</div>
          <h2>Welcome to The Inner Library</h2>
          <p className={styles.subtitle}>
            We found some existing data from your previous sessions.
          </p>

          {migrationData && (
            <div className={styles.summary}>
              <div className={styles.stat}>
                <span className={styles.number}>{migrationData.localEntriesCount}</span>
                <span className={styles.label}>Journal Entries</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.number}>{migrationData.localCoversCount}</span>
                <span className={styles.label}>Book Designs</span>
              </div>
            </div>
          )}

          <div className={styles.info}>
            <p>
              We'll transfer your data to your secure cloud storage so you can access
              it from any device.
            </p>
            <p className={styles.note}>
              Your data will remain private and encrypted.
            </p>
          </div>

          <div className={styles.buttons}>
            <button
              className={styles.primaryButton}
              onClick={handleMigrate}
            >
              Migrate My Data
            </button>
            <button
              className={styles.secondaryButton}
              onClick={handleSkip}
            >
              Skip for Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};