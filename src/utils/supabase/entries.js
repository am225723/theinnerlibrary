// Journal entries operations for The Inner Library
// Interacts with til_entries table

import supabase from '../auth/supabaseClient';

const TOOL_MAPPING = {
  'Daily Check-in': 'daily_checkin',
  'Needs Translator': 'needs_translator',
  'Boundary Scripts': 'boundary_scripts',
  'Cognitive Reframe': 'cognitive_reframe',
  'Evidence Shelf': 'evidence_shelf',
  'Character Notes': 'character_notes',
  'Letters to the Younger Self': 'younger_self',
  'Session Prep': 'session_prep',
};

/**
 * Get all entries for the current user
 */
export const getAllEntries = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { entries: [], error: null };

    const { data, error } = await supabase
      .from('til_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    // Convert to match existing storage.js format
    const entries = (data || []).map((item) => ({
      id: item.id,
      toolId: item.tool_id,
      toolName: item.tool_name,
      category: item.category,
      userInput: item.user_input,
      selectedEmotion: item.selected_emotion,
      selectedNeed: item.selected_need,
      selectedPart: item.selected_part,
      generatedOutput: item.generated_output,
      notes: item.notes,
      evidence: item.evidence,
      spineColor: item.spine_color,
      tags: item.tags || [],
      bookmarked: item.bookmarked || false,
      date: item.date,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    return { entries, error };
  } catch (error) {
    return { entries: [], error };
  }
};

/**
 * Get entries by tool
 */
export const getEntriesByTool = async (toolName) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { entries: [], error: null };

    const { data, error } = await supabase
      .from('til_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('tool_id', TOOL_MAPPING[toolName] || toolName.toLowerCase().replace(/ /g, '_'))
      .order('date', { ascending: false });

    const entries = (data || []).map((item) => ({
      id: item.id,
      toolId: item.tool_id,
      toolName: item.tool_name,
      category: item.category,
      userInput: item.user_input,
      selectedEmotion: item.selected_emotion,
      selectedNeed: item.selected_need,
      selectedPart: item.selected_part,
      generatedOutput: item.generated_output,
      notes: item.notes,
      evidence: item.evidence,
      spineColor: item.spine_color,
      tags: item.tags || [],
      bookmarked: item.bookmarked || false,
      date: item.date,
    }));

    return { entries, error };
  } catch (error) {
    return { entries: [], error };
  }
};

/**
 * Get entries by date range
 */
export const getEntriesByDateRange = async (days) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { entries: [], error: null };

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const { data, error } = await supabase
      .from('til_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', cutoff.toISOString())
      .order('date', { ascending: false });

    const entries = (data || []).map((item) => ({
      id: item.id,
      toolId: item.tool_id,
      toolName: item.tool_name,
      category: item.category,
      userInput: item.user_input,
      selectedEmotion: item.selected_emotion,
      selectedNeed: item.selected_need,
      selectedPart: item.selected_part,
      generatedOutput: item.generated_output,
      notes: item.notes,
      tags: item.tags || [],
      bookmarked: item.bookmarked || false,
      date: item.date,
    }));

    return { entries, error };
  } catch (error) {
    return { entries: [], error };
  }
};

/**
 * Get entries by custom date range
 */
export const getEntriesByCustomRange = async (startDate, endDate) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { entries: [], error: null };

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('til_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', new Date(startDate).toISOString())
      .lte('date', end.toISOString())
      .order('date', { ascending: false });

    const entries = (data || []).map((item) => ({
      id: item.id,
      toolId: item.tool_id,
      toolName: item.tool_name,
      category: item.category,
      userInput: item.user_input,
      selectedEmotion: item.selected_emotion,
      selectedNeed: item.selected_need,
      selectedPart: item.selected_part,
      generatedOutput: item.generated_output,
      notes: item.notes,
      tags: item.tags || [],
      bookmarked: item.bookmarked || false,
      date: item.date,
    }));

    return { entries, error };
  } catch (error) {
    return { entries: [], error };
  }
};

/**
 * Get bookmarked entries
 */
export const getBookmarkedEntries = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { entries: [], error: null };

    const { data, error } = await supabase
      .from('til_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('bookmarked', true)
      .order('date', { ascending: false });

    const entries = (data || []).map((item) => ({
      id: item.id,
      toolId: item.tool_id,
      toolName: item.tool_name,
      category: item.category,
      userInput: item.user_input,
      selectedEmotion: item.selected_emotion,
      selectedNeed: item.selected_need,
      selectedPart: item.selected_part,
      generatedOutput: item.generated_output,
      notes: item.notes,
      tags: item.tags || [],
      bookmarked: item.bookmarked,
      date: item.date,
    }));

    return { entries, error };
  } catch (error) {
    return { entries: [], error };
  }
};

