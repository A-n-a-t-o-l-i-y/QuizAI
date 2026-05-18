import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Разрешаем CORS для GitHub Pages
app.use(cors({
  origin: [
    'https://A-n-a-t-o-l-i-y.github.io',
    'http://localhost:5173',
    'http://localhost:3000'
  ]
}));

app.use(express.json());

// ✅ МАРШРУТ /health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Главный маршрут
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'QuizAPI работает!' });
});

// Категории тестов
app.get('/api/quiz/categories', (req, res) => {
  res.json([
    { id: '1', title: 'JavaScript', description: 'Проверь знания JS' },
    { id: '2', title: 'Python', description: 'Основы Python' },
    { id: '3', title: 'HTML/CSS', description: 'Вёрстка и стили' }
  ]);
});

// Логин
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', username);
  
  if (username && password) {
    res.json({ 
      token: 'fake_jwt_token_' + Date.now(), 
      username,
      points: 0,
      level: 1
    });
  } else {
    res.status(401).json({ error: 'Неверные логин или пароль' });
  }
});

// Регистрация
app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;
  console.log('Register attempt:', username);
  
  if (username && password) {
    res.json({ 
      message: 'Регистрация успешна',
      user: { username }
    });
  } else {
    res.status(400).json({ error: 'Заполните все поля' });
  }
});

// Генерация вопросов
app.post('/api/quiz/generate', (req, res) => {
  const { topic, count = 5 } = req.body;
  
  const questions = [];
  for (let i = 0; i < count; i++) {
    questions.push({
      id: `q${i + 1}`,
      text: `Вопрос ${i + 1} по теме "${topic}"?`,
      options: [
        'Вариант ответа 1',
        'Вариант ответа 2',
        'Вариант ответа 3',
        'Вариант ответа 4'
      ],
      correct: 0
    });
  }
  
  res.json({ questions });
});

// Отправка результатов
app.post('/api/quiz/submit', (req, res) => {
  const { points, correctAnswers, totalQuestions } = req.body;
  const token = req.headers.authorization;
  
  console.log('Submit results:', { points, correctAnswers, totalQuestions });
  
  res.json({
    points: points,
    level: Math.floor(points / 100) + 1,
    message: 'Результаты сохранены!'
  });
});

// Таблица лидеров
app.get('/api/quiz/leaderboard', (req, res) => {
  res.json([
    { username: 'Тестовый_Игрок1', points: 1500, level: 15, streak: 3 },
    { username: 'Тестовый_Игрок2', points: 1200, level: 12, streak: 5 },
    { username: 'Тестовый_Игрок3', points: 800, level: 8, streak: 2 }
  ]);
});

// Сброс таблицы лидеров (админ)
app.post('/api/quiz/admin/reset-leaderboard', (req, res) => {
  res.json({ message: 'Таблица лидеров сброшена' });
});

// Обработка 404
app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.url);
  res.status(404).json({ error: 'Маршрут не найден' });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});