import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Валидация
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Никнейм и пароль обязательны' },
        { status: 400 }
      );
    }

    // Поиск пользователя
    const result = await pool.query(
      'SELECT id, username, password_hash, created_at FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Неверный никнейм или пароль' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Неверный никнейм или пароль' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        message: 'Вход выполнен успешно',
        user: {
          id: user.id,
          username: user.username,
          createdAt: user.created_at,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера при входе' },
      { status: 500 }
    );
  }
}
