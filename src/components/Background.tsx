import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './Background.module.css';

interface BackgroundProps {
  location: string;
}

export default function Background({ location }: BackgroundProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Плавное появление при смене фона
    setIsVisible(false);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [location]);

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
      className={styles.background} 
      style={{ opacity: isVisible ? 1 : 0 }}
      onDragStart={handleDragStart}
      onContextMenu={handleContextMenu}
    >
      <Image
        src={`/images/backgrounds/${location}.jpg`}
        alt={location}
        fill
        style={{ objectFit: 'cover' }}
        priority
        draggable={false}
        onDragStart={handleDragStart}
        onContextMenu={handleContextMenu}
      />
    </div>
  );
}
