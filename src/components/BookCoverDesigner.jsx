// Book Cover Designer for The Inner Library
// Fixed: embossing toggle, accent color, font size, and proper save functionality

import React, { useState, useCallback } from 'react';
import { useCoverDesigner } from '../3d/hooks/useCoverDesigner';
import { MATERIAL_PRESETS, BOOK_COLORS, PATTERN_PRESETS, BORDER_PRESETS, WEAR_PRESETS } from '../3d/utils/materialPresets';
import styles from './BookCoverDesigner.module.css';

export const BookCoverDesigner = ({ bookId, bookTitle, onClose, onSave }) => {
  const {
    cover,
    hasChanges,
    setMaterial,
    setCoverColor,
    setCustomColor,
    setAccentColor,
    setSpineText,
    setSpineFontSize,
    setIcon,
    setBorderEnabled,
    setPattern,
    setWear,
    setEmbossing,
    saveCover,
    resetCover,
  } = useCoverDesigner(bookId);

  const [activeTab, setActiveTab] = useState('material');

  const handleSave = useCallback(() => {
    saveCover();
    if (onSave) onSave(cover);
  }, [cover, onSave, saveCover]);

  return (
    <div className={styles.designer}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.closeBtn} onClick={onClose}>← Back</button>
        <h2 className={styles.title}>🎨 Custom Cover</h2>
        <p className={styles.subtitle}>{bookTitle}</p>
      </div>

      {/* Live Preview */}
      <div className={styles.preview}>
        <div className={styles.previewBook}>
          <div
            className={styles.previewSpine}
            style={{
              backgroundColor: cover.colors.spine,
              borderRight: cover.border.enabled ? `${cover.border.width}px solid ${cover.border.color}` : 'none',
            }}
          >
            <span
              className={styles.previewSpineText}
              style={{
                color: cover.colors.text,
                fontFamily: cover.spine.font,
                fontSize: `${cover.spine.fontSize}px`,
              }}
            >
              {cover.spine.text || bookTitle}
            </span>
          </div>
          <div
            className={styles.previewCover}
            style={{
              backgroundColor: cover.colors.cover,
              border: cover.border.enabled ? `${cover.border.width}px solid ${cover.border.color}` : 'none',
            }}
          >
            <div className={styles.previewIcon} style={{ fontSize: `${cover.icon.size * 0.5}px` }}>
              {cover.icon.emoji}
            </div>
            <div className={styles.previewCoverTitle} style={{ color: cover.colors.text }}>
              {bookTitle}
            </div>
            <div
              className={styles.previewAccent}
              style={{ backgroundColor: cover.colors.accent }}
            />
            {cover.embossing?.enabled && (
              <div className={styles.previewEmbossing}>Embossed</div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {['material', 'colors', 'details', 'effects'].map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {/* Material Tab */}
        {activeTab === 'material' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Cover Material</h3>
            <div className={styles.optionGrid}>
              {Object.entries(MATERIAL_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  className={`${styles.optionButton} ${cover.material === key ? styles.optionActive : ''}`}
                  onClick={() => setMaterial(key)}
                >
                  <span className={styles.optionName}>{preset.name}</span>
                  <span className={styles.optionDesc}>{preset.description}</span>
                </button>
              ))}
            </div>

            <h3 className={styles.sectionTitle}>Wear Level</h3>
            <div className={styles.optionGrid}>
              {Object.entries(WEAR_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  className={`${styles.optionButton} ${cover.wear === key ? styles.optionActive : ''}`}
                  onClick={() => setWear(key)}
                >
                  <span className={styles.optionName}>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Cover Color</h3>
            <div className={styles.colorGrid}>
              {Object.entries(BOOK_COLORS).map(([key, colorSet]) => (
                <button
                  key={key}
                  className={`${styles.colorSwatch} ${cover.colors.cover === colorSet.main ? styles.colorActive : ''}`}
                  style={{ backgroundColor: colorSet.main }}
                  onClick={() => setCoverColor(key)}
                  title={key}
                />
              ))}
              <label className={styles.colorSwatchCustom}>
                <input
                  type="color"
                  value={cover.colors.cover}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className={styles.colorInput}
                />
                <span className={styles.colorInputLabel}>Custom</span>
              </label>
            </div>

            <h3 className={styles.sectionTitle}>Accent Color</h3>
            <div className={styles.colorGrid}>
              {[
                { color: '#B8922A', name: 'Gold' },
                { color: '#D4A845', name: 'Light Gold' },
                { color: '#CC3333', name: 'Red' },
                { color: '#4A7AB5', name: 'Blue' },
                { color: '#2D5016', name: 'Green' },
                { color: '#C0C0C0', name: 'Silver' },
                { color: '#E8C170', name: 'Cream' },
                { color: '#F5E6B8', name: 'Pale Gold' },
              ].map(({ color, name }) => (
                <button
                  key={color}
                  className={`${styles.colorSwatch} ${cover.colors.accent === color ? styles.colorActive : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setAccentColor(color)}
                  title={name}
                />
              ))}
            </div>

            <h3 className={styles.sectionTitle}>Text Color</h3>
            <div className={styles.colorGrid}>
              {[
                { color: '#B8922A', name: 'Gold' },
                { color: '#FFFFFF', name: 'White' },
                { color: '#F5E6B8', name: 'Cream' },
                { color: '#C0C0C0', name: 'Silver' },
                { color: '#1B2A4A', name: 'Navy' },
                { color: '#000000', name: 'Black' },
              ].map(({ color, name }) => (
                <button
                  key={color}
                  className={`${styles.colorSwatch} ${cover.colors.text === color ? styles.colorActive : ''}`}
                  style={{ backgroundColor: color, border: color === '#FFFFFF' ? '1px solid #ccc' : 'none' }}
                  onClick={() => setAccentColor(color, 'text')}
                  title={name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Spine Text</h3>
            <input
              type="text"
              value={cover.spine.text}
              onChange={(e) => setSpineText(e.target.value)}
              placeholder="Enter spine text..."
              className={styles.textInput}
              maxLength={30}
            />
            <div className={styles.inputRow}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Font Size</label>
                <select
                  value={cover.spine.fontSize}
                  onChange={(e) => setSpineFontSize(parseInt(e.target.value, 10))}
                  className={styles.selectInput}
                >
                  <option value={10}>Small</option>
                  <option value={14}>Medium</option>
                  <option value={18}>Large</option>
                  <option value={22}>Extra Large</option>
                </select>
              </div>
            </div>

            <h3 className={styles.sectionTitle}>Cover Icon</h3>
            <div className={styles.iconGrid}>
              {['📖', '🌿', '🗣️', '✍️', '🏆', '🎭', '💌', '📋', '🕯️', '🦶', '💫', '🌙', '🔮', '🖋️', '🦋', '🍃'].map((emoji) => (
                <button
                  key={emoji}
                  className={`${styles.iconButton} ${cover.icon.emoji === emoji ? styles.iconActive : ''}`}
                  onClick={() => setIcon(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <h3 className={styles.sectionTitle}>Pattern</h3>
            <div className={styles.optionGrid}>
              {Object.entries(PATTERN_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  className={`${styles.optionButton} ${cover.pattern === key || (!cover.pattern && key === 'none') ? styles.optionActive : ''}`}
                  onClick={() => setPattern(key === 'none' ? null : key)}
                >
                  <span className={styles.optionName}>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Effects Tab */}
        {activeTab === 'effects' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Border</h3>
            <div className={styles.toggleRow}>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={cover.border.enabled}
                  onChange={(e) => setBorderEnabled(e.target.checked)}
                  className={styles.toggleInput}
                />
                <span>Show Border</span>
              </label>
            </div>
            {cover.border.enabled && (
              <div className={styles.optionGrid}>
                {Object.entries(BORDER_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    className={`${styles.optionButton} ${cover.border.width === preset.width ? styles.optionActive : ''}`}
                    onClick={() => setBorderEnabled(true)}
                  >
                    <span className={styles.optionName}>{preset.name}</span>
                  </button>
                ))}
              </div>
            )}

            <h3 className={styles.sectionTitle}>Embossing</h3>
            <div className={styles.toggleRow}>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={cover.embossing?.enabled || false}
                  onChange={(e) => setEmbossing({ enabled: e.target.checked, depth: 0.5, elements: [] })}
                  className={styles.toggleInput}
                />
                <span>Enable Embossing</span>
              </label>
            </div>
            {cover.embossing?.enabled && (
              <div className={styles.embossingOptions}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Depth</label>
                  <select
                    value={cover.embossing.depth}
                    onChange={(e) => setEmbossing({ ...cover.embossing, depth: parseFloat(e.target.value) })}
                    className={styles.selectInput}
                  >
                    <option value={0.25}>Subtle</option>
                    <option value={0.5}>Medium</option>
                    <option value={1.0}>Deep</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button className={styles.resetButton} onClick={resetCover}>
          ↺ Reset
        </button>
        <button
          className={styles.saveButton}
          onClick={handleSave}
          disabled={!hasChanges}
        >
          💾 Save Cover
        </button>
      </div>
    </div>
  );
};
