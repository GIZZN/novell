import React from 'react';
import styles from './ChoiceMenu.module.css';

interface Choice {
  text: string;
  next: string;
}

interface ChoiceMenuProps {
  choices: Choice[];
  onChoice: (nextScene: string) => void;
  characterPosition?: 'left' | 'center' | 'right' | 'fullLeft' | 'fullRight';
}

export default function ChoiceMenu({ 
  choices, 
  onChoice,
  characterPosition = 'center'
}: ChoiceMenuProps) {
  // Определяем позицию меню в зависимости от позиции персонажа
  const getMenuPosition = () => {
    switch (characterPosition) {
      case 'left':
      case 'fullLeft':
        return styles.menuLeft;
      case 'right':
      case 'fullRight':
        return styles.menuRight;
      case 'center':
      default:
        return styles.menuCenter;
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={`${styles.menu} ${getMenuPosition()}`}>
        <h3 className={styles.title}>Выберите действие</h3>
        <div className={styles.choices}>
          {choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => onChoice(choice.next)}
              className={styles.choice}
            >
              <span className={styles.arrow}>▶</span> {choice.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
