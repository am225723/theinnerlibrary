import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageWrapper, PageHeader, StepIndicator, PromptCard, PromptLabel,
  OptionGrid, ReflectionCard, Button, ButtonGroup, SaveBanner,
  StyledTextArea, ScriptBlock, GentleNote
} from '../components/SharedComponents';
import { saveEntry } from '../utils/storage';
import { boundaryScripts } from '../data/reflections';
import styles from './FeatureScreen.module.css';

const boundaryTypes = [
  'I need more time', 'I need space', 'I need to say no',
  'I need to pause a conversation', 'I need emotional safety',
  'I need less pressure', 'I need to express a need',
  'I need to leave or step away', 'I am not sure',
];

const tones = ['Soft', 'Clear', 'Warm', 'Firm', 'Very brief'];

export const DialoguePractice = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [boundaryType, setBoundaryType] = useState('');
  const [tone, setTone] = useState('');
  const [scripts, setScripts] = useState([]);
  const [selectedScriptIdx, setSelectedScriptIdx] = useState(null);
  const [editedScript, setEditedScript] = useState('');
  const [notes, setNotes] = useState('');
  const [showSaved, setShowSaved] = useState(false);

  const handleBoundarySelect = (b) => {
    setBoundaryType(b);
    setStep(2);
  };

  const handleToneSelect = (t) => {
    setTone(t);
    const typeScripts = boundaryScripts[boundaryType];
    const generated = typeScripts?.[t] || typeScripts?.['Soft'] || [
      'I need a moment before I can respond.',
      'Something does not feel right here.',
      'I need to pause and take care of myself.',
    ];
    setScripts(generated);
    setSelectedScriptIdx(null);
    setEditedScript('');
    setStep(3);
  };

  const handleScriptSelect = (idx, script) => {
    setSelectedScriptIdx(idx);
    setEditedScript(script);
  };

  const handleTryAnotherTone = () => {
    setStep(2);
    setSelectedScriptIdx(null);
    setEditedScript('');
  };

  const handleSave = () => {
    saveEntry({
      toolId: 'boundary_scripts',
      toolName: 'Dialogue Practice',
      category: 'Boundaries',
      userInput: boundaryType,
      selectedEmotion: boundaryType,
      generatedOutput: scripts.join('\n'),
      notes: editedScript ? `Selected: "${editedScript}"\n${notes}` : notes,
      tags: ['boundaries', tone.toLowerCase()],
    });
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2500);
  };

  const handleReset = () => {
    setStep(1);
    setBoundaryType('');
    setTone('');
    setScripts([]);
    setSelectedScriptIdx(null);
    setEditedScript('');
    setNotes('');
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Dialogue Practice"
        subtitle="You can practice the line before you have to say it out loud."
        icon="🗣"
        onBack={() => navigate('/')}
      />

      <StepIndicator current={step} total={3} />

      {step === 1 && (
        <PromptCard>
          <PromptLabel>What kind of boundary do you need?</PromptLabel>
          <OptionGrid
            options={boundaryTypes}
            selected={boundaryType}
            onSelect={handleBoundarySelect}
            columns={1}
          />
        </PromptCard>
      )}

      {step === 2 && (
        <>
          <ReflectionCard variant="gentle">
            <p className={styles.reflectionText}>
              Boundary: <strong className={styles.reflectionEmphasis}>{boundaryType}</strong>
            </p>
            <p className={styles.reflectionNote}>Now choose a tone that would feel usable for you.</p>
          </ReflectionCard>
          <PromptCard>
            <PromptLabel>What tone would feel most usable?</PromptLabel>
            <OptionGrid
              options={tones}
              selected={tone}
              onSelect={handleToneSelect}
              columns={3}
            />
          </PromptCard>
          <Button variant="ghost" onClick={() => setStep(1)}>← Change boundary</Button>
        </>
      )}

      {step === 3 && (
        <>
          <ReflectionCard variant="navy">
            <p className={styles.reflectionLabel}>Scripts for:</p>
            <p className={styles.reflectionNeedBig}>{boundaryType}</p>
            <p className={styles.reflectionNote}>Tone: <em>{tone}</em> · Select one to work with</p>
          </ReflectionCard>

          <PromptCard>
            <PromptLabel>Choose a script to practice:</PromptLabel>
            <ScriptBlock
              scripts={scripts}
              onSelect={handleScriptSelect}
              selectedIndex={selectedScriptIdx}
            />
          </PromptCard>

          {selectedScriptIdx !== null && (
            <PromptCard>
              <StyledTextArea
                label="Edit to make it feel more like you:"
                value={editedScript}
                onChange={setEditedScript}
                placeholder="Adjust the wording until it feels right…"
                rows={3}
              />
            </PromptCard>
          )}

          <PromptCard>
            <StyledTextArea
              label="Notes (optional):"
              value={notes}
              onChange={setNotes}
              placeholder="Any thoughts about when or how you might use this…"
              rows={2}
            />
          </PromptCard>

          <ButtonGroup wrap>
            <Button variant="primary" onClick={handleSave} icon="🔖">
              Save to my dialogue pages
            </Button>
            <Button variant="secondary" onClick={handleTryAnotherTone}>
              Try another tone
            </Button>
            <Button variant="ghost" onClick={handleReset}>
              Start over
            </Button>
          </ButtonGroup>

          <GentleNote>
            You do not have to use this script perfectly. Even reading it is practice.
          </GentleNote>
        </>
      )}

      <SaveBanner visible={showSaved} />
    </PageWrapper>
  );
};
