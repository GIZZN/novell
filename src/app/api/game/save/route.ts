import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { username, sceneId, dialogueIndex } = await request.json();

    if (!username || !sceneId || dialogueIndex === undefined) {
      return NextResponse.json(
        { error: 'Недостаточно данных для сохранения' },
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

    // Сохранить или обновить прогресс
    await pool.query(
      `INSERT INTO game_saves (user_id, scene_id, dialogue_index, saved_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) 
       DO UPDATE SET scene_id = $2, dialogue_index = $3, saved_at = CURRENT_TIMESTAMP`,
      [userId, sceneId, dialogueIndex]
    );

    return NextResponse.json(
      { message: 'Прогресс сохранен' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Save game error:', error);
    return NextResponse.json(
      { error: 'Ошибка сохранения прогресса' },
      { status: 500 }
    );
  }
}
