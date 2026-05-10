// Login Screen - The Inner Library
// Sign in / Sign up UI with email and password
// Prep for Supabase authentication

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import styles from './LoginScreen.module.css';

export const LoginScreen = () => {
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, isConfigured, error: authError } = useAuth();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const error = localError || authError;

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');

    // Basic validation
    if (!email.trim()) {
      setLocalError('Please enter your email address.');
      return;
    }

    if (mode !== 'reset' && !password) {
      setLocalError('Please enter your password.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    if (!isConfigured) {
      setLocalError('Authentication is not yet configured. Please set up Supabase environment variables to enable login.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        const result = await signIn(email, password);
        if (result.error) {
          setLocalError(result.error);
        } else {
          navigate('/');
        }
      } else if (mode === 'signup') {
        const result = await signUp(email, password, displayName);
        if (result.error) {
          setLocalError(result.error);
        } else if (result.needsConfirmation) {
          setSuccessMessage('Account created! Please check your email to confirm your account.');
        } else {
          navigate('/');
        }
      } else if (mode === 'reset') {
        const result = await resetPassword(email);
        if (result.error) {
          setLocalError(result.error);
        } else {
          setSuccessMessage('Password reset link sent! Check your email.');
        }
      }
    } catch (err) {
      setLocalError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [mode, email, password, displayName, signIn, signUp, resetPassword, isConfigured, navigate]);

  const switchMode = (newMode) => {
    setMode(newMode);
    setLocalError('');
    setSuccessMessage('');
  };

  return (
    <div className={styles.login}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          ← Library
        </button>
        <div className={styles.spacer} />
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Book icon */}
        <div className={styles.iconWrapper}>
          <span className={styles.bookIcon}>📖</span>
        </div>

        <h1 className={styles.title}>
          {mode === 'signin' && 'Welcome Back'}
          {mode === 'signup' && 'Create Your Account'}
          {mode === 'reset' && 'Reset Password'}
        </h1>

        <p className={styles.subtitle}>
          {mode === 'signin' && 'Sign in to access your library from anywhere'}
          {mode === 'signup' && 'Join The Inner Library to save your progress'}
          {mode === 'reset' && 'Enter your email to receive a reset link'}
        </p>

        {/* Auth form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="displayName">Display Name</label>
              <input
                id="displayName"
                className={styles.input}
                type="text"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
              />
            </div>
          )}

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              className={styles.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {mode !== 'reset' && (
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="password">Password</label>
              <input
                id="password"
                className={styles.input}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}
          {successMessage && <p className={styles.success}>{successMessage}</p>}

          <button
            className={styles.submitBtn}
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              mode === 'signin' ? 'Sign In' :
              mode === 'signup' ? 'Create Account' :
              'Send Reset Link'
            )}
          </button>
        </form>

        {/* Mode switcher */}
        <div className={styles.switcher}>
          {mode === 'signin' && (
            <>
              <p className={styles.switchText}>
                Don&apos;t have an account?{' '}
                <button className={styles.switchBtn} onClick={() => switchMode('signup')}>
                  Sign Up
                </button>
              </p>
              <button className={styles.switchBtn} onClick={() => switchMode('reset')}>
                Forgot Password?
              </button>
            </>
          )}
          {mode === 'signup' && (
            <p className={styles.switchText}>
              Already have an account?{' '}
              <button className={styles.switchBtn} onClick={() => switchMode('signin')}>
                Sign In
              </button>
            </p>
          )}
          {mode === 'reset' && (
            <p className={styles.switchText}>
              Remember your password?{' '}
              <button className={styles.switchBtn} onClick={() => switchMode('signin')}>
                Sign In
              </button>
            </p>
          )}
        </div>

        {/* Not configured notice */}
        {!isConfigured && (
          <div className={styles.notice}>
            <p className={styles.noticeText}>
              🔒 Authentication is being set up. This feature will be available soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
