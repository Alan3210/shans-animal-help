import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import ReportsMap from "@/components/ReportsMapClient";

export const dynamic = "force-dynamic";

export default async function AdminMapPage() {
  const { data: reports, error } = await supabaseAdmin
    .from("animal_reports")
    .select(
      "id, animal_type, animal_condition, priority, status, location_address, location_lat, location_lng"
    )
    .not("location_lat", "is", null)
    .not("location_lng", "is", null)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-stone-50 px-5 py-8 text-zinc-900">
        <section className="mx-auto max-w-6xl">
          <Link href="/admin" className="mb-6 inline-block text-emerald-700">
            ← Назад к заявкам
          </Link>

          <p className="text-red-700">
            Ошибка загрузки карты: {error.message}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-8 text-zinc-900">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Карта заявок</h1>
            <p className="mt-2 text-zinc-600">
              На карте отображаются заявки с координатами.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-2xl border border-emerald-700 px-4 py-3 font-semibold text-emerald-800"
          >
            ← Список заявок
          </Link>
        </div>

        <ReportsMap reports={reports || []} />
      </section>
    </main>
  );
}