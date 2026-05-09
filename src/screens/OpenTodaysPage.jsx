import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageWrapper, PageHeader, StepIndicator, PromptCard, PromptLabel,
  OptionGrid, ReflectionCard, Button, ButtonGroup, SaveBanner, GentleNote
} from '../components/SharedComponents';
import { saveEntry } from '../utils/storage';
import styles from './FeatureScreen.module.css';

const feelings = [
  'Calm', 'Numb', 'Ashamed', 'Overwhelmed', 'Lonely',
  'Guarded', 'Afraid of closeness', 'Pressured', 'Unsure', 'I do not know',
];

const helpOptions = [
  { label: 'Understand a need', path: '/reading-between-the-lines' },
  { label: 'Practice a boundary', path: '/dialogue-practice' },
  { label: 'Rewrite a painful thought', path: '/rewrite-the-page' },
  { label: 'Appreciate a part', path: '/character-notes' },
  { label: 'Save one small win', path: '/evidence-shelf' },
  { label: 'Write to my younger self', path: '/letters-to-younger-self' },
  { label: 'Prepare for therapy', path: '/notes-for-next-chapter' },
];

export const OpenTodaysPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [feeling, setFeeling] = useState('');
  const [help, setHelp] = useState('');
  const [showTransition, setShowTransition] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [notes, setNotes] = useState('');

  const handleFeelingSelect = (f) => {
    setFeeling(f);
    setStep(2);
  };

  const handleHelpSelect = (option) => {
    setHelp(option.label);
    setShowTransition(true);

    // Save entry
    saveEntry({
      toolId: 'daily_checkin',
      toolName: "Open Today's Page",
      category: 'Check-In',
      selectedEmotion: feeling,
      generatedOutput: `Feeling: ${feeling} → ${option.label}`,
      userInput: feeling,
      notes,
    });

    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2500);

    setTimeout(() => navigate(option.path), 2200);
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Open Today's Page"
        subtitle="What page are you on today?"
        icon="📖"
        onBack={() => navigate('/')}
      />

      <StepIndicator current={step} total={2} />

      {step === 1 && (
        <PromptCard>
          <PromptLabel>What feels most present right now?</PromptLabel>
          <OptionGrid
            options={feelings}
            selected={feeling}
            onSelect={handleFeelingSelect}
            columns={2}
          />
        </PromptCard>
      )}

      {step === 2 && !showTransition && (
        <>
          <ReflectionCard variant="gentle">
            <p className={styles.reflectionText}>
              You noticed: <strong className={styles.reflectionEmphasis}>{feeling}</strong>.
              That is enough to work with.
            </p>
          </ReflectionCard>

          <PromptCard>
            <PromptLabel>What would help most right now?</PromptLabel>
            <div className={styles.helpOptions}>
              {helpOptions.map((option) => (
                <button
                  key={option.label}
                  className={styles.helpOption}
                  onClick={() => handleHelpSelect(option)}
                >
                  <span className={styles.helpOptionText}>{option.label}</span>
                  <span className={styles.helpOptionArrow}>→</span>
                </button>
              ))}
            </div>
          </PromptCard>

          <ButtonGroup>
            <Button variant="ghost" onClick={() => setStep(1)}>
              ← Change feeling
            </Button>
          </ButtonGroup>
        </>
      )}

      {showTransition && (
        <ReflectionCard variant="gentle" className={styles.transitionCard}>
          <p className={styles.transitionText}>
            Thank you for noticing.
          </p>
          <p className={styles.transitionSubtext}>
            We can go one page at a time.
          </p>
          <p className={styles.transitionMini}>Turning the page…</p>
        </ReflectionCard>
      )}

      <GentleNote>
        You do not have to figure everything out in this check-in. One small noticing is enough.
      </GentleNote>

      <SaveBanner visible={showSaved} />
    </PageWrapper>
  );
};
