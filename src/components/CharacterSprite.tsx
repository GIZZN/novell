import React from 'react';
import Image from 'next/image';
import styles from './CharacterSprite.module.css';

interface CharacterSpriteProps {
  character: string;
  emotion: string;
  position?: 'left' | 'center' | 'right' | 'fullLeft' | 'fullRight';
  variant?: 'normal' | 'full' | 'full_back';
}

export default function CharacterSprite({ 
  character, 
  emotion, 
  position = 'center',
  variant = 'normal'
}: CharacterSpriteProps) {
  // Не показываем спрайт для narrator и player
  if (character === 'narrator' || character === 'player') {
    return null;
  }

  const positionClass = styles[position];
  
  // Добавляем специальные классы для персонажей
  const mayaClass = character === 'maya' && position === 'center' ? styles.mayaSprite : '';
  const alexClass = character === 'alex' && position === 'center' ? styles.alexSprite : '';
  
  // Определяем имя файла в зависимости от варианта
  let fileName = `${character}_${emotion}`;
  if (variant === 'full') {
    fileName = `${character}_${emotion}_full`;
  } else if (variant === 'full_back') {
    fileName = `${character}_${emotion}_full_back`;
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
    <div 
      className={`${styles.sprite} ${positionClass} ${mayaClass} ${alexClass}`}
      onDragStart={handleDragStart}
      onContextMenu={handleContextMenu}
    >
      <Image
        src={`/images/characters/${character}/${fileName}.png`}
        alt={`${character} ${emotion}`}
        width={800}
        height={1200}
        style={{ height: '85vh', width: 'auto' }}
        priority
        quality={85}
        loading="eager"
        draggable={false}
        onDragStart={handleDragStart}
        onContextMenu={handleContextMenu}
        sizes="(max-width: 768px) 50vw, 33vw"
      />
    </div>
  );
}
