import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth";
const quizRouter = require("./routes/quiz").default;

dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 3000;

// ✅ НАСТРОЙКА CORS ДЛЯ GITHUB PAGES
const allowedOrigins = [
  'https://A-n-a-t-o-l-i-y.github.io',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ Блокирован origin:', origin);
      // Временно разрешаем все для отладки
      callback(null, true);
    }
  },
  credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/quiz", quizRouter);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`📍 Разрешены CORS для: ${allowedOrigins.join(', ')}`);
});