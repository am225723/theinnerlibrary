import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './screens/HomeScreen';
import { Library3D } from './screens/Library3D';
import { OpenTodaysPage } from './screens/OpenTodaysPage';
import { ReadingBetweenLines } from './screens/ReadingBetweenLines';
import { DialoguePractice } from './screens/DialoguePractice';
import { RewritePage } from './screens/RewritePage';
import { EvidenceShelf } from './screens/EvidenceShelf';
import { CharacterNotes } from './screens/CharacterNotes';
import { LettersToYoungerSelf } from './screens/LettersToYoungerSelf';
import { NotesForNextChapter } from './screens/NotesForNextChapter';
import { MyLibrary } from './screens/MyLibrary';
import { SettingsScreen } from './screens/SettingsScreen';
import { LoginScreen } from './screens/LoginScreen';
import { AdminScreen } from './screens/AdminScreen';
import './index.css';

// Layout wrapper for standard mobile screens
const MobileLayout = ({ children }) => (
  <div style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh', position: 'relative', backgroundColor: 'var(--color-cream)' }}>
    {children}
    <BottomNav />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 3D Library is the main/default view - full screen */}
          <Route path="/" element={<Library3D />} />
          
          {/* Classic 2D view */}
          <Route path="/classic" element={<MobileLayout><HomeScreen /></MobileLayout>} />
          
          {/* Settings - full screen for customization & account */}
          <Route path="/settings" element={<SettingsScreen />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/admin" element={<AdminScreen />} />
          
          {/* Tool routes wrapped in mobile container */}
          <Route path="/open-todays-page" element={<MobileLayout><OpenTodaysPage /></MobileLayout>} />
          <Route path="/reading-between-the-lines" element={<MobileLayout><ReadingBetweenLines /></MobileLayout>} />
          <Route path="/dialogue-practice" element={<MobileLayout><DialoguePractice /></MobileLayout>} />
          <Route path="/rewrite-the-page" element={<MobileLayout><RewritePage /></MobileLayout>} />
          <Route path="/evidence-shelf" element={<MobileLayout><EvidenceShelf /></MobileLayout>} />
          <Route path="/character-notes" element={<MobileLayout><CharacterNotes /></MobileLayout>} />
          <Route path="/letters-to-younger-self" element={<MobileLayout><LettersToYoungerSelf /></MobileLayout>} />
          <Route path="/notes-for-next-chapter" element={<MobileLayout><NotesForNextChapter /></MobileLayout>} />
          <Route path="/my-library" element={<MobileLayout><MyLibrary /></MobileLayout>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
