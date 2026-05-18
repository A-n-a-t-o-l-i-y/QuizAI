import { useEffect, useState } from "react";
import { API_URL } from '../config';

interface User { username: string; points: number; level: number; streak: number; }

export default function Leaderboard() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/quiz/leaderboard`)
      .then(r => r.json())
      .then(setUsers)
      .catch(err => console.error("Ошибка загрузки лидеров", err));
  }, []);

  return (
    <div className="max-w-xl mx-auto py-6">
      <h2 className="text-2xl font-bold mb-4">📊 Таблица лидеров</h2>
      <table className="w-full border-collapse bg-white rounded shadow">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="p-2">#</th>
            <th className="p-2">Игрок</th>
            <th className="p-2">Очки</th>
            <th className="p-2">Ур.</th>
            <th className="p-2">Серия</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={i} className="border-b hover:bg-gray-50">
              <td className="p-2 text-center">{i + 1}</td>
              <td className="p-2">{u.username}</td>
              <td className="p-2 font-bold">{u.points}</td>
              <td className="p-2 text-blue-600">{u.level}</td>
              <td className="p-2">🔥 {u.streak}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}