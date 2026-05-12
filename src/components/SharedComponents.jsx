import React from 'react';
import styles from './SharedComponents.module.css';

// ===== APP LAYOUT =====
export const AppLayout = ({ children }) => (
  <div className={styles.appLayout}>{children}</div>
);

// ===== PAGE WRAPPER =====
export const PageWrapper = ({ children, className = '' }) => (
  <div className={`${styles.pageWrapper} ${className} page-fade-in`}>
    {children}
  </div>
);

// ===== PAGE HEADER =====
export const PageHeader = ({ title, subtitle, icon, onBack, backLabel = 'Return to the library' }) => (
  <header className={styles.pageHeader}>
    {onBack && (
      <button className={styles.backButton} onClick={onBack} aria-label="Go back">
        <span className={styles.backArrow}>←</span>
        <span className={styles.backLabel}>{backLabel}</span>
      </button>
    )}
    {icon && <div className={styles.pageHeaderIcon}>{icon}</div>}
    <h1 className={styles.pageTitle}>{title}</h1>
    {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
  </header>
);

// ===== STEP INDICATOR =====
export const StepIndicator = ({ current, total }) => (
  <div className={styles.stepIndicator} aria-label={`Step ${current} of ${total}`}>
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`${styles.stepDot} ${i < current ? styles.stepDotComplete : ''} ${i === current - 1 ? styles.stepDotActive : ''}`}
      />
    ))}
    <span className={styles.stepLabel}>{current} of {total}</span>
  </div>
);

// ===== PROMPT CARD =====
export const PromptCard = ({ children, className = '' }) => (
  <div className={`${styles.promptCard} ${className}`}>
    {children}
  </div>
);

// ===== PROMPT LABEL =====
export const PromptLabel = ({ children }) => (
  <p className={styles.promptLabel}>{children}</p>
);

// ===== OPTION GRID =====
export const OptionGrid = ({ options, selected, onSelect, columns = 2 }) => (
  <div
    className={styles.optionGrid}
    style={{ '--cols': columns }}
    role="listbox"
    aria-label="Select an option"
  >
    {options.map((option) => (
      <button
        key={option}
        className={`${styles.optionButton} ${selected === option ? styles.optionSelected : ''}`}
        onClick={() => onSelect(option)}
        role="option"
        aria-selected={selected === option}
      >
        {option}
      </button>
    ))}
  </div>
);

// ===== TEXT AREA =====
export const StyledTextArea = ({
  value,
  onChange,
  placeholder,
  rows = 4,
  label,
}) => (
  <div className={styles.textAreaWrapper}>
    {label && <label className={styles.textAreaLabel}>{label}</label>}
    <textarea
      className={styles.styledTextArea}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
    />
  </div>
);

// ===== REFLECTION CARD =====
export const ReflectionCard = ({ children, variant = 'default', className = '' }) => (
  <div className={`${styles.reflectionCard} ${styles[`reflectionCard_${variant}`]} ${className}`}>
    {children}
  </div>
);

// ===== BUTTON =====
export const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  icon,
  className = '',
  type = 'button',
}) => (
  <button
    type={type}
    className={`${styles.button} ${styles[`button_${variant}`]} ${styles[`button_${size}`]} ${fullWidth ? styles.buttonFull : ''} ${className}`}
    onClick={onClick}
    disabled={disabled}
  >
    {icon && <span className={styles.buttonIcon}>{icon}</span>}
    {children}
  </button>
);

// ===== BUTTON GROUP =====
export const ButtonGroup = ({ children, center = false, wrap = true }) => (
  <div className={`${styles.buttonGroup} ${center ? styles.buttonGroupCenter : ''} ${wrap ? styles.buttonGroupWrap : ''}`}>
    {children}
  </div>
);

// ===== SAVE BANNER =====
export const SaveBanner = ({ visible, message = 'Saved to your shelf.' }) =>
  visible ? (
    <div className={styles.saveBanner} role="status" aria-live="polite">
      <span className={styles.saveBannerIcon}>🔖</span>
      {message}
    </div>
  ) : null;

