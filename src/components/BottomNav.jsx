import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './BottomNav.module.css';

const navItems = [
  { path: '/', label: 'Library', icon: '🏛️' },
  { path: '/open-todays-page', label: 'Today', icon: '📖' },
  { path: '/my-library', label: 'Saved', icon: '🔖' },
];

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className={styles.bottomNav} aria-label="Main navigation">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            onClick={() => navigate(item.path)}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
