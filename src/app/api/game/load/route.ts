import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: 'Имя пользователя не указано' },
        { status: 400 }
      );
    }

    // Получить user_id по username
    const userResult = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    const userId = userResult.rows[0].id;

    // Загрузить сохраненный прогресс
    const saveResult = await pool.query(
      'SELECT scene_id, dialogue_index, saved_at FROM game_saves WHERE user_id = $1',
      [userId]
    );

    if (saveResult.rows.length === 0) {
      return NextResponse.json(
        { hasSave: false },
        { status: 200 }
      );
    }

    const save = saveResult.rows[0];

    return NextResponse.json(
      {
        hasSave: true,
        sceneId: save.scene_id,
        dialogueIndex: save.dialogue_index,
        savedAt: save.saved_at,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Load game error:', error);
    return NextResponse.json(
      { error: 'Ошибка загрузки прогресса' },
      { status: 500 }
    );
  }
}
