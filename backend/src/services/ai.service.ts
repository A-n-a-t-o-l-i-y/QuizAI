import { questionsService } from './questions.service';

export interface QuestionPayload {
  text: string;
  options: string[];
  correct: number;
  category?: string;
}

const API_BASE_URL = process.env.API_BASE_URL;
const API_MODEL = process.env.API_MODEL;
const API_KEY = process.env.DEEPSEEK_API_KEY;

export async function generateQuestions(topic: string, count = 5): Promise<QuestionPayload[]> {
  // Если API не настроен, возвращаем пустой массив или fallback
  if (!API_KEY || API_KEY === "local") {
     console.log("⚠️ API отключен, возвращаем fallback вопросы");
     return [
        { text: `Вопрос по теме ${topic} (API отключен)`, options: ["1", "2", "3", "4"], correct: 0 }
     ];
  }

  console.log(`🤖 Генерация через API: ${API_MODEL}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
        "HTTP-Referer": "http://localhost:3000"
      },
      body: JSON.stringify({
        model: API_MODEL,
        messages: [
          { role: "system", content: "Return ONLY JSON array. Format: [{\"text\": \"Question\", \"options\": [\"A\",\"B\",\"C\",\"D\"], \"correct\": 0}]" },
          { role: "user", content: `Generate ${count} questions about: ${topic}` }
        ],
        max_tokens: 1000
      }),
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    const clean = content.replace(/```json\s*|\s*```/g, "");
    return JSON.parse(clean);
    
  } catch (error) {
    console.error("❌ Ошибка API:", error);
    return [];
  }
}