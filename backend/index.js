const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS для GitHub Pages
app.use(cors({
  origin: '*'
}));

app.use(express.json());

// Маршруты
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'QuizAPI работает!' });
});

app.get('/api/quiz/categories', (req, res) => {
  res.json([
    { id: '1', title: 'JavaScript', description: 'Проверь знания JS' },
    { id: '2', title: 'Python', description: 'Основы Python' },
    { id: '3', title: 'HTML/CSS', description: 'Вёрстка и стили' }
  ]);
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Login:', username);
  
  if (username && password) {
    res.json({ 
      token: 'fake_token_' + Date.now(), 
      username: username
    });
  } else {
    res.status(401).json({ error: 'Неверные данные' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;
  console.log('Register:', username);
  
  if (username && password) {
    res.json({ message: 'Регистрация успешна' });
  } else {
    res.status(400).json({ error: 'Заполните все поля' });
  }
});

app.post('/api/quiz/generate', (req, res) => {
  const { topic, count = 5 } = req.body;
  
  const questions = [];
  for (let i = 0; i < count; i++) {
    questions.push({
      id: `q${i + 1}`,
      text: `Вопрос ${i + 1} по теме "${topic}"?`,
      options: ['Ответ 1', 'Ответ 2', 'Ответ 3', 'Ответ 4'],
      correct: 0
    });
  }
  
  res.json({ questions });
});

app.post('/api/quiz/submit', (req, res) => {
  const { points, correctAnswers, totalQuestions } = req.body;
  console.log('Submit:', { points, correctAnswers });
  
  res.json({
    points: points,
    level: Math.floor(points / 100) + 1,
    message: 'Результаты сохранены!'
  });
});

app.get('/api/quiz/leaderboard', (req, res) => {
  res.json([
    { username: 'Игрок1', points: 1500, level: 15, streak: 3 },
    { username: 'Игрок2', points: 1200, level: 12, streak: 5 },
    { username: 'Игрок3', points: 800, level: 8, streak: 2 }
  ]);
});

app.post('/api/quiz/admin/reset-leaderboard', (req, res) => {
  res.json({ message: 'Таблица лидеров сброшена' });
});

app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
});