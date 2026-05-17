import { useState, useEffect } from "react";

interface Question {
  id: string;
  text: string;
  options: string[];
  correct: number;
}

interface TestCategory {
  id: string;
  title: string;
  description?: string;
}

export default function Quiz() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 });
  
  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Загрузка списка тестов
  useEffect(() => {
    fetch("/api/quiz/categories")
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        if (data.length > 0) setSelectedCategory(data[0].id);
      })
      .catch(err => console.error("Ошибка загрузки категорий", err));
  }, []);

  // Генерация теста
  const generate = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) { 
      alert("Не авторизован"); 
      setLoading(false); 
      return; 
    }

    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          topic: selectedCategory, 
          count: 5 
        }),
      });
      
      if (!res.ok) throw new Error("Ошибка генерации");
      
      const data = await res.json();
      setQuestions(data.questions);
      setAnswers({});
      setResult(null);
      setStats({ correct: 0, incorrect: 0 });
    } catch (error) {
      console.error(error);
      alert("Не удалось загрузить вопросы");
    } finally {
      setLoading(false);
    }
  };

  // ✅ ОТПРАВКА РЕЗУЛЬТАТОВ
  const submit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Не авторизован");
      return;
    }

    // Считаем правильные ответы
    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct) {
        correctCount++;
      }
    });

    const points = correctCount * 10; // 10 очков за правильный ответ

    console.log("📤 Отправка результатов:", { 
      points, 
      correctAnswers: correctCount, 
      totalQuestions: questions.length 
    });

    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          points: points,
          correctAnswers: correctCount,
          totalQuestions: questions.length
        }),
      });

      console.log("📥 Ответ сервера:", res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Ошибка отправки");
      }

      const resultData = await res.json();
      console.log("✅ Результат сохранён:", resultData);
      
      setResult(resultData);
      setStats({ correct: correctCount, incorrect: questions.length - correctCount });
    } catch (error: any) {
      console.error("❌ Ошибка:", error);
      alert("Не удалось отправить ответы: " + error.message);
    }
  };

  const isFinished = !!result;

  return (
    <div className="max-w-xl mx-auto py-6 px-4">
      <h2 className="text-2xl font-bold mb-6">🎯 Пройти тест</h2>

      {/* Выбор теста */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow border border-blue-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          📚 Выберите тест:
        </label>
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
          disabled={loading || questions.length > 0}
        >
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.title}</option>
          ))}
        </select>
        {categories.find(c => c.id === selectedCategory)?.description && (
          <p className="text-xs text-gray-500 mt-2">
            {categories.find(c => c.id === selectedCategory)?.description}
          </p>
        )}
      </div>
      
      {/* Кнопка старт */}
      {questions.length === 0 && (
        <button 
          onClick={generate} 
          disabled={loading} 
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? "⏳ Загрузка..." : "🚀 Начать тест"}
        </button>
      )}

      {/* Вопросы */}
      {questions.map((q, i) => {
        const userAnswer = answers[q.id];
        return (
          <div key={q.id} className="mb-6 p-5 bg-white border rounded-xl shadow-sm">
            <p className="font-bold text-lg mb-4">{i + 1}. {q.text}</p>
            {q.options.map((opt, idx) => {
              const isSelected = userAnswer === idx;
              const isCorrect = q.correct === idx;
              let style = "bg-gray-50 hover:bg-gray-100 border-gray-200";
              
              if (isFinished) {
                if (isSelected && isCorrect) style = "bg-green-100 border-green-500 text-green-800";
                else if (isSelected && !isCorrect) style = "bg-red-100 border-red-500 text-red-800";
                else if (!isSelected && isCorrect) style = "bg-green-50 border-green-300 text-green-700";
              }

              return (
                <div 
                  key={idx} 
                  onClick={() => !isFinished && setAnswers(prev => ({...prev, [q.id]: idx}))}
                  className={`p-3 border rounded-lg mb-2 cursor-pointer flex items-center transition ${style} ${isSelected ? "ring-2 ring-blue-400" : ""}`}
                >
                  <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  {opt}
                  {isFinished && isCorrect && <span className="ml-auto">✅</span>}
                  {isFinished && isSelected && !isCorrect && <span className="ml-auto">❌</span>}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Кнопка завершения */}
      {questions.length > 0 && !isFinished && Object.keys(answers).length === questions.length && (
        <button 
          onClick={submit} 
          className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 shadow-lg mb-4"
        >
          ✅ Завершить тест
        </button>
      )}

      {/* Результат */}
      {result && (
        <div className="mt-8 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl text-center">
          <h3 className="text-2xl font-bold mb-4">🎉 Тест завершён!</h3>
          <div className="text-4xl font-bold text-blue-600 mb-2">{stats.correct} / {questions.length}</div>
          <p className="text-gray-600 mb-6">Правильных ответов</p>
          <p className="text-lg mb-2">Очки: <strong>+{result.points}</strong></p>
          <p className="text-sm mb-6">Уровень: <strong>{result.level}</strong></p>
          <button 
            onClick={() => { setQuestions([]); setResult(null); }} 
            className="text-blue-600 underline hover:text-blue-800"
          >
            Пройти другой тест
          </button>
        </div>
      )}
    </div>
  );
}