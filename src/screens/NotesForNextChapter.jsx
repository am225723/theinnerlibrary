import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageWrapper, PageHeader, PromptCard, PromptLabel,
  OptionGrid, ReflectionCard, Button, ButtonGroup, SaveBanner,
  GentleNote, SectionDivider, LoadingPage, StyledTextArea
} from '../components/SharedComponents';
import { getEntriesByDateRange, getEntriesByCustomRange, saveEntry } from '../utils/storage';
import styles from './FeatureScreen.module.css';

const dateRangeOptions = ['Past 7 days', 'Past 14 days', 'Past 30 days', 'Custom range'];

const generateTherapyPrompts = (summary) => {
  const prompts = [];
  if (summary.needs.length > 0) {
    prompts.push(`I noticed I often feel ${summary.feelings[0] || 'uncertain'} when I need ${summary.needs[0] || 'support'}.`);
  }
  if (summary.parts.length > 0) {
    prompts.push(`I want to talk about the ${summary.parts[0]} and what it might be protecting.`);
  }
  if (summary.boundaries.length > 0) {
    prompts.push(`I want help practicing how to name needs without feeling like too much.`);
  }
  if (summary.reframes.length > 0) {
    prompts.push(`I noticed some old stories I want to keep rewriting with support.`);
  }
  if (summary.youngerSelf.length > 0) {
    prompts.push(`I want to understand the younger parts that came up for me this period.`);
  }
  if (prompts.length < 3) {
    prompts.push(`I want to understand why closeness feels both wanted and scary.`);
    prompts.push(`I want to talk about what it feels like to have a need.`);
  }
  return prompts.slice(0, 5);
};

const buildSummary = (entries) => {
  const feelings = [];
  const needs = [];
  const parts = [];
  const boundaries = [];
  const reframes = [];
  const evidence = [];
  const youngerSelf = [];

  entries.forEach((e) => {
    if (e.selectedEmotion && !feelings.includes(e.selectedEmotion)) feelings.push(e.selectedEmotion);
    if (e.selectedNeed && !needs.includes(e.selectedNeed)) needs.push(e.selectedNeed);
    if (e.selectedPart && !parts.includes(e.selectedPart)) parts.push(e.selectedPart);
    if (e.toolId === 'boundary_scripts') boundaries.push(e);
    if (e.toolId === 'cognitive_reframe') reframes.push(e);
    if (e.toolId === 'evidence_shelf') evidence.push(e);
    if (e.toolId === 'younger_self') youngerSelf.push(e);
  });

  return { feelings, needs, parts, boundaries, reframes, evidence, youngerSelf };
};

