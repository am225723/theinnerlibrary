import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageWrapper, PageHeader, StepIndicator, PromptCard, PromptLabel,
  OptionGrid, ReflectionCard, Button, ButtonGroup, SaveBanner,
  StyledTextArea, GentleNote
} from '../components/SharedComponents';
import { saveEntry } from '../utils/storage';
import { getFeelingReflection } from '../data/reflections';
import styles from './FeatureScreen.module.css';

const feelings = [
  'I feel ignored', 'I feel too much pressure', 'I feel afraid of closeness',
  'I feel ashamed', 'I feel trapped', 'I feel numb',
  'I feel overwhelmed', 'I feel lonely', 'I feel disappointed', 'I do not know',
];

const needs = [
  'Reassurance', 'Space', 'Clarity', 'Gentleness', 'Permission to say no',
  'Connection without pressure', 'Rest', 'Being seen', 'Safety',
  'Time to think', 'Comfort', 'Choice', 'Support', 'Understanding',
];

export const ReadingBetweenLines = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [feeling, setFeeling] = useState('');
  const [need, setNeed] = useState('');
  const [reflection, setReflection] = useState('');
  const [notes, setNotes] = useState('');
  const [showSaved, setShowSaved] = useState(false);

  const handleFeelingSelect = (f) => {
    setFeeling(f);
    setStep(2);
  };

  const handleNeedSelect = (n) => {
    setNeed(n);
    const text = getFeelingReflection(feeling, n);
    setReflection(text);
    setStep(3);
  };

  const handleSave = () => {
    saveEntry({
      toolId: 'needs_translator',
      toolName: 'Reading Between the Lines',
      category: 'Needs',
      selectedEmotion: feeling,
      selectedNeed: need,
      generatedOutput: reflection,
      notes,
      tags: ['needs', need.toLowerCase()],
    });
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2500);
  };

  const handleReset = () => {
    setStep(1);
    setFeeling('');
    setNeed('');
    setReflection('');
    setNotes('');
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Reading Between the Lines"
        subtitle="Sometimes a feeling is carrying a need. Let's listen gently."
        icon="🌿"
        onBack={() => navigate('/')}
      />

      <StepIndicator current={step} total={3} />

      {step === 1 && (
        <PromptCard>
          <PromptLabel>Something feels off. What might be happening?</PromptLabel>
          <OptionGrid
            options={feelings}
            selected={feeling}
            onSelect={handleFeelingSelect}
            columns={1}
          />
        </PromptCard>
      )}

      {step === 2 && (
        <>
          <ReflectionCard variant="gentle">
            <p className={styles.reflectionText}>
              You noticed: <strong className={styles.reflectionEmphasis}>{feeling}</strong>.
              Let's listen to what might be underneath.
            </p>
          </ReflectionCard>
          <PromptCard>
            <PromptLabel>What need might be underneath this?</PromptLabel>
            <OptionGrid
              options={needs}
              selected={need}
              onSelect={handleNeedSelect}
              columns={2}
            />
          </PromptCard>
          <Button variant="ghost" onClick={() => setStep(1)}>
            ← Change feeling
          </Button>
        </>
      )}

      {step === 3 && (
        <>
          <ReflectionCard variant="forest">
            <p className={styles.reflectionLabel}>A need I might have:</p>
            <p className={styles.reflectionNeedBig}>{need}</p>
            <p className={styles.reflectionBody}>{reflection}</p>
          </ReflectionCard>

          <PromptCard>
            <StyledTextArea
              label="Would you like to add a note? (optional)"
              value={notes}
              onChange={setNotes}
              placeholder="Any thoughts, feelings, or observations…"
              rows={3}
            />
          </PromptCard>

          <ButtonGroup wrap>
            <Button variant="primary" onClick={handleSave} icon="🔖">
              Save to my shelf
            </Button>
            <Button variant="secondary" onClick={handleReset}>
              Try again
            </Button>
          </ButtonGroup>

          <GentleNote>
            You do not have to meet this need perfectly today. The noticing is already something.
          </GentleNote>
        </>
      )}

      <SaveBanner visible={showSaved} />
    </PageWrapper>
  );
};
