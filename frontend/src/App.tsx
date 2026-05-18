import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Quiz from "./pages/Quiz";
import Leaderboard from "./pages/Leaderboard";
import Admin from "./pages/Admin";

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
          <Link to="/" className="text-xl font-bold flex items-center gap-2">
            🧠 QuizAI
          </Link>
          
          <div className="flex gap-6 items-center">
            <Link to="/" className="hover:text-blue-200 transition">Главная</Link>
            {token && (
              <>
                <Link to="/quiz" className="hover:text-blue-200 transition">Тест</Link>
                <Link to="/leaderboard" className="hover:text-blue-200 transition">Лидеры</Link>
                <Link to="/admin" className="hover:text-blue-200 transition">⚙️ Админ</Link>
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
                <Link to="/login" className="hover:text-blue-200 transition">Вход</Link>
                <Link to="/register" className="hover:text-blue-200 transition">Регистрация</Link>
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
        <Route path="/admin" element={token ? <Admin /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;