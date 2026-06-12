"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setIsLoading(true);

    console.log("Пробуем войти:", email);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      console.error("Ошибка входа:", error.message);
      setErrorMessage("Ошибка входа: " + error.message);
      return;
    }

    console.log("Вход успешный");

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-8 text-zinc-900">
      <section className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="mb-4 text-2xl font-bold">Вход для волонтёров</h1>

          {errorMessage && (
            <div className="mb-4 rounded-2xl bg-red-50 p-4 text-sm text-red-800">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-zinc-300 p-3"
            />

            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-zinc-300 p-3"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-emerald-700 px-5 py-4 font-semibold text-white disabled:bg-zinc-400"
            >
              {isLoading ? "Входим..." : "Войти"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}