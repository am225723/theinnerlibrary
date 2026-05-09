import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageWrapper, PageHeader, PromptCard, PromptLabel,
  OptionGrid, ReflectionCard, Button, ButtonGroup, SaveBanner,
  StyledTextArea, GentleNote, EmptyState, FilterPills, BookmarkCard
} from '../components/SharedComponents';
import { saveEntry, getEntriesByTool, toggleBookmark, deleteEntry } from '../utils/storage';
import { evidenceReflections } from '../data/reflections';
import { formatShortDate } from '../utils/helpers';
import styles from './FeatureScreen.module.css';

const evidenceOptions = [
  'I noticed a need', 'I set a boundary', 'I rested',
  'I paused before reacting', 'I survived something hard', 'I let myself want something',
  'I did not abandon myself', 'I asked for clarity', 'I left an overwhelming situation',
  'I was honest with myself', 'I tried again', 'I let something be imperfect',
  'I reached out', 'I protected my peace',
];

const spineColors = ['navy', 'forest', 'brown', 'gold', 'warm', 'forest', 'navy', 'brown', 'gold', 'warm', 'navy', 'forest', 'brown', 'gold'];

const filterOptions = ['All', 'Needs', 'Boundaries', 'Rest', 'Courage', 'Honesty', 'Self-protection', 'Survival'];

const filterMap = {
  'All': null,
  'Needs': ['I noticed a need', 'I asked for clarity'],
  'Boundaries': ['I set a boundary', 'I left an overwhelming situation', 'I protected my peace'],
  'Rest': ['I rested'],
  'Courage': ['I survived something hard', 'I tried again', 'I reached out'],
  'Honesty': ['I was honest with myself'],
  'Self-protection': ['I did not abandon myself', 'I left an overwhelming situation', 'I protected my peace'],
  'Survival': ['I survived something hard', 'I tried again'],
};

export const EvidenceShelf = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('shelf'); // 'shelf' or 'add'
  const [evidence, setEvidence] = useState('');
  const [reflection, setReflection] = useState('');
  const [userSentence, setUserSentence] = useState('');
  const [showSaved, setShowSaved] = useState(false);
  const [entries, setEntries] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    const all = getEntriesByTool('evidence_shelf');
    setEntries(all);
  };

  const handleEvidenceSelect = (e) => {
    setEvidence(e);
    setReflection(evidenceReflections[e] || 'This counts. You were on your own side today.');
  };

  const handleSave = () => {
    saveEntry({
      toolId: 'evidence_shelf',
      toolName: 'The Evidence Shelf',
      category: 'Evidence',
      userInput: userSentence || evidence,
      selectedEmotion: evidence,
      generatedOutput: reflection,
      notes: userSentence,
      tags: ['evidence', evidence.toLowerCase()],
      evidence,
      spineColor: spineColors[evidenceOptions.indexOf(evidence) % spineColors.length],
    });
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2500);
    setTimeout(() => {
      setEvidence('');
      setReflection('');
      setUserSentence('');
      setMode('shelf');
      loadEntries();
    }, 1800);
  };

  const filteredEntries = entries.filter((e) => {
    if (activeFilter === 'All') return true;
    const allowed = filterMap[activeFilter] || [];
    return allowed.some((a) => e.selectedEmotion?.includes(a) || e.userInput?.includes(a));
  });

  const handleToggleBookmark = (id) => {
    toggleBookmark(id);
    loadEntries();
  };

  const handleDelete = (id) => {
    deleteEntry(id);
    loadEntries();
    setSelectedEntry(null);
  };

  // Visual shelf
  const ShelfView = () => (
    <>
      <div className={styles.shelfHeader}>
        <h2 className={styles.shelfTitle}>Your Evidence Shelf</h2>
        <Button variant="gold" size="sm" onClick={() => setMode('add')} icon="＋">
          Add evidence
        </Button>
      </div>

      <FilterPills
        options={filterOptions}
        selected={activeFilter}
        onSelect={setActiveFilter}
      />

      {filteredEntries.length === 0 ? (
        <EmptyState
          message="No pages saved yet. One small reflection can begin the shelf."
          icon="🏺"
        />
      ) : (
        <>
          {/* Book spine visual */}
          <div className={styles.evidenceSpineShelf}>
            <div className={styles.evidenceSpineRow}>
              {filteredEntries.slice(0, 8).map((entry, i) => (
                <button
                  key={entry.id}
                  className={`${styles.evidenceSpine} ${styles[`evidenceSpine_${entry.spineColor || 'navy'}`]}`}
                  onClick={() => setSelectedEntry(entry)}
                  title={entry.selectedEmotion || entry.userInput}
                >
                  <span className={styles.evidenceSpineText}>
                    {entry.selectedEmotion || 'Note'}
                  </span>
                </button>
              ))}
            </div>
            <div className={styles.evidenceShelfPlank} />
          </div>

          {/* Card list */}
          <div className={styles.entryList}>
            {filteredEntries.map((entry) => (
              <div key={entry.id} className={styles.evidenceCard}>
                <div className={styles.evidenceCardTop}>
                  <span className={styles.evidenceTag}>{entry.selectedEmotion}</span>
                  <span className={styles.evidenceDate}>{formatShortDate(entry.date)}</span>
                </div>
                {entry.generatedOutput && (
                  <p className={styles.evidenceReflection}>{entry.generatedOutput}</p>
                )}
                {entry.notes && (
                  <p className={styles.evidenceNote}>"{entry.notes}"</p>
                )}
                <button
                  className={styles.evidenceDeleteBtn}
                  onClick={() => handleDelete(entry.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );

  const AddView = () => (
    <>
      <ReflectionCard variant="gentle">
        <p className={styles.reflectionText}>
          Collect small proof that you are learning to be on your own side.
        </p>
      </ReflectionCard>

      <PromptCard>
        <PromptLabel>What is one small piece of evidence that you were on your own side today?</PromptLabel>
        <OptionGrid
          options={evidenceOptions}
          selected={evidence}
          onSelect={handleEvidenceSelect}
          columns={1}
        />
      </PromptCard>

      {evidence && (
        <>
          <ReflectionCard variant="forest">
            <p className={styles.reflectionBody}>{reflection}</p>
            <p className={styles.reflectionMicro}>This counts. Small evidence is still evidence.</p>
          </ReflectionCard>

          <PromptCard>
            <StyledTextArea
              label="Today I was on my own side when… (optional)"
              value={userSentence}
              onChange={setUserSentence}
              placeholder="Today I was on my own side when…"
              rows={3}
            />
          </PromptCard>

          <ButtonGroup wrap>
            <Button variant="primary" onClick={handleSave} icon="🔖">
              Save to my shelf
            </Button>
            <Button variant="ghost" onClick={() => { setEvidence(''); setReflection(''); }}>
              Choose different
            </Button>
          </ButtonGroup>
        </>
      )}

      <Button variant="ghost" onClick={() => setMode('shelf')}>
        ← Return to shelf
      </Button>

      <GentleNote>
        You do not have to force confidence. You are collecting proof of care.
      </GentleNote>
    </>
  );

  return (
    <PageWrapper>
      <PageHeader
        title="The Evidence Shelf"
        subtitle="Collect small proof that you are learning to be on your own side."
        icon="🏺"
        onBack={() => navigate('/')}
      />

      {mode === 'shelf' ? <ShelfView /> : <AddView />}

      <SaveBanner visible={showSaved} />
    </PageWrapper>
  );
};
