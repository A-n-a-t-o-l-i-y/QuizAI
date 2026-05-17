import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import prisma from "../db";
import * as fs from "fs";
import * as path from "path";

const router = Router();

// Путь к папке с вопросами (на уровень выше src)
const QUESTIONS_DIR = path.join(__dirname, "../../questions");

// ==========================================
// 1. СПИСОК ТЕСТОВ (GET /api/quiz/categories)
// ==========================================
router.get("/categories", async (_req: Request, res: Response) => {
  try {
    // Проверяем, существует ли папка
    if (!fs.existsSync(QUESTIONS_DIR)) {
      return res.json([]);
    }

    const files = fs.readdirSync(QUESTIONS_DIR).filter((f) => f.endsWith(".json"));
    const tests = [];

    for (const file of files) {
      try {
        const filePath = path.join(QUESTIONS_DIR, file);
        const content = fs.readFileSync(filePath, "utf-8");
        const data = JSON.parse(content);

        tests.push({
          id: data.id || file.replace(".json", ""),
          title: data.title || "Без названия",
          description: data.description || "",
        });
      } catch (err) {
        console.error(`Ошибка чтения файла ${file}:`, err);
      }
    }

    // ✅ СОРТИРОВКА: Тест "project" всегда первый, остальные по алфавиту
    tests.sort((a, b) => {
      if (a.id === "project") return -1;
      if (b.id === "project") return 1;
      return a.title.localeCompare(b.title);
    });

    res.json(tests);
  } catch (error) {
    console.error("Ошибка загрузки категорий:", error);
    res.status(500).json({ error: "Не удалось загрузить список тестов" });
  }
});

// ==========================================
// 2. ГЕНЕРАЦИЯ ВОПРОСОВ (POST /api/quiz/generate)
// ==========================================
router.post("/generate", authMiddleware, async (req: any, res: Response) => {
  const { topic, count = 5 } = req.body; // topic здесь — это ID файла

  try {
    console.log(`📂 Запрос теста: ${topic}, вопросов: ${count}`);

    const filePath = path.join(QUESTIONS_DIR, `${topic}.json`);

    // Проверяем, существует ли файл
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Тест не найден" });
    }

    // Читаем и парсим файл
    const content = fs.readFileSync(filePath, "utf-8");
    const testData = JSON.parse(content);
    let questions = testData.questions || [];

    if (questions.length === 0) {
      return res.status(404).json({ error: "В этом тесте нет вопросов" });
    }

    // Перемешиваем вопросы случайным образом
    questions = questions.sort(() => Math.random() - 0.5);

    // Берём нужное количество
    questions = questions.slice(0, count);

    // Добавляем временные уникальные ID для каждого вопроса (чтобы фронтенд мог их идентифицировать)
    const questionsWithIds = questions.map((q: any, index: number) => ({
      ...q,
      id: `${topic}-${index}-${Date.now()}`,
    }));

    console.log(`✅ Отправлено ${questionsWithIds.length} вопросов`);
    res.json({ questions: questionsWithIds });

  } catch (error: any) {
    console.error("❌ Ошибка генерации:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

// ==========================================
// 3. ОТПРАВКА РЕЗУЛЬТАТОВ (POST /api/quiz/submit)
// ==========================================
router.post("/submit", authMiddleware, async (req: any, res: Response) => {
  const { points, correctAnswers, totalQuestions } = req.body;

  try {
    const userId = req.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    // Расчет новой серии дней (Streak)
    const now = new Date();
    const lastQuiz = new Date(user.lastQuiz);
    const diffTime = Math.abs(now.getTime() - lastQuiz.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let newStreak = user.streak;
    if (diffDays === 1) {
      newStreak = user.streak + 1; // Прошел день подряд
    } else if (diffDays > 1) {
      newStreak = 1; // Пропустил день, серия сбросилась
    }
    // Если diffDays === 0 (тест сегодня уже был), серия не меняется

    // Расчет уровня (каждые 100 очков = +1 уровень)
    const newTotalPoints = user.points + points;
    const newLevel = Math.floor(newTotalPoints / 100) + 1;

    // Обновляем пользователя в БД
    await prisma.user.update({
      where: { id: userId },
      data: {
        points: newTotalPoints,
        level: newLevel,
        streak: newStreak,
        lastQuiz: now,
      },
    });

    console.log(`💾 Результат сохранен: +${points} очков, уровень ${newLevel}`);

    res.json({
      points: points,
      level: newLevel,
      streak: newStreak,
      correct: correctAnswers,
      total: totalQuestions,
    });
  } catch (error: any) {
    console.error("❌ Ошибка сохранения результата:", error);
    res.status(500).json({ error: "Не удалось сохранить результат" });
  }
});

// ==========================================
// 4. ТАБЛИЦА ЛИДЕРОВ (GET /api/quiz/leaderboard)
// ==========================================
router.get("/leaderboard", async (_req: Request, res: Response) => {
  try {
    const leaders = await prisma.user.findMany({
      orderBy: { points: "desc" },
      take: 10,
      select: {
        username: true,
        points: true,
        level: true,
        streak: true,
      },
    });
    res.json(leaders);
  } catch (error) {
    res.status(500).json({ error: "Ошибка получения таблицы лидеров" });
  }
});

// ==========================================
// 🔐 АДМИН: Сброс таблицы лидеров
// ==========================================
router.post("/admin/reset-leaderboard", authMiddleware, async (req: any, res: Response) => {
  // Простая проверка на админа
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
  
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (user?.username !== ADMIN_USERNAME) {
    return res.status(403).json({ error: "Доступ запрещён. Только для администратора." });
  }

  try {
    await prisma.user.updateMany({
      data: {
        points: 0,
        level: 1,
        streak: 0,
      }
    });
    
    console.log("🗑️ Таблица лидеров сброшена администратором:", user.username);
    res.json({ message: "Статистика всех пользователей сброшена!" });
  } catch (error) {
    console.error("Ошибка сброса:", error);
    res.status(500).json({ error: "Не удалось сбросить статистику" });
  }
});

// ==========================================
// 🔐 АДМИН: Полный сброс базы данных
// ==========================================
router.post("/admin/reset-database", authMiddleware, async (req: any, res: Response) => {
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
  
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (user?.username !== ADMIN_USERNAME) {
    return res.status(403).json({ error: "Доступ запрещён" });
  }

  try {
    // Удаляем все ответы
    await prisma.answer.deleteMany({});
    // Удаляем все вопросы
    await prisma.question.deleteMany({});
    // Удаляем всех пользователей (кроме админа - опционально)
    await prisma.user.deleteMany({});
    
    console.log("💀 БАЗА ДАННЫХ ПОЛНОСТЬЮ ОЧИЩЕНА администратором:", user.username);
    res.json({ message: "База данных полностью очищена!" });
  } catch (error) {
    console.error("Ошибка очистки БД:", error);
    res.status(500).json({ error: "Не удалось очистить базу данных" });
  }
});

export default router;