import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50 px-5 py-8 text-zinc-900">
      <section className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="mb-3 text-sm font-medium text-emerald-700">
            Штаб помощи животным
          </p>

          <h1 className="mb-4 text-3xl font-bold leading-tight">
            Шанс. Помощь животным
          </h1>

          <p className="mb-6 text-base leading-relaxed text-zinc-700">
            Увидели животное, которому может быть нужна помощь? Отправьте фото,
            место и короткое описание — волонтёры получат заявку.
          </p>

          <Link
            href="/report"
            className="block rounded-2xl bg-emerald-700 px-5 py-4 text-center text-lg font-semibold text-white"
          >
            Сообщить о животном
          </Link>

          <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
            Не рискуйте собой. Не подходите близко к агрессивному или раненому
            животному.
          </p>

          <div className="mt-6 flex justify-between text-sm text-zinc-500">
            <Link href="/privacy">Политика обработки данных</Link>
            <Link href="/login">Вход для волонтёров</Link>
          </div>
        </div>
      </section>
    </main>
  );
}