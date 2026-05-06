import React, { useState, useEffect } from 'react';
import styles from './DialogueBox.module.css';

interface Choice {
  text: string;
  next: string;
}

interface DialogueBoxProps {
  character: string;
  text: string;
  characterName?: string;
  onNext: () => void;
  characterPosition?: 'left' | 'center' | 'right' | 'fullLeft' | 'fullRight';
  choices?: Choice[];
  onChoice?: (nextScene: string) => void;
  speakingCharacter?: string; // Добавляем для определения конкретного персонажа (alex/maya)
}

export default function DialogueBox({ 
  character, 
  text, 
  characterName,
  onNext,
  characterPosition = 'center',
  choices,
  onChoice,
  speakingCharacter
}: DialogueBoxProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const typingSpeed = 30; // миллисекунды на символ

  // Парсим текст, чтобы отделить действия (в звездочках) от речи
  const parseText = (rawText: string) => {
    const parts: Array<{ type: 'action' | 'speech'; text: string }> = [];
    const regex = /\*([^*]+)\*/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(rawText)) !== null) {
      // Добавляем текст до действия (если есть)
      if (match.index > lastIndex) {
        const speechText = rawText.substring(lastIndex, match.index).trim();
        if (speechText) {
          parts.push({ type: 'speech', text: speechText });
        }
      }
      // Добавляем действие
      parts.push({ type: 'action', text: match[1].trim() });
      lastIndex = regex.lastIndex;
    }

    // Добавляем оставшийся текст после последнего действия
    if (lastIndex < rawText.length) {
      const speechText = rawText.substring(lastIndex).trim();
      if (speechText) {
        parts.push({ type: 'speech', text: speechText });
      }
    }

    return parts;
  };

  const textParts = parseText(text);
  const fullText = text; // Полный текст для анимации печати

  useEffect(() => {
    setDisplayedText('');
    setIsTypingComplete(false);
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTypingComplete(true);
        clearInterval(typingInterval);
      }
    }, typingSpeed);

    return () => clearInterval(typingInterval);
  }, [fullText]);

  const handleSkip = () => {
    if (!isTypingComplete) {
      setDisplayedText(fullText);
      setIsTypingComplete(true);
    }
  };

  // Рендерим текст с разделением на действия и речь
  const renderFormattedText = () => {
    if (!isTypingComplete) {
      // Во время печати показываем обычный текст
      return (
        <>
          {displayedText}
          <span className={styles.cursor}>▌</span>
        </>
      );
    }

    // После завершения печати показываем форматированный текст
    return textParts.map((part, index) => {
      if (part.type === 'action') {
        return (
          <span key={index} className={styles.action}>
            {part.text}
          </span>
        );
      }
      return <span key={index}>{part.text} </span>;
    });
  };

  const isCharacterSpeaking = character === 'alex' || character === 'maya';
  const isNarrator = character === 'narrator';
  const isPlayer = character === 'player';
  const hasChoices = choices && choices.length > 0;

  // Определяем позицию пузыря в зависимости от позиции персонажа
  const getBubblePosition = () => {
    if (!isCharacterSpeaking) return styles.bubbleCenter;
    
    switch (characterPosition) {
      case 'left':
      case 'fullLeft':
        return styles.bubbleLeft;
      case 'right':
      case 'fullRight':
        return styles.bubbleRight;
      case 'center':
      default:
        return styles.bubbleCenter;
    }
  };

  // Разные стили для разных типов диалогов
  const getContainerClass = () => {
    if (isNarrator) return `${styles.container} ${styles.narratorContainer}`;
    if (isPlayer) return `${styles.container} ${styles.playerContainer}`;
    
    // Добавляем специальный класс для Алекса
    const alexClass = speakingCharacter === 'alex' ? styles.alexBubble : '';
    return `${styles.container} ${getBubblePosition()} ${alexClass}`;
  };

  const getBoxClass = () => {
    if (isNarrator) return `${styles.box} ${styles.narratorBox}`;
    if (isPlayer) return `${styles.box} ${styles.playerBox}`;
    return `${styles.box} ${styles.speechBubble}`;
  };

  return (
    <div className={getContainerClass()} onClick={handleSkip}>
      <div className={getBoxClass()}>
        {isCharacterSpeaking && characterName && (
          <div className={styles.name}>
            {characterName}
          </div>
        )}
        <div className={styles.text}>
          {renderFormattedText()}
        </div>
        
        {/* Если есть выборы, показываем их только после завершения печати */}
        {hasChoices && onChoice && isTypingComplete ? (
          <div className={styles.choices}>
            {choices.map((choice, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  onChoice(choice.next);
                }}
                className={styles.choiceButton}
              >
                <span className={styles.arrow}>▶</span> {choice.text}
              </button>
            ))}
          </div>
        ) : (
          isTypingComplete && (
            <button 
              className={styles.continueButton}
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
            >
              <span className={styles.continueButtonText}>Продолжить</span>
              <span className={styles.continueButtonIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M9 18L15 12L9 6" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          )
        )}
      </div>
    </div>
  );
}
