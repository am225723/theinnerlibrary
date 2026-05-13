import React, { useState } from 'react';
import styles from './OpenBookControls.module.css';

const OpenBookControls = ({ 
  scale, 
  positionZ, 
  positionY,
  onScaleChange, 
  onPositionZChange,
  onPositionYChange,
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
        {isOpen ? '▼' : '▲'}
      </button>
      
      {isOpen && (
        <div className={styles.controlsContent}>
          <h3 className={styles.title}>Open Book Controls</h3>
          
          <div className={styles.controlGroup}>
            <label className={styles.label}>
              Scale: {scale.toFixed(2)}x
            </label>
            <input
              type="range"
              min="1.0"
              max="4.0"
              step="0.1"
              value={scale}
              onChange={(e) => onScaleChange(parseFloat(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.quickButtons}>
              <button onClick={() => onScaleChange(1.5)}>1.5x</button>
              <button onClick={() => onScaleChange(2.0)}>2.0x</button>
              <button onClick={() => onScaleChange(2.5)}>2.5x</button>
              <button onClick={() => onScaleChange(3.0)}>3.0x</button>
            </div>
          </div>

          <div className={styles.controlGroup}>
            <label className={styles.label}>
              Position Z: {positionZ.toFixed(2)}
            </label>
            <input
              type="range"
              min="3.0"
              max="6.0"
              step="0.1"
              value={positionZ}
              onChange={(e) => onPositionZChange(parseFloat(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.quickButtons}>
              <button onClick={() => onPositionZChange(3.5)}>3.5</button>
              <button onClick={() => onPositionZChange(4.0)}>4.0</button>
              <button onClick={() => onPositionZChange(4.5)}>4.5</button>
              <button onClick={() => onPositionZChange(5.0)}>5.0</button>
            </div>
          </div>

          <div className={styles.controlGroup}>
            <label className={styles.label}>
              Position Y: {positionY.toFixed(2)}
            </label>
            <input
              type="range"
              min="-1.0"
              max="1.0"
              step="0.1"
              value={positionY}
              onChange={(e) => onPositionYChange(parseFloat(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.quickButtons}>
              <button onClick={() => onPositionYChange(-0.5)}>-0.5</button>
              <button onClick={() => onPositionYChange(0.0)}>0.0</button>
              <button onClick={() => onPositionYChange(0.2)}>0.2</button>
              <button onClick={() => onPositionYChange(0.5)}>0.5</button>
            </div>
          </div>

          <button 
            className={styles.resetButton}
            onClick={onReset}
          >
            Reset to Defaults
          </button>

          <div className={styles.info}>
            <p>Adjust controls to find the perfect fit for your device.</p>
            <p>Once satisfied, note the values and we'll hardcode them.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenBookControls;