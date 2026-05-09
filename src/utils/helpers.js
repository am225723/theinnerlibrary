import { format, formatDistanceToNow, parseISO } from 'date-fns';

export const formatDate = (isoString) => {
  try {
    return format(parseISO(isoString), 'MMMM d, yyyy');
  } catch {
    return '';
  }
};

export const formatDateTime = (isoString) => {
  try {
    return format(parseISO(isoString), 'MMMM d, yyyy · h:mm a');
  } catch {
    return '';
  }
};

export const formatRelative = (isoString) => {
  try {
    return formatDistanceToNow(parseISO(isoString), { addSuffix: true });
  } catch {
    return '';
  }
};

export const formatShortDate = (isoString) => {
  try {
    return format(parseISO(isoString), 'MMM d');
  } catch {
    return '';
  }
};

// Tool metadata
export const TOOLS = {
  daily_checkin: {
    name: 'Open Today\'s Page',
    shortName: 'Today\'s Page',
    category: 'Check-In',
    color: 'navy',
    icon: '📖',
    path: '/open-todays-page',
  },
  needs_translator: {
    name: 'Reading Between the Lines',
    shortName: 'Needs Translator',
    category: 'Needs',
    color: 'forest',
    icon: '🌿',
    path: '/reading-between-the-lines',
  },
  boundary_scripts: {
    name: 'Dialogue Practice',
    shortName: 'Dialogue Practice',
    category: 'Boundaries',
    color: 'brown',
    icon: '🗣',
    path: '/dialogue-practice',
  },
  cognitive_reframe: {
    name: 'Rewrite the Page',
    shortName: 'Rewrite',
    category: 'Reframes',
    color: 'gold',
    icon: '✍️',
    path: '/rewrite-the-page',
  },
  evidence_shelf: {
    name: 'The Evidence Shelf',
    shortName: 'Evidence Shelf',
    category: 'Evidence',
    color: 'forest',
    icon: '🏺',
    path: '/evidence-shelf',
  },
  character_notes: {
    name: 'Character Notes',
    shortName: 'Character Notes',
    category: 'Parts',
    color: 'navy',
    icon: '🎭',
    path: '/character-notes',
  },
  younger_self: {
    name: 'Letters to the Younger Self',
    shortName: 'Younger Self',
    category: 'Younger Self Letters',
    color: 'warm',
    icon: '💌',
    path: '/letters-to-younger-self',
  },
  session_prep: {
    name: 'Notes for My Next Chapter',
    shortName: 'Session Prep',
    category: 'Session Prep',
    color: 'gold',
    icon: '📋',
    path: '/notes-for-next-chapter',
  },
};

export const ALL_CATEGORIES = [
  'All',
  'Needs',
  'Boundaries',
  'Reframes',
  'Evidence',
  'Parts',
  'Younger Self Letters',
  'Session Prep',
];
