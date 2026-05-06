'use client';

import { useEffect } from 'react';

// Предзагрузка критичных изображений
export default function ImagePreloader() {
  useEffect(() => {
    // Предзагружаем основные фоны
    const backgrounds = [
      '/images/backgrounds/park.jpg',
      '/images/backgrounds/cafe.jpg',
      '/images/backgrounds/library.jpg',
    ];

    // Предзагружаем основные спрайты персонажей
    const characters = [
      '/images/characters/alex/alex_neutral.png',
      '/images/characters/alex/alex_happy.png',
      '/images/characters/maya/maya_neutral.png',
      '/images/characters/maya/maya_happy.png',
    ];

    const allImages = [...backgrounds, ...characters];

    allImages.forEach((src) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }, []);

  return null;
}
