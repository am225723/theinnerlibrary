// Admin/Therapist Dashboard - The Inner Library
// Provides therapists with overview of client progress and activity

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import styles from './AdminScreen.module.css';

export const AdminScreen = () => {
  const navigate = useNavigate();
  const { user, signOut, isConfigured } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Placeholder data - will be replaced with real Supabase queries
  const [clients] = useState([
    { id: 1, name: 'Client A', lastActive: '2 hours ago', entries: 15, streak: 7 },
    { id: 2, name: 'Client B', lastActive: '1 day ago', entries: 8, streak: 3 },
    { id: 3, name: 'Client C', lastActive: '3 days ago', entries: 22, streak: 14 },
  ]);

  const [activityLog] = useState([
    { id: 1, client: 'Client A', action: 'Completed Daily Check-in', time: '2 hours ago' },
    { id: 2, client: 'Client A', action: 'Wrote in Dialogue Practice', time: '3 hours ago' },
    { id: 3, client: 'Client B', action: 'Added to Evidence Shelf', time: '1 day ago' },
    { id: 4, client: 'Client C', action: 'Wrote Letter to Younger Self', time: '3 days ago' },
  ]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate('/');
  }, [signOut, navigate]);

  // Redirect if not admin
  useEffect(() => {
    if (!isConfigured) return;
    if (user && user.role !== 'admin' && user.role !== 'therapist') {
      navigate('/');
    }
  }, [user, isConfigured, navigate]);

  return (
    <div className={styles.admin}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          ← Library
        </button>
        <h1 className={styles.heading}>🩺 Therapist Dashboard</h1>
        <button className={styles.signOutBtn} onClick={handleSignOut}>
          Sign Out
        </button>
      </div>

      {/* Therapist info */}
      {user && (
        <div className={styles.therapistInfo}>
          <div className={styles.avatar}>
            {user.email?.charAt(0).toUpperCase() || 'T'}
          </div>
          <div className={styles.therapistDetails}>
            <p className={styles.therapistName}>{user.metadata?.display_name || 'Therapist'}</p>
            <p className={styles.therapistEmail}>{user.email}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        {['overview', 'clients', 'activity'].map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' ? '📊 Overview' :
             tab === 'clients' ? '👥 Clients' :
             '📋 Activity'}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className={styles.section}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{clients.length}</span>
              <span className={styles.statLabel}>Active Clients</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>
                {clients.reduce((sum, c) => sum + c.entries, 0)}
              </span>
              <span className={styles.statLabel}>Total Entries</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>
                {clients.filter(c => c.streak >= 7).length}
              </span>
              <span className={styles.statLabel}>7+ Day Streaks</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>
                {clients.filter(c => c.lastActive.includes('hour')).length}
              </span>
              <span className={styles.statLabel}>Active Today</span>
            </div>
          </div>

          <div className={styles.notice}>
            <p className={styles.noticeText}>
              This dashboard is in preview mode. Full client management features
              will be available once Supabase is fully configured with your project credentials.
            </p>
          </div>
        </div>
      )}

      {/* Clients */}
      {activeTab === 'clients' && (
        <div className={styles.section}>
          <div className={styles.clientList}>
            {clients.map((client) => (
              <div key={client.id} className={styles.clientCard}>
                <div className={styles.clientAvatar}>
                  {client.name.charAt(0)}
                </div>
                <div className={styles.clientInfo}>
                  <p className={styles.clientName}>{client.name}</p>
                  <p className={styles.clientMeta}>
                    Last active: {client.lastActive} · {client.entries} entries · {client.streak} day streak
                  </p>
                </div>
                <button className={styles.viewBtn}>View</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity */}
      {activeTab === 'activity' && (
        <div className={styles.section}>
          <div className={styles.activityList}>
            {activityLog.map((item) => (
              <div key={item.id} className={styles.activityItem}>
                <div className={styles.activityDot} />
                <div className={styles.activityContent}>
                  <p className={styles.activityText}>
                    <strong>{item.client}</strong> — {item.action}
                  </p>
                  <p className={styles.activityTime}>{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Not configured notice */}
      {!isConfigured && (
        <div className={styles.configNotice}>
          <p className={styles.configTitle}>⚙️ Setup Required</p>
          <p className={styles.configText}>
            To enable the therapist dashboard with real client data, you need to configure
            Supabase with your project credentials. Add the following environment variables:
          </p>
          <code className={styles.configCode}>
            REACT_APP_SUPABASE_URL=your-project-url<br/>
            REACT_APP_SUPABASE_ANON_KEY=your-anon-key
          </code>
          <p className={styles.configText}>
            Then set up a &quot;clients&quot; table and an &quot;entries&quot; table in your Supabase project
            to track client progress and journal entries.
          </p>
        </div>
      )}
    </div>
  );
};
