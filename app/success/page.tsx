import Link from "next/link";

export default function SuccessPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  return (
    <main className="min-h-screen bg-stone-50 px-5 py-8 text-zinc-900">
      <section className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="mb-4 text-2xl font-bold">
            Спасибо! Заявка отправлена волонтёрам.
          </h1>

          {searchParams.id && (
            <p className="mb-4 text-zinc-700">Номер заявки: #{searchParams.id}</p>
          )}

          <p className="mb-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
            Если животное в опасности, оставайтесь на безопасном расстоянии.
          </p>

          <div className="space-y-3">
            <Link
              href="/report"
              className="block rounded-2xl bg-emerald-700 px-5 py-4 text-center font-semibold text-white"
            >
              Отправить ещё одну заявку
            </Link>

            <Link
              href="/"
              className="block rounded-2xl border border-zinc-300 px-5 py-4 text-center font-semibold"
            >
              На главный экран
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}