import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../db";

const router = Router();

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Заполните поля" });

  try {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return res.status(400).json({ error: "Имя занято" });

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { username, password: hash } });
    res.json({ message: "Успешно", id: user.id });
  } catch (e) {
    res.status(500).json({ error: "Ошибка регистрации" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Неверные данные" });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, username: user.username, points: user.points, level: user.level, streak: user.streak } });
  } catch {
    res.status(500).json({ error: "Ошибка входа" });
  }
});

export default router;