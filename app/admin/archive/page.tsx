import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { formatPriority, formatStatus } from "@/lib/formatters";

export const dynamic = "force-dynamic";

export default async function AdminArchivePage() {
  const { data: reports, error } = await supabaseAdmin
    .from("animal_reports")
    .select("*")
    .eq("archived", true)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-stone-50 px-3 py-8 text-zinc-900 xl:px-6">
        <section className="mx-auto max-w-[1800px]">
          <p className="text-red-700">Ошибка загрузки архива: {error.message}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 px-3 py-8 text-zinc-900 xl:px-6">
      <section className="mx-auto max-w-[1800px]">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Архив заявок</h1>
            <p className="mt-2 text-zinc-600">
              Здесь отображаются заявки, отправленные в архив.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-2xl border border-emerald-700 px-4 py-3 font-semibold text-emerald-800"
          >
            ← Активные заявки
          </Link>
        </div>

        <div className="overflow-x-auto rounded-3xl bg-white shadow-sm">
          <table className="w-full min-w-[1500px] text-left text-sm">
            <thead className="bg-stone-100 text-zinc-600">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Животное</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3">Приоритет</th>
                <th className="px-4 py-3">Ответственный</th>
                <th className="px-4 py-3">Место</th>
                <th className="px-4 py-3">Контакт</th>
                <th className="px-4 py-3">Создано</th>
                <th className="px-4 py-3">Действие</th>
              </tr>
            </thead>

            <tbody>
              {(reports || []).map((report) => (
                <tr key={report.id} className="border-t border-stone-100">
                  <td className="px-4 py-3 text-zinc-500">
                    #{report.id.slice(0, 8)}
                  </td>

                  <td className="px-4 py-3 font-medium">
                    {report.animal_type} · {report.animal_condition}
                  </td>

                  <td className="px-4 py-3">{formatStatus(report.status)}</td>

                  <td className="px-4 py-3">
                    {formatPriority(report.priority)}
                  </td>

                  <td className="px-4 py-3">{report.responsible || "—"}</td>

                  <td className="max-w-[360px] truncate px-4 py-3">
                    {report.location_address || "—"}
                  </td>

                  <td className="px-4 py-3">
                    {report.reporter_phone || "—"}
                  </td>

                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(report.created_at).toLocaleString("ru-RU")}
                  </td>

                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/reports/${report.id}`}
                      className="font-semibold text-emerald-700"
                    >
                      Открыть
                    </Link>
                  </td>
                </tr>
              ))}

              {reports?.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-zinc-500" colSpan={9}>
                    В архиве пока нет заявок.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}