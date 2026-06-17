import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { formatPriority, formatStatus } from "@/lib/formatters";
import StatusUpdateForm from "@/components/StatusUpdateForm";
import CommentForm from "@/components/CommentForm";
import ArchiveButton from "@/components/ArchiveButton";

export const dynamic = "force-dynamic";

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

  const { data: comments } = await supabaseAdmin
    .from("report_comments")
    .select("*")
    .eq("report_id", id)
    .order("created_at", { ascending: false });

  const { data: history } = await supabaseAdmin
    .from("report_history")
    .select("*")
    .eq("report_id", id)
    .order("created_at", { ascending: false });

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

            {report.responsible && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                👤 {report.responsible}
              </span>
            )}

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

            <div className="flex flex-wrap items-center gap-3">
              <StatusUpdateForm
                reportId={report.id}
                currentStatus={report.status}
              />

              <ArchiveButton reportId={report.id} />
            </div>
          </div>

          <div className="mt-6 border-t pt-6">
            <h2 className="mb-3 text-xl font-semibold">
              Комментарии координаторов
            </h2>

            {comments && comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-2xl bg-stone-50 p-4"
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                      <span className="font-semibold text-zinc-700">
                        {comment.author || "Координатор"}
                      </span>

                      <span>
                        {new Date(comment.created_at).toLocaleString("ru-RU")}
                      </span>
                    </div>

                    <p className="text-zinc-800">{comment.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">Комментариев пока нет.</p>
            )}

            <CommentForm
              reportId={report.id}
              defaultAuthor={report.responsible}
            />
          </div>

          <div className="mt-6 border-t pt-6">
            <h2 className="mb-3 text-xl font-semibold">История изменений</h2>

            {history && history.length > 0 ? (
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-zinc-50 p-4">
                    <div className="mb-1 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                      <span className="font-semibold text-zinc-700">
                        {item.author || "Координатор"}
                      </span>

                      <span>
                        {new Date(item.created_at).toLocaleString("ru-RU")}
                      </span>
                    </div>

                    <p className="text-zinc-800">{item.action}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">
                Истории изменений пока нет.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}