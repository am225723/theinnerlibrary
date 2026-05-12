// Migration utilities for transferring localStorage data to Supabase
// This should be run once after the user registers/logs in

import supabase from '../auth/supabaseClient';
import * as entriesDB from './entries';
import * as bookCustomizationsDB from './bookCustomizations';

const ENTRIES_KEY = 'inner_library_entries';
const COVERS_KEY = 'inner_library_cover_designs';
const SETTINGS_KEY = 'inner_library_settings';

/**
 * Check if migration has been completed
 */
export const hasMigrationCompleted = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { completed: false, error: null };

    const { data } = await supabase
      .from('til_profiles')
      .select('metadata')
      .eq('id', user.id)
      .single();

    const metadata = data?.metadata || {};
    return {
      completed: metadata?.migrated_to_supabase === true,
      error: null,
    };
  } catch (error) {
    return { completed: false, error };
  }
};

/**
 * Mark migration as completed
 */
export const completeMigration = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase.auth.updateUser({
      data: { migrated_to_supabase: true },
    });

    return { error };
  } catch (error) {
    return { error };
  }
};

/**
 * Get localStorage data
 */
const getLocalStorageData = () => {
  try {
    const entries = JSON.parse(localStorage.getItem(ENTRIES_KEY) || '[]');
    const covers = JSON.parse(localStorage.getItem(COVERS_KEY) || '{}');
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');

    return {
      entries,
      covers,
      settings,
      entriesCount: entries.length,
      coversCount: Object.keys(covers).length,
    };
  } catch (error) {
    console.error('Error reading localStorage:', error);
    return {
      entries: [],
      covers: {},
      settings: {},
      entriesCount: 0,
      coversCount: 0,
    };
  }
};

/**
 * Migrate entries to Supabase
 */
const migrateEntries = async (localEntries) => {
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const entry of localEntries) {
    try {
      const { error } = await entriesDB.createEntry({
        toolName: entry.toolName,
        category: entry.category || 'journal',
        userInput: entry.userInput,
        selectedEmotion: entry.selectedEmotion,
        selectedNeed: entry.selectedNeed,
        selectedPart: entry.selectedPart,
        generatedOutput: entry.generatedOutput,
        notes: entry.notes,
        evidence: entry.evidence,
        spineColor: entry.spineColor,
        tags: entry.tags || [],
        bookmarked: entry.bookmarked || false,
        date: entry.date || new Date().toISOString(),
      });

      if (error) {
        errorCount++;
        errors.push({ entryId: entry.id, error: error.message });
      } else {
        successCount++;
      }
    } catch (err) {
      errorCount++;
      errors.push({ entryId: entry.id, error: err.message });
    }
  }

  return {
    successCount,
    errorCount,
    errors,
  };
};

/**
 * Migrate book customizations to Supabase
 */
const migrateBookCustomizations = async (localCovers) => {
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const [bookId, cover] of Object.entries(localCovers)) {
    try {
      const { error } = await bookCustomizationsDB.saveBookCustomization(bookId, cover);

      if (error) {
        errorCount++;
        errors.push({ bookId, error: error.message });
      } else {
        successCount++;
      }
    } catch (err) {
      errorCount++;
      errors.push({ bookId, error: err.message });
    }
  }

  return {
    successCount,
    errorCount,
    errors,
  };
};

/**
 * Run full migration
 */
export const runMigration = async () => {
  try {
    // Check if already migrated
    const { completed } = await hasMigrationCompleted();
    if (completed) {
      return {
        success: true,
        alreadyMigrated: true,
        message: 'Migration already completed',
      };
    }

    // Get localStorage data
    const localData = getLocalStorageData();

    if (localData.entriesCount === 0 && localData.coversCount === 0) {
      // No data to migrate, mark as complete
      await completeMigration();
      return {
        success: true,
        message: 'No data to migrate',
        entriesMigrated: 0,
        coversMigrated: 0,
      };
    }

    // Migrate entries
    const entriesResult = await migrateEntries(localData.entries);

    // Migrate book customizations
    const coversResult = await migrateBookCustomizations(localData.covers);

    // Mark migration as complete
    await completeMigration();

    return {
      success: entriesResult.errorCount === 0 && coversResult.errorCount === 0,
      entriesMigrated: entriesResult.successCount,
      coversMigrated: coversResult.successCount,
      entriesErrors: entriesResult.errors,
      coversErrors: coversResult.errors,
      message: `Migrated ${entriesResult.successCount} entries and ${coversResult.successCount} book customizations`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Migration failed',
    };
  }
};

/**
 * Verify migration integrity
 */
export const verifyMigration = async () => {
  try {
    // Count local entries
    const localData = getLocalStorageData();

    // Count Supabase entries
    const { entries: supabaseEntries } = await entriesDB.getAllEntries();

    // Count Supabase book customizations
    const { customizations } = await bookCustomizationsDB.getAllBookCustomizations();

    return {
      localEntriesCount: localData.entriesCount,
      supabaseEntriesCount: supabaseEntries.length,
      localCoversCount: localData.coversCount,
      supabaseCoversCount: Object.keys(customizations).length,
      entriesMatch: localData.entriesCount === supabaseEntries.length,
      coversMatch: localData.coversCount === supabaseCoversCount,
      verified: localData.entriesCount === supabaseEntries.length &&
                localData.coversCount === supabaseCoversCount,
    };
  } catch (error) {
    return {
      verified: false,
      error: error.message,
    };
  }
};

/**
 * Get migration status summary
 */
export const getMigrationStatus = async () => {
  try {
    const { completed } = await hasMigrationCompleted();
    const localData = getLocalStorageData();

    return {
      completed,
      hasLocalData: localData.entriesCount > 0 || localData.coversCount > 0,
      localEntriesCount: localData.entriesCount,
      localCoversCount: localData.coversCount,
    };
  } catch (error) {
    return {
      completed: false,
      error: error.message,
    };
  }
};