export const NotesForNextChapter = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [therapyPrompts, setTherapyPrompts] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');

  const handleDateRangeSelect = (range) => {
    setDateRange(range);
    if (range !== 'Custom range') {
      generateSummary(range);
    }
  };

  const generateSummary = (range) => {
    setLoading(true);
    setTimeout(() => {
      let entries;
      if (range === 'Past 7 days') entries = getEntriesByDateRange(7);
      else if (range === 'Past 14 days') entries = getEntriesByDateRange(14);
      else if (range === 'Past 30 days') entries = getEntriesByDateRange(30);
      else if (range === 'Custom range' && customStart && customEnd) {
        entries = getEntriesByCustomRange(customStart, customEnd);
      } else entries = getEntriesByDateRange(7);

      const s = buildSummary(entries);
      const prompts = generateTherapyPrompts(s);
      setSummary(s);
      setTherapyPrompts(prompts);
      setLoading(false);
    }, 800);
  };

  const handleSave = () => {
    if (!summary) return;
    saveEntry({
      toolId: 'session_prep',
      toolName: 'Notes for My Next Chapter',
      category: 'Session Prep',
      userInput: dateRange,
      generatedOutput: JSON.stringify({ summary, therapyPrompts }),
      notes: additionalNotes,
      tags: ['session-prep'],
    });
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2500);
  };

  const handleCopy = () => {
    if (!summary) return;
    const text = `
My Inner Library — Session Notes
Generated: ${new Date().toLocaleDateString()}

Themes I Noticed:
${summary.feelings.join(', ') || 'None recorded'}

Needs That Came Up:
${summary.needs.join(', ') || 'None recorded'}

Parts That Felt Active:
${summary.parts.join(', ') || 'None recorded'}

Evidence of Self-Respect:
${summary.evidence.map(e => e.selectedEmotion || e.userInput).join(', ') || 'None recorded'}

Boundaries I Practiced:
${summary.boundaries.length} boundary script(s) saved

Thoughts I Rewrote:
${summary.reframes.length} reframe(s) saved

Younger Parts That Needed Care:
${summary.youngerSelf.length} letter(s) written

What I May Want to Bring Into Therapy:
${therapyPrompts.map((p, i) => `${i + 1}. ${p}`).join('\n')}

${additionalNotes ? `Additional notes:\n${additionalNotes}` : ''}
`.trim();
    navigator.clipboard?.writeText(text).catch(() => {});
  };

  if (loading) return <LoadingPage message="Gathering your pages…" />;

  return (
    <PageWrapper>
      <PageHeader
        title="Notes for My Next Chapter"
        subtitle="Gather the pages you may want support with."
        icon="📋"
        onBack={() => navigate('/')}
      />

      <GentleNote>
        Here are a few pages your system may want support with. This is a gentle gathering, not a diagnostic summary.
      </GentleNote>

      <PromptCard>
        <PromptLabel>Choose a time range:</PromptLabel>
        <OptionGrid
          options={dateRangeOptions}
          selected={dateRange}
          onSelect={handleDateRangeSelect}
          columns={2}
        />
      </PromptCard>

      {dateRange === 'Custom range' && (
        <PromptCard>
          <div className={styles.dateRangeRow}>
            <div className={styles.dateInput}>
              <label className={styles.dateLabel}>From</label>
              <input
                type="date"
                className={styles.dateField}
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
            </div>
            <div className={styles.dateInput}>
              <label className={styles.dateLabel}>To</label>
              <input
                type="date"
                className={styles.dateField}
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => generateSummary('Custom range')}
            disabled={!customStart || !customEnd}
            fullWidth
          >
            Generate summary
          </Button>
        </PromptCard>
      )}

      {summary && (
        <>
          <ReflectionCard variant="navy">
            <p className={styles.summaryTitle}>Your summary — {dateRange}</p>
          </ReflectionCard>

          {/* Themes */}
          <div className={styles.summarySection}>
            <h3 className={styles.summarySectionTitle}>📝 Themes I Noticed</h3>
            {summary.feelings.length > 0 ? (
              <div className={styles.tagCloud}>
                {summary.feelings.map((f) => (
                  <span key={f} className={styles.summaryTag}>{f}</span>
                ))}
              </div>
            ) : (
              <p className={styles.summaryEmpty}>No themes recorded in this period.</p>
            )}
          </div>

          <SectionDivider />

          {/* Needs */}
          <div className={styles.summarySection}>
            <h3 className={styles.summarySectionTitle}>🌿 Needs That Came Up</h3>
            {summary.needs.length > 0 ? (
              <div className={styles.tagCloud}>
                {summary.needs.map((n) => (
                  <span key={n} className={`${styles.summaryTag} ${styles.summaryTagForest}`}>{n}</span>
                ))}
              </div>
            ) : (
              <p className={styles.summaryEmpty}>No needs recorded.</p>
            )}
          </div>

          <SectionDivider />

          {/* Parts */}
          <div className={styles.summarySection}>
            <h3 className={styles.summarySectionTitle}>🎭 Parts That Felt Active</h3>
            {summary.parts.length > 0 ? (
              <div className={styles.tagCloud}>
                {summary.parts.map((p) => (
                  <span key={p} className={`${styles.summaryTag} ${styles.summaryTagBrown}`}>{p}</span>
                ))}
              </div>
            ) : (
              <p className={styles.summaryEmpty}>No parts recorded.</p>
            )}
          </div>

          <SectionDivider />

          {/* Boundaries */}
          <div className={styles.summarySection}>
            <h3 className={styles.summarySectionTitle}>🗣 Boundaries I Practiced</h3>
            {summary.boundaries.length > 0 ? (
              <p className={styles.summaryCount}>
                {summary.boundaries.length} boundary script{summary.boundaries.length !== 1 ? 's' : ''} saved
              </p>
            ) : (
              <p className={styles.summaryEmpty}>No boundary scripts saved.</p>
            )}
          </div>

          <SectionDivider />

          {/* Reframes */}
          <div className={styles.summarySection}>
            <h3 className={styles.summarySectionTitle}>✍️ Thoughts I Rewrote</h3>
            {summary.reframes.length > 0 ? (
              summary.reframes.slice(0, 3).map((r) => (
                <div key={r.id} className={styles.reframeSummaryCard}>
                  <p className={styles.reframeSummaryOrig}>Original: "{r.userInput}"</p>
                </div>
              ))
            ) : (
              <p className={styles.summaryEmpty}>No reframes saved.</p>
            )}
          </div>

          <SectionDivider />

          {/* Evidence */}
          <div className={styles.summarySection}>
            <h3 className={styles.summarySectionTitle}>🏺 Evidence of Self-Respect</h3>
            {summary.evidence.length > 0 ? (
              <div className={styles.tagCloud}>
                {summary.evidence.map((e) => (
                  <span key={e.id} className={`${styles.summaryTag} ${styles.summaryTagGold}`}>
                    {e.selectedEmotion || e.userInput}
                  </span>
                ))}
              </div>
            ) : (
              <p className={styles.summaryEmpty}>No evidence entries saved.</p>
            )}
          </div>

          <SectionDivider />

          {/* Younger self */}
          <div className={styles.summarySection}>
            <h3 className={styles.summarySectionTitle}>💌 Younger Parts That Needed Care</h3>
            {summary.youngerSelf.length > 0 ? (
              <p className={styles.summaryCount}>
                {summary.youngerSelf.length} letter{summary.youngerSelf.length !== 1 ? 's' : ''} written
              </p>
            ) : (
              <p className={styles.summaryEmpty}>No letters written.</p>
            )}
          </div>

          <SectionDivider />

          {/* Therapy prompts */}
          <div className={styles.summarySection}>
            <h3 className={styles.summarySectionTitle}>💬 What I May Want to Bring Into Therapy</h3>
            <div className={styles.therapyPrompts}>
              {therapyPrompts.map((prompt, i) => (
                <div key={i} className={styles.therapyPrompt}>
                  <span className={styles.therapyPromptNum}>{i + 1}</span>
                  <p className={styles.therapyPromptText}>"{prompt}"</p>
                </div>
              ))}
            </div>
          </div>

          <PromptCard>
            <StyledTextArea
              label="Additional notes for your therapist (optional):"
              value={additionalNotes}
              onChange={setAdditionalNotes}
              placeholder="Anything else you want to remember to bring up…"
              rows={3}
            />
          </PromptCard>

          <ButtonGroup wrap>
            <Button variant="primary" onClick={handleSave} icon="🔖">
              Save summary
            </Button>
            <Button variant="secondary" onClick={handleCopy} icon="📋">
              Copy summary
            </Button>
          </ButtonGroup>

          <GentleNote>
            You can return to this page anytime. You do not have to bring everything at once.
          </GentleNote>
        </>
      )}

      <SaveBanner visible={showSaved} />
    </PageWrapper>
  );
};
