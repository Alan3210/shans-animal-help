"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [policyAccepted, setPolicyAccepted] = useState(false);

  function handleReportClick() {
    if (!policyAccepted) return;

    router.push("/report");
  }

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-8 text-zinc-900">
      <section className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          
          <div className="mb-5 flex justify-center">
  <img
    src="/logo.png"
    alt="АНО Шанс на жизнь"
    className="h-56 w-56 rounded-full object-contain"
  />
</div>
          
          
          
          <h1 className="mb-4 text-center text-3xl font-bold leading-tight">
            Шанс. Помощь животным
          </h1>
          <p className="mb-6 text-center text-base leading-relaxed text-zinc-700">
            Увидели животное, которому может быть нужна помощь? Отправьте фото,
            место и короткое описание — волонтёры получат заявку.
          </p>

          <label className="mb-4 flex items-start gap-3 rounded-2xl bg-stone-50 p-4 text-sm leading-relaxed text-zinc-700">
            <input
              type="checkbox"
              checked={policyAccepted}
              onChange={(event) => setPolicyAccepted(event.target.checked)}
              className="mt-1 h-4 w-4"
            />

            <span>
              Я ознакомлен(а) с{" "}
              <Link
                href="/privacy"
                className="font-medium text-emerald-700 underline underline-offset-4"
              >
                политикой обработки персональных данных
              </Link>
            </span>
          </label>

          <button
            type="button"
            onClick={handleReportClick}
            disabled={!policyAccepted}
            className={`block w-full rounded-2xl px-5 py-4 text-center text-lg font-semibold text-white transition ${
              policyAccepted
                ? "bg-emerald-700 hover:bg-emerald-800"
                : "cursor-not-allowed bg-zinc-300"
            }`}
          >
            Сообщить о животном
          </button>

          {!policyAccepted && (
            <p className="mt-3 text-center text-sm leading-relaxed text-zinc-600">
              Чтобы отправить заявку, сначала подтвердите ознакомление с
              политикой.
            </p>
          )}

          <div className="mt-6 flex justify-end text-sm text-zinc-500">
            <Link href="/login">Вход для админов</Link>
          </div>
        </div>
      </section>
    </main>
  );
}