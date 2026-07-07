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
          <div className="mb-6 flex justify-center">
            <img
              src="/logo.png"
              alt="АНО Шанс на жизнь"
              className="h-56 w-56 rounded-full object-contain"
            />
          </div>

          <p className="mb-6 text-center text-base leading-relaxed text-zinc-700">
            Увидели животное, которому может быть нужна помощь? Сообщите нам через приложение — мы получим заявку и оперативно отреагируем.
          </p>

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

          <label className="mt-4 flex items-start gap-3 text-sm leading-relaxed text-zinc-600">
            <input
              type="checkbox"
              checked={policyAccepted}
              onChange={(event) => setPolicyAccepted(event.target.checked)}
              className="mt-1 h-4 w-4 shrink-0"
            />

            <span>
              Чтобы отправить заявку, подтвердите ознакомление с{" "}
              <Link
                href="/privacy"
                className="font-medium text-emerald-700 underline underline-offset-4"
              >
                политикой обработки персональных данных
              </Link>
              .
            </span>
          </label>
        </div>
      </section>
    </main>
  );
}