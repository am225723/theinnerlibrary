// Book customizations operations for The Inner Library
// Interacts with til_book_customizations table

import supabase from '../auth/supabaseClient';

/**
 * Get all book customizations for the current user
 */
export const getAllBookCustomizations = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { customizations: {}, error: null };

    const { data, error } = await supabase
      .from('til_book_customizations')
      .select('*')
      .eq('user_id', user.id);

    if (error) return { customizations: {}, error };

    // Convert to object keyed by book_id
    const customizations = {};
    data.forEach((item) => {
      customizations[item.book_id] = {
        id: item.id,
        bookId: item.book_id,
        colors: {
          cover: item.cover_color,
          spine: item.spine_color,
          text: item.text_color,
          accent: item.accent_color,
        },
        material: item.material_preset,
        coverStyle: item.cover_style,
        texture: {
          type: 'grainy', // Will be derived from material
        },
        pattern: null, // To be added later
        icon: {
          emoji: '📖', // Default, will be customized
          position: 'center',
          size: 48,
        },
        border: {
          enabled: item.cover_style.includes('gilt') || item.cover_style.includes('border'),
          color: item.accent_color,
          width: 2,
        },
        spine: {
          text: item.spine_text || '',
          fontSize: item.spine_font_size,
          style: item.spine_style,
          vertical: true,
        },
        embossing: {
          enabled: item.embossing_enabled,
          depth: item.embossing_depth,
          elements: item.embossing_elements || [],
        },
        ribbonColor: item.ribbon_color,
        updatedAt: item.updated_at,
      };
    });

    return { customizations, error: null };
  } catch (error) {
    return { customizations: {}, error };
  }
};

/**
 * Get a specific book customization
 */
export const getBookCustomization = async (bookId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { customization: null, error: null };

    const { data, error } = await supabase
      .from('til_book_customizations')
      .select('*')
      .eq('user_id', user.id)
      .eq('book_id', bookId)
      .single();

    if (error) return { customization: null, error };

    const customization = {
      id: data.id,
      bookId: data.book_id,
      colors: {
        cover: data.cover_color,
        spine: data.spine_color,
        text: data.text_color,
        accent: data.accent_color,
      },
      material: data.material_preset,
      coverStyle: data.cover_style,
      icon: {
        emoji: '📖',
        position: 'center',
        size: 48,
      },
      border: {
        enabled: data.cover_style.includes('gilt') || data.cover_style.includes('border'),
        color: data.accent_color,
        width: 2,
      },
      spine: {
        text: data.spine_text || '',
        fontSize: data.spine_font_size,
        style: data.spine_style,
        vertical: true,
      },
      embossing: {
        enabled: data.embossing_enabled,
        depth: data.embossing_depth,
        elements: data.embossing_elements || [],
      },
      ribbonColor: data.ribbon_color,
      updatedAt: data.updated_at,
    };

    return { customization, error: null };
  } catch (error) {
    return { customization: null, error };
  }
};

/**
 * Save or update a book customization
 */
export const saveBookCustomization = async (bookId, customization) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    const customizationData = {
      user_id: user.id,
      book_id: bookId,
      cover_color: customization.colors?.cover || '#1B2A4A',
      spine_color: customization.colors?.spine || '#1B2A4A',
      accent_color: customization.colors?.accent || '#B8922A',
      text_color: customization.colors?.text || '#B8922A',
      material_preset: customization.material || 'leather',
      cover_style: customization.coverStyle || 'gilt_border',
      spine_text: customization.spine?.text || '',
      spine_font_size: customization.spine?.fontSize || 20,
      spine_style: customization.spine?.style || 'raised_bands',
      embossing_enabled: customization.embossing?.enabled || false,
      embossing_depth: customization.embossing?.depth || 0.5,
      embossing_elements: customization.embossing?.elements || [],
      ribbon_color: customization.ribbonColor || '#B8922A',
      updated_at: new Date().toISOString(),
    };

    // Upsert using the unique constraint (user_id, book_id)
    const { data, error } = await supabase
      .from('til_book_customizations')
      .upsert(customizationData, {
        onConflict: 'user_id,book_id',
      })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Delete a book customization
 */
export const deleteBookCustomization = async (bookId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('til_book_customizations')
      .delete()
      .eq('user_id', user.id)
      .eq('book_id', bookId);

    return { error };
  } catch (error) {
    return { error };
  }
};

/**
 * Reset a book customization to default
 */
export const resetBookCustomization = async (bookId) => {
  return deleteBookCustomization(bookId);
};