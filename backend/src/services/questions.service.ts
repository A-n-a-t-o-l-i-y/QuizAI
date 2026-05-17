import * as fs from 'fs';
import * as path from 'path';

export interface QuestionPayload {
  text: string;
  options: string[];
  correct: number;
  category?: string;
}

export interface TestFile {
  id: string;
  title: string;
  description?: string;
  questions: QuestionPayload[];
}

export class QuestionsService {
  private questionsDir: string;

  constructor() {
    // Папка с вопросами лежит на уровень выше папки src
    this.questionsDir = path.join(__dirname, '../../questions');
  }

  // Загрузить метаданные теста (id, title, description)
  getTestsList(): TestFile[] {
    const tests: TestFile[] = [];
    
    try {
      if (!fs.existsSync(this.questionsDir)) return tests;

      const files = fs.readdirSync(this.questionsDir).filter(f => f.endsWith('.json'));
      
      for (const file of files) {
        try {
          const filePath = path.join(this.questionsDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          const data: TestFile = JSON.parse(content);
          
          // Если id нет, берем из имени файла
          if (!data.id) data.id = file.replace('.json', '');
          tests.push(data);
        } catch (err) {
          console.error(`Ошибка чтения файла ${file}:`, err);
        }
      }
    } catch (err) {
      console.error("Ошибка чтения папки вопросов:", err);
    }
    return tests;
  }

  // Получить конкретный тест по ID
  getTestById(testId: string): TestFile | null {
    const tests = this.getTestsList();
    return tests.find(t => t.id === testId) || null;
  }

  // Получить случайные вопросы из конкретного теста
  getQuestionsFromTest(testId: string, count: number = 5): QuestionPayload[] {
    const test = this.getTestById(testId);
    if (!test || !test.questions || test.questions.length === 0) return [];

    const shuffled = [...test.questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}

export const questionsService = new QuestionsService();