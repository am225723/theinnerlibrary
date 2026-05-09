import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageWrapper, PageHeader, StepIndicator, PromptCard, PromptLabel,
  OptionGrid, ReflectionCard, Button, ButtonGroup, SaveBanner,
  StyledTextArea, GentleNote
} from '../components/SharedComponents';
import { saveEntry } from '../utils/storage';
import styles from './FeatureScreen.module.css';

const recipients = [
  'Scared younger me', 'Shamed younger me', 'Lonely younger me',
  'Younger me who felt invisible', 'Younger me who felt too much',
  'Younger me who had to be okay', 'Younger me who needed protection',
  'I am not sure',
];

const starters = [
  'Dear younger me, I want you to know…',
  'You did not deserve…',
  'It makes sense that you felt…',
  'I am sorry you had to…',
  'You are not alone now because…',
  'I am learning how to…',
  'Today, I want to offer you…',
];

const supportPhrases = [
  'Nothing is wrong with you.',
  'Your needs make sense.',
  'You do not have to be perfect to be loved.',
  'You are allowed to go slowly.',
  'You deserved comfort.',
  'You deserved protection.',
  'You are not too much.',
  'I am learning how to listen to you.',
  'We do not have to force anything today.',
];

export const LettersToYoungerSelf = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [recipient, setRecipient] = useState('');
  const [letterText, setLetterText] = useState('');
  const [showSaved, setShowSaved] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleRecipientSelect = (r) => {
    setRecipient(r);
    setStep(2);
  };

  const handleStarterClick = (starter) => {
    setLetterText((prev) =>
      prev ? prev + '\n\n' + starter + ' ' : starter + ' '
    );
  };

  const handlePhraseClick = (phrase) => {
    setLetterText((prev) =>
      prev ? prev + ' ' + phrase : phrase
    );
  };

  const handleSave = () => {
    saveEntry({
      toolId: 'younger_self',
      toolName: 'Letters to the Younger Self',
      category: 'Younger Self Letters',
      userInput: letterText,
      selectedEmotion: recipient,
      generatedOutput: letterText,
      tags: ['younger-self', recipient.toLowerCase().replace(/\s+/g, '-')],
    });
    setShowSaved(true);
    setSaved(true);
    setTimeout(() => setShowSaved(false), 2500);
  };

  const handleReset = () => {
    setStep(1);
    setRecipient('');
    setLetterText('');
    setSaved(false);
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Letters to the Younger Self"
        subtitle="Some younger pages still need a kind voice."
        icon="💌"
        onBack={() => navigate('/')}
      />

      <StepIndicator current={step} total={2} />

      {step === 1 && (
        <>
          <GentleNote>
            This space is gentle. You do not have to revisit anything painful. Stay with what feels safe to work with today.
          </GentleNote>
          <PromptCard>
            <PromptLabel>Who needs a letter today?</PromptLabel>
            <OptionGrid
              options={recipients}
              selected={recipient}
              onSelect={handleRecipientSelect}
              columns={1}
            />
          </PromptCard>
        </>
      )}

      {step === 2 && (
        <>
          <ReflectionCard variant="warm">
            <p className={styles.reflectionText}>
              A letter for: <strong className={styles.reflectionEmphasis}>{recipient}</strong>
            </p>
          </ReflectionCard>

          {/* Writing starters */}
          <PromptCard>
            <PromptLabel>Choose a writing starter to begin (optional):</PromptLabel>
            <div className={styles.starterList}>
              {starters.map((s) => (
                <button
                  key={s}
                  className={styles.starterBtn}
                  onClick={() => handleStarterClick(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </PromptCard>

          {/* Letter textarea */}
          <PromptCard>
            <StyledTextArea
              label="Your letter:"
              value={letterText}
              onChange={setLetterText}
              placeholder="Write at your own pace. There is no right way to do this."
              rows={8}
            />
          </PromptCard>

          {/* Support phrases */}
          <PromptCard>
            <PromptLabel>Add a supportive phrase (optional):</PromptLabel>
            <div className={styles.phraseCloud}>
              {supportPhrases.map((phrase) => (
                <button
                  key={phrase}
                  className={styles.phraseChip}
                  onClick={() => handlePhraseClick(phrase)}
                >
                  {phrase}
                </button>
              ))}
            </div>
          </PromptCard>

          <ButtonGroup wrap>
            <Button
              variant="primary"
              onClick={handleSave}
              icon="🔖"
              disabled={!letterText.trim()}
            >
              Save this letter
            </Button>
            <Button variant="ghost" onClick={handleReset}>
              Write another
            </Button>
          </ButtonGroup>

          {saved && (
            <ReflectionCard variant="gentle">
              <p className={styles.reflectionBody}>
                This letter can be enough for today. You do not have to finish the whole story at once.
              </p>
            </ReflectionCard>
          )}

          <GentleNote>
            Go gently. You do not have to process anything deeply today. One sentence can be enough.
          </GentleNote>
        </>
      )}

      <SaveBanner visible={showSaved} />
    </PageWrapper>
  );
};