/**
 * Search entries
 */
export const searchEntries = async (query) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { entries: [], error: null };

    if (!query.trim()) {
      return getAllEntries();
    }

    const q = query.toLowerCase();

    const { data, error } = await supabase
      .from('til_entries')
      .select('*')
      .eq('user_id', user.id)
      .or(`user_input.ilike.%${q}%,generated_output.ilike.%${q}%,notes.ilike.%${q}%,tool_name.ilike.%${q}%`)
      .order('date', { ascending: false });

    const entries = (data || []).map((item) => ({
      id: item.id,
      toolId: item.tool_id,
      toolName: item.tool_name,
      category: item.category,
      userInput: item.user_input,
      selectedEmotion: item.selected_emotion,
      selectedNeed: item.selected_need,
      selectedPart: item.selected_part,
      generatedOutput: item.generated_output,
      notes: item.notes,
      tags: item.tags || [],
      bookmarked: item.bookmarked || false,
      date: item.date,
    }));

    return { entries, error };
  } catch (error) {
    return { entries: [], error };
  }
};

/**
 * Create a new entry
 */
export const createEntry = async (entryData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { entry: null, error: 'Not authenticated' };

    const toolId = TOOL_MAPPING[entryData.toolName] || entryData.toolName.toLowerCase().replace(/ /g, '_');

    const { data, error } = await supabase
      .from('til_entries')
      .insert({
        user_id: user.id,
        tool_id: toolId,
        tool_name: entryData.toolName,
        category: entryData.category || 'journal',
        user_input: entryData.userInput,
        selected_emotion: entryData.selectedEmotion,
        selected_need: entryData.selectedNeed,
        selected_part: entryData.selectedPart,
        generated_output: entryData.generatedOutput,
        notes: entryData.notes,
        evidence: entryData.evidence,
        spine_color: entryData.spineColor,
        tags: entryData.tags || [],
        bookmarked: entryData.bookmarked || false,
        date: entryData.date || new Date().toISOString(),
      })
      .select()
      .single();

    const entry = data ? {
      id: data.id,
      toolId: data.tool_id,
      toolName: data.tool_name,
      category: data.category,
      userInput: data.user_input,
      selectedEmotion: data.selected_emotion,
      selectedNeed: data.selected_need,
      selectedPart: data.selected_part,
      generatedOutput: data.generated_output,
      notes: data.notes,
      evidence: data.evidence,
      spineColor: data.spine_color,
      tags: data.tags,
      bookmarked: data.bookmarked,
      date: data.date,
    } : null;

    return { entry, error };
  } catch (error) {
    return { entry: null, error };
  }
};

/**
 * Update an existing entry
 */
export const updateEntry = async (id, updates) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { entry: null, error: 'Not authenticated' };

    const updateData = {};
    if (updates.userInput !== undefined) updateData.user_input = updates.userInput;
    if (updates.selectedEmotion !== undefined) updateData.selected_emotion = updates.selectedEmotion;
    if (updates.selectedNeed !== undefined) updateData.selected_need = updates.selectedNeed;
    if (updates.selectedPart !== undefined) updateData.selected_part = updates.selectedPart;
    if (updates.generatedOutput !== undefined) updateData.generated_output = updates.generatedOutput;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.bookmarked !== undefined) updateData.bookmarked = updates.bookmarked;
    if (updates.evidence !== undefined) updateData.evidence = updates.evidence;
    if (updates.spineColor !== undefined) updateData.spine_color = updates.spineColor;

    const { data, error } = await supabase
      .from('til_entries')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    const entry = data ? {
      id: data.id,
      toolId: data.tool_id,
      toolName: data.tool_name,
      category: data.category,
      userInput: data.user_input,
      selectedEmotion: data.selected_emotion,
      selectedNeed: data.selected_need,
      selectedPart: data.selected_part,
      generatedOutput: data.generated_output,
      notes: data.notes,
      evidence: data.evidence,
      spineColor: data.spine_color,
      tags: data.tags,
      bookmarked: data.bookmarked,
      date: data.date,
    } : null;

    return { entry, error };
  } catch (error) {
    return { entry: null, error };
  }
};

/**
 * Delete an entry
 */
export const deleteEntry = async (id) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('til_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    return { error };
  } catch (error) {
    return { error };
  }
};

/**
 * Toggle bookmark status
 */
export const toggleBookmark = async (id) => {
  try {
    const { entries } = await getAllEntries();
    const entry = entries.find((e) => e.id === id);
    if (!entry) return { bookmarked: false, error: 'Entry not found' };

    const { data, error } = await updateEntry(id, { bookmarked: !entry.bookmarked });
    return { bookmarked: data?.bookmarked, error };
  } catch (error) {
    return { bookmarked: false, error };
  }
};