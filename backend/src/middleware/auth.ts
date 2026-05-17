import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Расширяем интерфейс Request, чтобы TypeScript знал про userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Требуется авторизация" });
    }

    const token = authHeader.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ error: "Токен не найден" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    
    // Добавляем userId в запрос
    req.userId = decoded.id;
    
    console.log(`✅ Пользователь авторизован: ${req.userId}`);
    next();
    
  } catch (error) {
    console.error("❌ Ошибка аутентификации:", error);
    return res.status(401).json({ error: "Неверный токен" });
  }
};