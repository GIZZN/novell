import React from 'react';
import Image from 'next/image';
import styles from './CGImage.module.css';

interface CGImageProps {
  imagePath: string;
  onNext: () => void;
}

export default function CGImage({ imagePath, onNext }: CGImageProps) {
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
    <div className={styles.container} onClick={onNext}>
      <div 
        className={styles.imageFrame}
        onDragStart={handleDragStart}
        onContextMenu={handleContextMenu}
      >
        <Image
          src={imagePath}
          alt="CG Image"
          width={500}
          height={600}
          style={{ width: '100%', height: 'auto' }}
          priority
          draggable={false}
          onDragStart={handleDragStart}
          onContextMenu={handleContextMenu}
        />
      </div>
      
      {/* Кнопка продолжить */}
      <button 
        className={styles.continueButton}
        onClick={onNext}
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
    </div>
  );
}
