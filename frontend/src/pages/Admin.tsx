import { useState } from "react";
import { API_URL } from "../config";

export default function Admin() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const resetLeaderboard = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    
    try {
      const res = await fetch(`${API_URL}/api/quiz/admin/reset-leaderboard`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMessage(data.message || data.error);
    } catch {
      setMessage("Ошибка сети");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <h2 className="text-2xl font-bold mb-4">⚙️ Админ-панель</h2>
      <button 
        onClick={resetLeaderboard} 
        disabled={loading}
        className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? "Сброс..." : "🗑️ Сбросить таблицу лидеров"}
      </button>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}