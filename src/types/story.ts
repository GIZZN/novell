// Типы для визуальной новеллы "Забытый ключ"

export interface Character {
  name: string;
  description: string;
}

export interface Characters {
  player: Character;
  alex: Character;
  maya: Character;
}

export interface Locations {
  [key: string]: string;
}

export interface Choice {
  text: string;
  next: string;
}

export interface DialogueLine {
  character: string;
  text: string;
  emotion?: string | null;
  choices?: Choice[] | null;
}

export interface Scene {
  id: string;
  location: string;
  dialogue: DialogueLine[];
}

export interface StoryStructure {
  start: string;
  total_scenes: number;
  branches: {
    alex_path: {
      description: string;
      scenes: string[];
      endings: number;
      good_ending: string;
      bad_ending: string;
    };
    maya_path: {
      description: string;
      scenes: string[];
      endings: number;
      good_ending: string;
      bad_ending: string;
    };
  };
  choice_points: Array<{
    scene: string;
    description: string;
    impact: string;
  }>;
  themes: {
    main: string;
    alex_path: string;
    maya_path: string;
  };
}

export interface Story {
  title: string;
  description: string;
  characters: Characters;
  locations: Locations;
  scenes: Scene[];
  structure: StoryStructure;
}

// Типы для состояния игры
export interface GameState {
  currentScene: string;
  currentDialogueIndex: number;
  history: string[];
  choices: Record<string, string>;
}

// Типы для компонентов
export interface BackgroundProps {
  location: string;
}

export interface CharacterSpriteProps {
  character: string;
  emotion: string;
  position?: 'left' | 'center' | 'right';
}

export interface DialogueBoxProps {
  character: string;
  text: string;
  characterName?: string;
  onNext: () => void;
}

export interface ChoiceMenuProps {
  choices: Choice[];
  onChoice: (nextScene: string) => void;
}
