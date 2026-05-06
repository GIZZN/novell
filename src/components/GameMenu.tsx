'use client';

import React, { useState } from 'react';
import styles from './GameMenu.module.css';

interface GameMenuProps {
  username: string;
  onNewGame: () => void;
  onContinue: () => void;
  onLogout: () => void;
  hasSave: boolean;
}

export default function GameMenu({ username, onNewGame, onContinue, onLogout, hasSave }: GameMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNewGame = () => {
    setIsOpen(false);
    onNewGame();
  };

  const handleContinue = () => {
    setIsOpen(false);
    onContinue();
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <>
      {/* Кнопка аватара */}
      <button 
        className={styles.avatarButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Меню игры"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle 
            cx="12" 
            cy="8" 
            r="4" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          <path 
            d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Выпадающее меню */}
      {isOpen && (
        <>
          <div className={styles.overlay} onClick={() => setIsOpen(false)} />
          <div className={styles.menu}>
            <div className={styles.menuHeader}>
              <div className={styles.username}>{username}</div>
            </div>
            
            <div className={styles.menuButtons}>
              {hasSave && (
                <button 
                  className={styles.menuButton}
                  onClick={handleContinue}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path 
                      d="M9 18l6-6-6-6" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                  Продолжить
                </button>
              )}
              
              <button 
                className={styles.menuButton}
                onClick={handleNewGame}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M21 3v5h-5" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M3 21v-5h5" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
                Начать заново
              </button>

              <button 
                className={`${styles.menuButton} ${styles.logoutButton}`}
                onClick={handleLogout}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <polyline 
                    points="16 17 21 12 16 7" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <line 
                    x1="21" 
                    y1="12" 
                    x2="9" 
                    y2="12" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
                Выйти
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
