import React, { useState } from 'react';
import styles from './OpenBookControls.module.css';

const OpenBookControls = ({ 
  overlayOffsetX,
  overlayOffsetY,
  overlayWidthScale,
  overlayHeightScale,
  onOverlayOffsetXChange,
  onOverlayOffsetYChange,
  onOverlayWidthScaleChange,
  onOverlayHeightScaleChange,
  onReset 
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`${styles.controls} ${!isOpen ? styles.collapsed : ''}`}>
      <button 
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Hide controls' : 'Show controls'}
      >
        {isOpen ? '\u25bc' : '\u25b2'}
      </button>
      
      {isOpen && (
        <div className={styles.controlsContent}>
          <h3 className={styles.title}>Overlay Controls</h3>
          
          <div className={styles.sectionLabel}>Position</div>

          <div className={styles.controlGroup}>
            <label className={styles.label}>
              Left/Right: {overlayOffsetX.toFixed(2)}
            </label>
            <input
              type="range"
              min="-1.0"
              max="1.0"
              step="0.01"
              value={overlayOffsetX}
              onChange={(e) => onOverlayOffsetXChange(parseFloat(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.quickButtons}>
              <button onClick={() => onOverlayOffsetXChange(-0.2)}>-0.2</button>
              <button onClick={() => onOverlayOffsetXChange(0.0)}>0.0</button>
              <button onClick={() => onOverlayOffsetXChange(0.22)}>0.22</button>
              <button onClick={() => onOverlayOffsetXChange(0.5)}>0.5</button>
            </div>
          </div>

          <div className={styles.controlGroup}>
            <label className={styles.label}>
              Up/Down: {overlayOffsetY.toFixed(2)}
            </label>
            <input
              type="range"
              min="-1.0"
              max="1.0"
              step="0.01"
              value={overlayOffsetY}
              onChange={(e) => onOverlayOffsetYChange(parseFloat(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.quickButtons}>
              <button onClick={() => onOverlayOffsetYChange(-0.2)}>-0.2</button>
              <button onClick={() => onOverlayOffsetYChange(0.0)}>0.0</button>
              <button onClick={() => onOverlayOffsetYChange(0.2)}>0.2</button>
              <button onClick={() => onOverlayOffsetYChange(0.5)}>0.5</button>
            </div>
          </div>

          <div className={styles.sectionLabel}>Size</div>

          <div className={styles.controlGroup}>
            <label className={styles.label}>
              Width Scale: {overlayWidthScale.toFixed(2)}x
            </label>
            <input
              type="range"
              min="0.3"
              max="2.0"
              step="0.05"
              value={overlayWidthScale}
              onChange={(e) => onOverlayWidthScaleChange(parseFloat(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.quickButtons}>
              <button onClick={() => onOverlayWidthScaleChange(0.5)}>0.5x</button>
              <button onClick={() => onOverlayWidthScaleChange(0.8)}>0.8x</button>
              <button onClick={() => onOverlayWidthScaleChange(1.0)}>1.0x</button>
              <button onClick={() => onOverlayWidthScaleChange(1.3)}>1.3x</button>
            </div>
          </div>

          <div className={styles.controlGroup}>
            <label className={styles.label}>
              Height Scale: {overlayHeightScale.toFixed(2)}x
            </label>
            <input
              type="range"
              min="0.3"
              max="2.0"
              step="0.05"
              value={overlayHeightScale}
              onChange={(e) => onOverlayHeightScaleChange(parseFloat(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.quickButtons}>
              <button onClick={() => onOverlayHeightScaleChange(0.5)}>0.5x</button>
              <button onClick={() => onOverlayHeightScaleChange(0.8)}>0.8x</button>
              <button onClick={() => onOverlayHeightScaleChange(1.0)}>1.0x</button>
              <button onClick={() => onOverlayHeightScaleChange(1.3)}>1.3x</button>
            </div>
          </div>

          <button 
            className={styles.resetButton}
            onClick={onReset}
          >
            Reset to Defaults
          </button>

          <div className={styles.info}>
            <p>Adjust overlay position and size for your device.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenBookControls;