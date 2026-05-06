'use client';

import React, { useState, useEffect, useRef } from 'react';
import Background from './Background';
import CharacterSprite from './CharacterSprite';
import DialogueBox from './DialogueBox';
import CGImage from './CGImage';
import TitleScreen from './TitleScreen';
import GameMenu from './GameMenu';
import storyData from '@/data/story.json';
import type { Story, Scene } from '@/types/story';
import { getCookie, deleteCookie } from '@/lib/cookies';

const story = storyData as Story;

export default function VisualNovel() {
  const [showTitleScreen, setShowTitleScreen] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [currentSceneId, setCurrentSceneId] = useState(story.structure.start);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCG, setShowCG] = useState(false);
  const [cgImagePath, setCgImagePath] = useState('');
  const [showEnding, setShowEnding] = useState(false);
  const [endingText, setEndingText] = useState('');
  const [hasSave, setHasSave] = useState(false);
  const previousBackgroundRef = useRef<string>('');

  // Проверка cookie при загрузке компонента
  useEffect(() => {
    const savedUsername = getCookie('username');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  // Автосохранение прогресса при изменении сцены или диалога
  useEffect(() => {
    const saveProgress = async () => {
      if (!username) return;
      
      try {
        await fetch('/api/game/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            sceneId: currentSceneId,
            dialogueIndex,
          }),
        });
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    };

    if (username && !showTitleScreen && !showEnding) {
      saveProgress();
    }
  }, [currentSceneId, dialogueIndex, username, showTitleScreen, showEnding]);

  // Загрузка информации о сохранении при входе
  useEffect(() => {
    const checkSaveExists = async () => {
      if (!username) return;

      try {
        const response = await fetch('/api/game/load', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username }),
        });

        const data = await response.json();
        setHasSave(data.hasSave);
      } catch (error) {
        console.error('Error checking save:', error);
      }
    };

    if (username) {
      checkSaveExists();
    }
  }, [username]);

  const loadProgress = async () => {
    if (!username) return;

    try {
      const response = await fetch('/api/game/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (data.hasSave) {
        console.log('Loading saved progress:', data.sceneId, data.dialogueIndex);
        setCurrentSceneId(data.sceneId);
        setDialogueIndex(data.dialogueIndex);
        setHasSave(true);
        setShowEnding(false);
        setShowCG(false);
        previousBackgroundRef.current = ''; // Сбрасываем для корректного отображения фона
      } else {
        console.log('No save found');
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  // Обработчик начала игры
  const handleStartGame = (user: string) => {
    setUsername(user);
    setShowTitleScreen(false);
    // Начинаем с начала
    setCurrentSceneId(story.structure.start);
    setDialogueIndex(0);
  };

  const handleContinueGame = async (user: string) => {
    setUsername(user);
    
    // Загружаем сохраненный прогресс
    try {
      const response = await fetch('/api/game/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user }),
      });

      const data = await response.json();

      if (data.hasSave) {
        console.log('Loading saved progress:', data.sceneId, data.dialogueIndex);
        setCurrentSceneId(data.sceneId);
        setDialogueIndex(data.dialogueIndex);
        setShowTitleScreen(false);
      } else {
        // Если нет сохранения, начинаем с начала
        handleStartGame(user);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      // При ошибке начинаем с начала
      handleStartGame(user);
    }
  };

  const handleNewGame = () => {
    setCurrentSceneId(story.structure.start);
    setDialogueIndex(0);
    setShowEnding(false);
    previousBackgroundRef.current = '';
  };

  const handleContinue = () => {
    loadProgress();
  };

  const handleLogout = () => {
    // Удаляем cookie и возвращаемся на титульный экран
    deleteCookie('username');
    setUsername(null);
    setShowTitleScreen(true);
    setCurrentSceneId(story.structure.start);
    setDialogueIndex(0);
    setShowEnding(false);
    previousBackgroundRef.current = '';
  };

  // Показываем главный экран
  if (showTitleScreen) {
    return <TitleScreen onStart={handleStartGame} onContinue={handleContinueGame} />;
  }

  // Найти текущую сцену
  const currentScene = story.scenes.find((s: Scene) => s.id === currentSceneId);
  
  if (!currentScene) {
    return <div>Ошибка: сцена не найдена</div>;
  }

  const currentDialogue = currentScene.dialogue[dialogueIndex];

  // Определить фон для сцены (специальный фон для находки ключа)
  const getBackgroundImage = (): string => {
    // Для сцены находки ключа используем специальный фон
    if (currentSceneId === 'scene_1b') {
      return 'key';
    }
    
    // Для встречи через 3 месяца в scene_6_alex_good используем вечернее кафе
    if (currentSceneId === 'scene_6_alex_good' && dialogueIndex >= 7) {
      // С 7-го диалога начинается встреча в кафе ("Вы встречаетесь в той же кофейне")
      return 'cafe_evening';
    }
    
    // Для остальных сцен используем локацию из данных
    return currentScene.location;
  };

  const currentBackground = getBackgroundImage();

  // Определить, какого персонажа показывать
  // Показываем персонажа, если это alex или maya
  const getCurrentCharacter = (): { character: string; emotion: string; variant?: 'normal' | 'full' | 'full_back' } | null => {
    // Для scene_2 показываем обоих персонажей в полный рост
    if (currentSceneId === 'scene_2') {
      // Показываем Алекса слева и Майю справа
      return null; // Обработаем отдельно
    }
    
    // Сначала ищем последнего персонажа (alex или maya) в уже пройденных диалогах
    for (let i = dialogueIndex; i >= 0; i--) {
      const dialogue = currentScene.dialogue[i];
      if ((dialogue.character === 'alex' || dialogue.character === 'maya') && dialogue.emotion) {
        return {
          character: dialogue.character,
          emotion: dialogue.emotion
        };
      }
    }
    
    // Если не нашли в прошлых диалогах, ищем в будущих диалогах этой сцены
    for (let i = dialogueIndex + 1; i < currentScene.dialogue.length; i++) {
      const dialogue = currentScene.dialogue[i];
      if ((dialogue.character === 'alex' || dialogue.character === 'maya') && dialogue.emotion) {
        return {
          character: dialogue.character,
          emotion: dialogue.emotion
        };
      }
    }
    
    return null;
  };

  const handleNext = () => {
    // Если есть выборы, не переходим дальше (показываем их в DialogueBox)
    if (currentDialogue.choices) {
      return;
    }

    // Проверяем, является ли текущий диалог концовкой
    if (currentDialogue.text.includes('КОНЦОВКА:')) {
      // Запускаем финальное затемнение
      setIsTransitioning(true);
      setTimeout(() => {
        setShowEnding(true);
        setEndingText(currentDialogue.text);
      }, 800); // Ждем завершения затемнения
      return;
    }

    // Проверяем, нужно ли показать CG изображение
    // В scene_6_alex_good на 10-м диалоге показываем фото прабабушки
    if (currentSceneId === 'scene_6_alex_good' && dialogueIndex === 10) {
      setShowCG(true);
      setCgImagePath('/images/characters/alex/alex_work_present.png');
      return;
    }

    // В scene_5_maya_library на 5-м диалоге показываем книгу "Путешествия Гулливера"
    if (currentSceneId === 'scene_5_maya_library' && dialogueIndex === 5) {
      setShowCG(true);
      setCgImagePath('/images/characters/maya/maya_book.png');
      return;
    }

    // Проверяем, изменится ли фон на следующем диалоге
    const nextIndex = dialogueIndex + 1;
    if (nextIndex < currentScene.dialogue.length) {
      // Временно увеличиваем индекс чтобы проверить следующий фон
      const nextBackground = currentSceneId === 'scene_6_alex_good' && nextIndex >= 7 
        ? 'cafe_evening' 
        : (currentSceneId === 'scene_1b' ? 'key' : currentScene.location);
      
      // Если фон меняется, запускаем transition
      if (previousBackgroundRef.current && previousBackgroundRef.current !== nextBackground) {
        setIsTransitioning(true);
        setTimeout(() => {
          setDialogueIndex(nextIndex);
          previousBackgroundRef.current = nextBackground;
          setTimeout(() => {
            setIsTransitioning(false);
          }, 400);
        }, 400);
      } else {
        setDialogueIndex(nextIndex);
        previousBackgroundRef.current = nextBackground;
      }
    } else {
      // Конец сцены
      console.log('Конец сцены:', currentSceneId);
    }
  };

  const handleCGNext = () => {
    setShowCG(false);
    setCgImagePath('');
    // Переходим к следующему диалогу
    if (dialogueIndex < currentScene.dialogue.length - 1) {
      setDialogueIndex(dialogueIndex + 1);
    }
  };

  const handleChoice = (nextSceneId: string) => {
    setIsTransitioning(true);
    
    // Плавный переход между сценами (затемнение и осветление)
    setTimeout(() => {
      setCurrentSceneId(nextSceneId);
      setDialogueIndex(0);
      previousBackgroundRef.current = ''; // Сбрасываем при смене сцены
      // Убираем затемнение после смены сцены
      setTimeout(() => {
        setIsTransitioning(false);
      }, 400);
    }, 400);
  };

  // Получить имя персонажа
  const getCharacterName = (character: string): string => {
    if (character === 'narrator' || character === 'player') {
      return '';
    }
    return story.characters[character as keyof typeof story.characters]?.name || '';
  };

  const characterToShow = getCurrentCharacter();

  // Определить позицию персонажа для диалогового окна
  const getCharacterPosition = (): 'left' | 'center' | 'right' | 'fullLeft' | 'fullRight' => {
    if (currentSceneId === 'scene_2') {
      // В scene_2 два персонажа, определяем кто говорит
      if (currentDialogue.character === 'alex') return 'fullLeft';
      if (currentDialogue.character === 'maya') return 'fullRight';
    }
    // Для остальных сцен персонаж всегда по центру
    return 'center';
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* Меню игры с аватаром */}
      {username && !showEnding && (
        <GameMenu
          username={username}
          onNewGame={handleNewGame}
          onContinue={handleContinue}
          onLogout={handleLogout}
          hasSave={hasSave}
        />
      )}

      {/* Фон */}
      <Background location={currentBackground} />

      {/* Спрайты персонажей */}
      {currentSceneId === 'scene_2' ? (
        // Для scene_2 показываем обоих персонажей в полный рост
        <>
          <CharacterSprite
            character="alex"
            emotion="neutral"
            position="fullLeft"
            variant="full"
          />
          <CharacterSprite
            character="maya"
            emotion="neutral"
            position="fullRight"
            variant="full_back"
          />
        </>
      ) : (
        // Для остальных сцен показываем текущего персонажа
        characterToShow && (
          <CharacterSprite
            character={characterToShow.character}
            emotion={characterToShow.emotion}
            position="center"
            variant={characterToShow.variant}
          />
        )
      )}

      {/* Затемнение при переходе - ирисовая диафрагма с размытием */}
      {isTransitioning && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          pointerEvents: 'none'
        }}>
          <svg width="100%" height="100%" style={{ position: 'absolute' }}>
            <defs>
              {/* Фильтр размытия для краев */}
              <filter id="blurFilter">
                <feGaussianBlur in="SourceGraphic" stdDeviation="30" />
              </filter>
              
              <mask id="irisMask">
                <rect width="100%" height="100%" fill="white" />
                <circle 
                  cx="50%" 
                  cy="50%" 
                  r="0"
                  fill="black"
                  filter="url(#blurFilter)"
                  style={{
                    animation: 'irisAnimation 0.8s ease-in-out forwards'
                  }}
                />
              </mask>
            </defs>
            <rect 
              width="100%" 
              height="100%" 
              fill="black" 
              mask="url(#irisMask)"
            />
          </svg>
        </div>
      )}

      <style jsx>{`
        @keyframes irisAnimation {
          0% {
            r: 150%;
          }
          50% {
            r: 0%;
          }
          100% {
            r: 150%;
          }
        }
      `}</style>

      {/* CG изображение (полноэкранное) */}
      {showCG && cgImagePath && (
        <CGImage imagePath={cgImagePath} onNext={handleCGNext} />
      )}

      {/* Диалоговое окно (с выборами или без) */}
      {!isTransitioning && !showCG && !showEnding && (
        <DialogueBox
          character={currentDialogue.character}
          text={currentDialogue.text}
          characterName={getCharacterName(currentDialogue.character)}
          characterPosition={getCharacterPosition()}
          onNext={handleNext}
          choices={currentDialogue.choices || undefined}
          onChoice={handleChoice}
          speakingCharacter={currentDialogue.character === 'alex' || currentDialogue.character === 'maya' ? currentDialogue.character : undefined}
        />
      )}

      {/* Финальный экран концовки */}
      {showEnding && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'black',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 1s ease-out'
        }}>
          <div style={{
            color: 'white',
            fontSize: '48px',
            fontWeight: 'bold',
            textAlign: 'center',
            padding: '40px',
            maxWidth: '900px',
            textShadow: '0 4px 20px rgba(167, 139, 250, 0.8)',
            animation: 'scaleIn 1.5s ease-out 0.5s both'
          }}>
            {endingText}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
