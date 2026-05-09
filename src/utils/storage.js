// Library data storage using localStorage

const STORAGE_KEY = 'inner_library_entries';
const SETTINGS_KEY = 'inner_library_settings';

// Generate unique ID
export const generateId = () =>
  `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Get all entries
export const getEntries = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// Save a new entry
export const saveEntry = (entryData) => {
  const entries = getEntries();
  const newEntry = {
    id: generateId(),
    date: new Date().toISOString(),
    bookmarked: false,
    tags: [],
    ...entryData,
  };
  entries.unshift(newEntry); // newest first
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  return newEntry;
};

// Update an existing entry
export const updateEntry = (id, updates) => {
  const entries = getEntries();
  const index = entries.findIndex((e) => e.id === id);
  if (index !== -1) {
    entries[index] = { ...entries[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return entries[index];
  }
  return null;
};

// Delete an entry
export const deleteEntry = (id) => {
  const entries = getEntries().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

// Toggle bookmark
export const toggleBookmark = (id) => {
  const entries = getEntries();
  const index = entries.findIndex((e) => e.id === id);
  if (index !== -1) {
    entries[index].bookmarked = !entries[index].bookmarked;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return entries[index].bookmarked;
  }
  return false;
};

// Get entries by tool
export const getEntriesByTool = (toolName) =>
  getEntries().filter((e) => e.toolName === toolName);

// Get entries by date range (days)
export const getEntriesByDateRange = (days) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return getEntries().filter((e) => new Date(e.date) >= cutoff);
};

// Get entries by custom date range
export const getEntriesByCustomRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  return getEntries().filter((e) => {
    const d = new Date(e.date);
    return d >= start && d <= end;
  });
};

// Search entries
export const searchEntries = (query) => {
  if (!query.trim()) return getEntries();
  const q = query.toLowerCase();
  return getEntries().filter(
    (e) =>
      (e.userInput && e.userInput.toLowerCase().includes(q)) ||
      (e.generatedOutput && e.generatedOutput.toLowerCase().includes(q)) ||
      (e.notes && e.notes.toLowerCase().includes(q)) ||
      (e.toolName && e.toolName.toLowerCase().includes(q)) ||
      (e.selectedEmotion && e.selectedEmotion.toLowerCase().includes(q)) ||
      (e.selectedNeed && e.selectedNeed.toLowerCase().includes(q)) ||
      (e.tags && e.tags.some((t) => t.toLowerCase().includes(q)))
  );
};

// Settings
export const getSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { crisisDisclaimerSeen: false };
  } catch {
    return { crisisDisclaimerSeen: false };
  }
};

export const saveSettings = (updates) => {
  const current = getSettings();
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...updates }));
};
