import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { formatPriority, formatStatus } from "@/lib/formatters";
import StatusUpdateForm from "@/components/StatusUpdateForm";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: report, error } = await supabaseAdmin
    .from("animal_reports")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !report) {
    return (
      <main className="min-h-screen bg-stone-50 px-5 py-8 text-zinc-900">
        <section className="mx-auto max-w-3xl">
          <Link href="/admin" className="mb-6 inline-block text-emerald-700">
            ← Назад к заявкам
          </Link>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-red-700">Заявка не найдена.</p>
          </div>
        </section>
      </main>
    );
  }

  const mapUrl =
    report.location_lat && report.location_lng
      ? `https://www.google.com/maps?q=${report.location_lat},${report.location_lng}`
      : null;

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-8 text-zinc-900">
      <section className="mx-auto max-w-3xl">
        <Link href="/admin" className="mb-6 inline-block text-emerald-700">
          ← Назад к заявкам
        </Link>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm">
              #{report.id.slice(0, 8)}
            </span>

            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-800">
              {formatStatus(report.status)}
            </span>

            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-900">
              {formatPriority(report.priority)}
            </span>

            {report.requires_specialist && (
              <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-800">
                ⚠ Профильный специалист
              </span>
            )}
          </div>

          <h1 className="mb-4 text-3xl font-bold">
            {report.animal_type} · {report.animal_condition}
          </h1>

          {report.photos?.length > 0 ? (
  <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
    {report.photos.map((photoUrl: string, index: number) => (
      <a
        key={photoUrl}
        href={photoUrl}
        target="_blank"
        rel="noreferrer"
        className="block"
      >
        <img
          src={photoUrl}
          alt={`Фото животного ${index + 1}`}
          className="h-64 w-full rounded-3xl object-cover"
        />
      </a>
    ))}
  </div>
) : (
  <div className="mb-6 flex h-64 items-center justify-center rounded-3xl bg-zinc-100 text-zinc-500">
    Фото нет
  </div>
)}

          <div className="space-y-3 text-zinc-700">
            <p>
              <strong>Место:</strong> {report.location_address || "—"}
            </p>

            {mapUrl && (
              <p>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-emerald-700"
                >
                  📍 Открыть на карте
                </a>
              </p>
            )}

            <p>
              <strong>Комментарий:</strong> {report.situation_comment || "—"}
            </p>

            <p>
              <strong>Контакт:</strong> {report.reporter_phone || "—"}
            </p>

            <p>
              <strong>Создано:</strong>{" "}
              {new Date(report.created_at).toLocaleString("ru-RU")}
            </p>
          </div>

          <div className="mt-6 border-t pt-6">
            <h2 className="mb-3 text-xl font-semibold">Работа с заявкой</h2>

            <StatusUpdateForm
              reportId={report.id}
              currentStatus={report.status}
            />
          </div>
        </div>
      </section>
    </main>
  );
}