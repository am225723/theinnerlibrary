// Protected Route Component
// Wraps routes that require authentication
// Shows migration screen if data needs to be migrated

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { MigrationScreen } from './MigrationScreen';
import { useState } from 'react';

export const ProtectedRoute = ({ children }) => {
  const { user, loading, isConfigured } = useAuth();
  const location = useLocation();
  const [migrationComplete, setMigrationComplete] = useState(false);

  // Show loading state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #F5F0E8 0%, #EDE7D8 100%)',
      }}>
        <p style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>
          Loading...
        </p>
      </div>
    );
  }

  // If Supabase is not configured, allow access (fallback to localStorage mode)
  if (!isConfigured) {
    return <>{children}</>;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Show migration screen if not yet migrated
  if (!migrationComplete) {
    return (
      <MigrationScreen
        onComplete={() => setMigrationComplete(true)}
      />
    );
  }

  // User is authenticated and migration is complete
  return <>{children}</>;
};