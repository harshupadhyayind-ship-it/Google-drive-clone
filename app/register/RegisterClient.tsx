"use client";

import { useState } from "react";

export default function RegisterClient() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async () => {
    await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(form),
    });

    window.location.href = "/login";
  };

  return (
     <div className="flex h-screen items-center justify-center">
      <div className="p-6 border rounded w-80 space-y-4">
        <h1 className="text-xl font-semibold">Register</h1>

        <input
          placeholder="Name"
          className="border p-2 w-full"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Email"
          className="border p-2 w-full"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white w-full py-2"
        >
          Register
        </button>
      </div>
    </div>
  );
}