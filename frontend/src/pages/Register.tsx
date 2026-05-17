import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) navigate("/login");
    else alert(data.error);
  };

  return (
    <form onSubmit={handleRegister} className="max-w-sm mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Регистрация</h2>
      <input className="w-full mb-3 p-2 border rounded" placeholder="Логин" value={username} onChange={e => setUsername(e.target.value)} required />
      <input className="w-full mb-4 p-2 border rounded" type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required />
      <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Создать аккаунт</button>
    </form>
  );
}