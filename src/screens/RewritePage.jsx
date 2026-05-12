import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageWrapper, PageHeader, StepIndicator, PromptCard, PromptLabel,
  OptionGrid, ReflectionCard, Button, ButtonGroup, SaveBanner,
  StyledTextArea, GentleNote, SectionDivider
} from '../components/SharedComponents';
import { saveEntry } from '../utils/storage';
import { reframeThoughts } from '../data/reflections';
import styles from './FeatureScreen.module.css';

const tones = [
  'Compassionate', 'Grounded', 'Encouraging',
  'Very gentle', 'Therapist-style', 'IFS-style', 'Brief and simple',
];

export const RewritePage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [originalThought, setOriginalThought] = useState('');
  const [tone, setTone] = useState('');
  const [reframe, setReframe] = useState(null);
  const [notes, setNotes] = useState('');
  const [showSaved, setShowSaved] = useState(false);

  const handleGenerate = (selectedTone) => {
    if (!originalThought.trim()) return;
    setTone(selectedTone);
    const result = reframeThoughts(originalThought.trim(), selectedTone);
    setReframe(result);
    setStep(3);
  };

  const handleSave = () => {
    saveEntry({
      toolId: 'cognitive_reframe',
      toolName: 'Rewrite the Page',
      category: 'Reframes',
      userInput: originalThought,
      selectedEmotion: tone,
      generatedOutput: `${reframe.rewrite}\n\nSmall next step: ${reframe.step}`,
      notes,
      tags: ['reframes', tone.toLowerCase()],
    });
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2500);
  };

  const handleTryAgain = () => {
    const result = reframeThoughts(originalThought.trim(), tone);
    setReframe(result);
  };

  const handleNewTone = (newTone) => {
    const result = reframeThoughts(originalThought.trim(), newTone);
    setTone(newTone);
    setReframe(result);
  };

  const handleReset = () => {
    setStep(1);
    setOriginalThought('');
    setTone('');
    setReframe(null);
    setNotes('');
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Rewrite the Page"
        subtitle="Some thoughts are old stories. We can write a kinder, truer line."
        icon="✍️"
        onBack={() => navigate('/')}
      />

      <StepIndicator current={step} total={3} />

      {step === 1 && (
        <>
          <PromptCard>
            <StyledTextArea
              label="What painful thought is showing up?"
              value={originalThought}
              onChange={setOriginalThought}
              placeholder="Example: I am too needy. / Something is wrong with me. / I always shut down."
              rows={4}
            />
          </PromptCard>
          <Button
            variant="primary"
            onClick={() => originalThought.trim() && setStep(2)}
            disabled={!originalThought.trim()}
            fullWidth
          >
            Continue →
          </Button>
          <GentleNote>
            You do not have to share anything you are not ready for. Write only what feels safe to work with today.
          </GentleNote>
        </>
      )}

      {step === 2 && (
        <>
          <ReflectionCard variant="gentle">
            <p className={styles.reflectionLabel}>Original line:</p>
            <p className={styles.reflectionOriginal}>"{originalThought}"</p>
          </ReflectionCard>
          <PromptCard>
            <PromptLabel>What tone would help most right now?</PromptLabel>
            <OptionGrid
              options={tones}
              selected={tone}
              onSelect={(t) => { setTone(t); handleGenerate(t); }}
              columns={2}
            />
          </PromptCard>
          <Button variant="ghost" onClick={() => setStep(1)}>← Change thought</Button>
        </>
      )}

      {step === 3 && reframe && (
        <>
          <ReflectionCard variant="gold">
            <div className={styles.reframeSection}>
              <p className={styles.reflectionLabel}>Original line:</p>
              <p className={styles.reflectionOriginal}>"{originalThought}"</p>
            </div>
            <SectionDivider />
            <div className={styles.reframeSection}>
              <p className={styles.reflectionLabel}>Rewritten page:</p>
              <p className={styles.reframeText}>{reframe.rewrite}</p>
            </div>
            <SectionDivider />
            <div className={styles.reframeSection}>
              <p className={styles.reflectionLabel}>A small next step:</p>
              <p className={styles.reframeStep}>{reframe.step}</p>
            </div>
          </ReflectionCard>

          <PromptCard>
            <PromptLabel>Try a different tone:</PromptLabel>
            <div className={styles.toneRow}>
              {tones.map((t) => (
                <button
                  key={t}
                  className={`${styles.toneChip} ${tone === t ? styles.toneChipActive : ''}`}
                  onClick={() => handleNewTone(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </PromptCard>

          <PromptCard>
            <StyledTextArea
              label="Notes (optional):"
              value={notes}
              onChange={setNotes}
              placeholder="Any reactions, thoughts, or things to remember…"
              rows={3}
            />
          </PromptCard>

          <ButtonGroup wrap>
            <Button variant="primary" onClick={handleSave} icon="🔖">
              Save rewritten page
            </Button>
            <Button variant="secondary" onClick={handleTryAgain}>
              Try again
            </Button>
            <Button variant="ghost" onClick={handleReset}>
              New thought
            </Button>
          </ButtonGroup>

          <GentleNote>
            You do not have to believe the rewrite all at once. It can be a gentle hypothesis for now.
          </GentleNote>
        </>
      )}

      <SaveBanner visible={showSaved} />
    </PageWrapper>
  );
};
