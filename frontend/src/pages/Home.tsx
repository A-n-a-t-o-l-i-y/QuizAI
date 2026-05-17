export default function Home() {
  const token = localStorage.getItem("token");
  return (
    <div className="text-center py-20">
      <h2 className="text-4xl font-bold mb-4">Добро пожаловать в QuizAI</h2>
      <p className="text-lg text-gray-600 mb-6">Генерация вопросов через ИИ, геймификация и таблица лидеров</p>
      {!token && (
        <div className="space-x-4">
          <a href="/register" className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">Зарегистрироваться</a>
          <a href="/login" className="border border-blue-600 text-blue-600 px-6 py-3 rounded hover:bg-blue-50">Войти</a>
        </div>
      )}
      {token && <p className="text-green-600 font-medium">Вы авторизованы! 🎮 Перейдите к тесту.</p>}
    </div>
  );
}