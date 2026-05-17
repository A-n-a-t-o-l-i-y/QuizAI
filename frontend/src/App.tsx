import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Quiz from "./pages/Quiz";
import Leaderboard from "./pages/Leaderboard";
import Admin from "./pages/Admin"; // ✅ Импортируем админку

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
  };

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Навигация */}
        <nav className="bg-blue-600 text-white p-4 shadow-lg">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <a href="/" className="text-xl font-bold flex items-center gap-2">
              🧠 QuizAI
            </a>
            
            <div className="flex gap-6 items-center">
              <a href="/" className="hover:text-blue-200 transition">Главная</a>
              {token && (
                <>
                  <a href="/quiz" className="hover:text-blue-200 transition">Тест</a>
                  <a href="/leaderboard" className="hover:text-blue-200 transition">Лидеры</a>
                  <a href="/admin" className="hover:text-blue-200 transition">⚙️ Админ</a>
                </>
              )}
              {token ? (
                <button 
                  onClick={logout} 
                  className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition"
                >
                  Выйти
                </button>
              ) : (
                <>
                  <a href="/login" className="hover:text-blue-200 transition">Вход</a>
                  <a href="/register" className="hover:text-blue-200 transition">Регистрация</a>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Маршруты */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!token ? <Register /> : <Navigate to="/" />} />
          <Route path="/quiz" element={token ? <Quiz /> : <Navigate to="/login" />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin" element={token ? <Admin /> : <Navigate to="/login" />} /> {/* ✅ Новый маршрут */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
  );
}

export default App;