// ===== BOOKMARK CARD (saved entry) =====
export const BookmarkCard = ({
  entry,
  onOpen,
  onDelete,
  onToggleBookmark,
  compact = false,
}) => {
  const toolColors = {
    daily_checkin: 'navy',
    needs_translator: 'forest',
    boundary_scripts: 'brown',
    cognitive_reframe: 'gold',
    evidence_shelf: 'forest',
    character_notes: 'navy',
    younger_self: 'warm',
    session_prep: 'gold',
  };
  const colorClass = toolColors[entry.toolId] || 'navy';

  return (
    <div className={`${styles.bookmarkCard} ${styles[`bookmarkCard_${colorClass}`]} ${compact ? styles.bookmarkCardCompact : ''}`}>
      <div className={styles.bookmarkCardTop}>
        <div className={styles.bookmarkCardMeta}>
          <span className={styles.bookmarkCardTool}>{entry.toolName}</span>
          <span className={styles.bookmarkCardDate}>{entry.dateFormatted}</span>
        </div>
        <button
          className={`${styles.bookmarkToggle} ${entry.bookmarked ? styles.bookmarkToggleActive : ''}`}
          onClick={() => onToggleBookmark(entry.id)}
          aria-label={entry.bookmarked ? 'Remove bookmark' : 'Bookmark this entry'}
          title={entry.bookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          🔖
        </button>
      </div>
      {entry.preview && (
        <p className={styles.bookmarkCardPreview}>{entry.preview}</p>
      )}
      <div className={styles.bookmarkCardActions}>
        {onOpen && (
          <button className={styles.bookmarkActionBtn} onClick={() => onOpen(entry)}>
            Open page
          </button>
        )}
        {onDelete && (
          <button className={`${styles.bookmarkActionBtn} ${styles.bookmarkActionDelete}`} onClick={() => onDelete(entry.id)}>
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

// ===== EMPTY STATE =====
export const EmptyState = ({ message, icon = '📚' }) => (
  <div className={styles.emptyState}>
    <span className={styles.emptyStateIcon}>{icon}</span>
    <p className={styles.emptyStateText}>{message}</p>
  </div>
);

// ===== SECTION DIVIDER =====
export const SectionDivider = ({ label }) => (
  <div className={styles.sectionDivider}>
    {label && <span className={styles.sectionDividerLabel}>{label}</span>}
  </div>
);

// ===== LOADING STATE =====
export const LoadingPage = ({ message = 'Turning the page…' }) => (
  <div className={styles.loadingPage}>
    <div className={styles.loadingBook}>📖</div>
    <p className={styles.loadingMessage}>{message}</p>
  </div>
);

// ===== GENTLE NOTE =====
export const GentleNote = ({ children }) => (
  <div className={styles.gentleNote}>
    <p>{children}</p>
  </div>
);

// ===== SCRIPT BLOCK =====
export const ScriptBlock = ({ scripts, onSelect, selectedIndex }) => (
  <div className={styles.scriptBlock}>
    {scripts.map((script, i) => (
      <button
        key={i}
        className={`${styles.scriptItem} ${selectedIndex === i ? styles.scriptItemSelected : ''}`}
        onClick={() => onSelect(i, script)}
      >
        <span className={styles.scriptQuote}>"</span>
        {script}
        <span className={styles.scriptQuote}>"</span>
      </button>
    ))}
  </div>
);

// ===== BOOKSPINE ROW (for evidence shelf) =====
export const BookSpineRow = ({ entries, onSelect }) => (
  <div className={styles.bookSpineRow}>
    {entries.map((entry) => (
      <button
        key={entry.id}
        className={`${styles.bookSpine} ${styles[`bookSpine_${entry.spineColor || 'navy'}`]}`}
        onClick={() => onSelect(entry)}
        title={entry.evidence}
      >
        <span className={styles.bookSpineText}>{entry.evidence}</span>
      </button>
    ))}
  </div>
);

// ===== MODAL =====
export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
};

// ===== CRISIS BANNER =====
export const CrisisBanner = ({ onClose }) => (
  <div className={styles.crisisBanner} role="alert">
    <div className={styles.crisisBannerInner}>
      <p className={styles.crisisBannerTitle}>A gentle note</p>
      <p className={styles.crisisBannerText}>
        This app is a private reflective space, not a crisis service.
        If you are in distress or need immediate support, please reach out to a mental health professional
        or a crisis line such as <strong>988 Suicide & Crisis Lifeline</strong> (call or text 988).
      </p>
      <Button variant="secondary" size="sm" onClick={onClose}>
        I understand
      </Button>
    </div>
  </div>
);

// ===== FILTER PILLS =====
export const FilterPills = ({ options, selected, onSelect }) => (
  <div className={styles.filterPills} role="group" aria-label="Filter entries">
    {options.map((opt) => (
      <button
        key={opt}
        className={`${styles.filterPill} ${selected === opt ? styles.filterPillActive : ''}`}
        onClick={() => onSelect(opt)}
      >
        {opt}
      </button>
    ))}
  </div>
);
