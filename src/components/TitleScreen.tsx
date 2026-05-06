'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './TitleScreen.module.css';
import AuthModal from './AuthModal';
import { getCookie, setCookie } from '@/lib/cookies';

interface TitleScreenProps {
  onStart: (username: string) => void;
  onContinue: (username: string) => void;
}

export default function TitleScreen({ onStart, onContinue }: TitleScreenProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSave, setHasSave] = useState(false);

  // Проверка cookie при загрузке
  useEffect(() => {
    const savedUsername = getCookie('username');
    if (savedUsername) {
      setUsername(savedUsername);
      checkSaveExists(savedUsername);
    }
    setIsLoading(false);
  }, []);

  const checkSaveExists = async (user: string) => {
    try {
      const response = await fetch('/api/game/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user }),
      });

      const data = await response.json();
      setHasSave(data.hasSave);
    } catch (error) {
      console.error('Error checking save:', error);
    }
  };

  const handleAuthSuccess = (user: string) => {
    setUsername(user);
    setShowAuthModal(false);
    // Сохраняем username в cookie на 30 дней
    setCookie('username', user, 30);
    checkSaveExists(user);
  };

  const handleStartGame = () => {
    if (!username) {
      setShowAuthModal(true);
    } else {
      onStart(username);
    }
  };

  const handleContinueGame = () => {
    if (username) {
      onContinue(username);
    }
  };

  // Показываем загрузку пока проверяем cookie
  if (isLoading) {
    return (
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'black'
      }}>
        <div style={{ color: 'white', fontSize: '24px' }}>Загрузка...</div>
      </div>
    );
  }

  // Запрет перетаскивания изображений
  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    return false;
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  return (
    <>
      <div className={styles.container}>
        {/* Фоновое изображение */}
        <div 
          className={styles.background}
          onDragStart={handleDragStart}
          onContextMenu={handleContextMenu}
        >
          <Image
            src="/images/backgrounds/main.png"
            alt="Title Screen Background"
            fill
            style={{ objectFit: 'cover' }}
            priority
            draggable={false}
            onDragStart={handleDragStart}
            onContextMenu={handleContextMenu}
          />
        </div>

        {/* Затемнение для читаемости текста */}
        <div className={styles.overlay} />

        {/* Контент */}
        <div className={styles.content}>
          {/* Название игры */}
          <h1 className={styles.title}>
            Забытый ключ
          </h1>

          {/* Подзаголовок */}
          <p className={styles.subtitle}>
            Визуальная новелла о случайной находке
          </p>

          {/* Приветствие пользователя */}
          {username && (
            <div className={styles.welcomeMessage}>
              Добро пожаловать, <span className={styles.username}>{username}</span>!
            </div>
          )}

          {/* Кнопки */}
          <div className={styles.buttons}>
            {/* Кнопка продолжить - показывается только если есть сохранение */}
            {username && hasSave && (
              <button className={styles.continueButton} onClick={handleContinueGame} title="Продолжить">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M9 18l6-6-6-6" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}

            {/* Кнопка начать игру */}
            {username && (
              <button className={styles.startButton} onClick={handleStartGame} title={hasSave ? "Начать заново" : "Начать игру"}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M21 3v5h-5" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}

            {!username && (
              <button 
                className={styles.authButton} 
                onClick={() => setShowAuthModal(true)}
                title="Войти"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <circle 
                    cx="12" 
                    cy="7" 
                    r="4" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Модальное окно авторизации */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
