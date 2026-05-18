const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// ВСЕ МАРШРУТЫ
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running!', timestamp: Date.now() });
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'QuizAPI is alive!' });
});

app.get('/api/quiz/categories', (req, res) => {
  res.json([
    { id: 'js', title: 'JavaScript', description: 'Проверь знания JS' },
    { id: 'py', title: 'Python', description: 'Основы Python' },
    { id: 'html', title: 'HTML/CSS', description: 'Вёрстка и стили' }
  ]);
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Login:', username, password);
  
  if (username && password) {
    res.json({ token: 'test_token_123', username });
  } else {
    res.status(401).json({ error: 'Неверные данные' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;
  console.log('Register:', username);
  
  if (username && password) {
    res.json({ message: 'Регистрация успешна', user: { username } });
  } else {
    res.status(400).json({ error: 'Заполните поля' });
  }
});

app.post('/api/quiz/generate', (req, res) => {
  const { topic, count = 3 } = req.body;
  const questions = [];
  
  for (let i = 0; i < count; i++) {
    questions.push({
      id: `q_${i}`,
      text: `${i+1}. Вопрос по теме "${topic}"?`,
      options: ['Ответ A', 'Ответ B', 'Ответ C', 'Ответ D'],
      correct: 0
    });
  }
  
  res.json({ questions });
});

app.post('/api/quiz/submit', (req, res) => {
  const { points } = req.body;
  res.json({ points, level: Math.floor(points / 50) + 1, message: 'Сохранено!' });
});

app.get('/api/quiz/leaderboard', (req, res) => {
  res.json([
    { username: 'Чемпион', points: 500, level: 10, streak: 5 },
    { username: 'Мастер', points: 350, level: 7, streak: 3 },
    { username: 'Новичок', points: 100, level: 2, streak: 1 }
  ]);
});

app.post('/api/quiz/admin/reset-leaderboard', (req, res) => {
  res.json({ message: 'Таблица сброшена' });
});

// Ловим 404
app.use('*', (req, res) => {
  res.status(404).json({ error: `Маршрут ${req.method} ${req.url} не найден` });
});

app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
  console.log(`✅ Доступен по адресу: http://localhost:${PORT}`);
});