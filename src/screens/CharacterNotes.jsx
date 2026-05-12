import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageWrapper, PageHeader, StepIndicator, PromptCard, PromptLabel,
  OptionGrid, ReflectionCard, Button, ButtonGroup, SaveBanner,
  StyledTextArea, GentleNote, SectionDivider
} from '../components/SharedComponents';
import { saveEntry } from '../utils/storage';
import { getPartNote } from '../data/reflections';
import styles from './FeatureScreen.module.css';

const parts = [
  'Scared Child', 'Shamed Child', 'Lonely Child', 'Inner Critic',
  'Numbing Part', 'Distractor', 'Perfectionist', 'Avoidant Part',
  'People-Pleasing Part', 'Angry Protector', 'I do not know',
];

const protections = [
  'Rejection', 'Shame', 'Being ignored', 'Being overwhelmed',
  'Needing too much', 'Being seen', 'Disappointment', 'Feeling alone',
  'Losing control', 'Conflict', 'Failure', 'Vulnerability',
];

export const CharacterNotes = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [part, setPart] = useState('');
  const [protection, setProtection] = useState('');
  const [note, setNote] = useState(null);
  const [notes, setNotes] = useState('');
  const [showSaved, setShowSaved] = useState(false);

  const handlePartSelect = (p) => {
    setPart(p);
    setStep(2);
  };

  const handleProtectionSelect = (pr) => {
    setProtection(pr);
    const result = getPartNote(part, pr);
    setNote(result);
    setStep(3);
  };

  const handleSave = () => {
    saveEntry({
      toolId: 'character_notes',
      toolName: 'Character Notes',
      category: 'Parts',
      userInput: part,
      selectedEmotion: protection,
      selectedPart: part,
      generatedOutput: note
        ? `${note.trying}\n\nAppreciation: ${note.appreciation}\n\nSelf-led: ${note.selfLed}`
        : '',
      notes,
      tags: ['parts', part.toLowerCase().replace(/\s+/g, '-')],
    });
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2500);
  };

  const handleReset = () => {
    setStep(1);
    setPart('');
    setProtection('');
    setNote(null);
    setNotes('');
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Character Notes"
        subtitle="Every part has a story. We can listen without letting it take over."
        icon="🎭"
        onBack={() => navigate('/')}
      />

      <StepIndicator current={step} total={3} />

      {step === 1 && (
        <PromptCard>
          <PromptLabel>Which part feels active today?</PromptLabel>
          <OptionGrid
            options={parts}
            selected={part}
            onSelect={handlePartSelect}
            columns={2}
          />
        </PromptCard>
      )}

      {step === 2 && (
        <>
          <ReflectionCard variant="gentle">
            <p className={styles.reflectionText}>
              Part present: <strong className={styles.reflectionEmphasis}>{part}</strong>
            </p>
          </ReflectionCard>
          <PromptCard>
            <PromptLabel>What might this part be trying to protect you from?</PromptLabel>
            <OptionGrid
              options={protections}
              selected={protection}
              onSelect={handleProtectionSelect}
              columns={2}
            />
          </PromptCard>
          <Button variant="ghost" onClick={() => setStep(1)}>← Change part</Button>
        </>
      )}

      {step === 3 && note && (
        <>
          <ReflectionCard variant="navy">
            <div className={styles.partSection}>
              <p className={styles.partLabel}>Part:</p>
              <p className={styles.partName}>{part}</p>
            </div>
            <SectionDivider />
            <div className={styles.partSection}>
              <p className={styles.partLabel}>What this part may be trying to do:</p>
              <p className={styles.partBody}>{note.trying}</p>
            </div>
            <SectionDivider />
            <div className={styles.partSection}>
              <p className={styles.partLabel}>A note of appreciation:</p>
              <p className={`${styles.partBody} ${styles.partAppreciation}`}>{note.appreciation}</p>
            </div>
            <SectionDivider />
            <div className={styles.partSection}>
              <p className={styles.partLabel}>A Self-led response:</p>
              <p className={`${styles.partBody} ${styles.partSelfLed}`}>{note.selfLed}</p>
            </div>
          </ReflectionCard>

          <PromptCard>
            <StyledTextArea
              label="Notes (optional):"
              value={notes}
              onChange={setNotes}
              placeholder="Any observations about this part today…"
              rows={3}
            />
          </PromptCard>

          <ButtonGroup wrap>
            <Button variant="primary" onClick={handleSave} icon="🔖">
              Save character note
            </Button>
            <Button variant="ghost" onClick={handleReset}>
              Explore another part
            </Button>
          </ButtonGroup>

          <GentleNote>
            A part of you may be trying to protect you. We can listen without letting it run the show.
          </GentleNote>
        </>
      )}

      <SaveBanner visible={showSaved} />
    </PageWrapper>
  );
};
