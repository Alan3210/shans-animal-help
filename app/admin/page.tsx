import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { formatPriority, formatStatus } from "@/lib/formatters";
import StatusUpdateForm from "@/components/StatusUpdateForm";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
searchParams: Promise<{
  status?: string;
  priority?: string;
  q?: string;
}>;
}) {
  const filters = await searchParams;
  const { data: reports, error } = await supabaseAdmin
    .from("animal_reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-stone-50 px-5 py-8 text-zinc-900">
        <section className="mx-auto max-w-5xl">
          <p className="text-red-700">
            Ошибка загрузки заявок: {error.message}
          </p>
        </section>
      </main>
    );
  }

const filteredReports = reports?.filter((report) => {
  if (filters.status && report.status !== filters.status) {
    return false;
  }

  if (filters.priority && report.priority !== filters.priority) {
    return false;
  }

  if (filters.q) {
    const search = filters.q.toLowerCase();

    const searchableText = [
      report.location_address,
      report.situation_comment,
      report.reporter_phone,
      report.animal_type,
      report.animal_condition,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (!searchableText.includes(search)) {
      return false;
    }
  }

  return true;
});

  const priorityOrder: Record<string, number> = {
    red: 1,
    yellow: 2,
    green: 3,
  };

  const sortedReports = filteredReports?.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return (
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  });

  const totalCount = reports?.length || 0;
const newCount = reports?.filter((report) => report.status === "new").length || 0;
const inProgressCount =
  reports?.filter((report) => report.status === "in_progress").length || 0;
const urgentCount = reports?.filter((report) => report.priority === "red").length || 0;
const closedCount =
  reports?.filter((report) => report.status === "closed").length || 0;

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-8 text-zinc-900">
      <section className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-3xl font-bold">Админка заявок</h1>

        <p className="mb-6 text-zinc-600">
          Здесь отображаются заявки, отправленные жителями.
        </p>
    
<div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
  <div className="rounded-2xl bg-white p-4 shadow-sm">
    <p className="text-sm text-zinc-500">Всего</p>
    <p className="text-2xl font-bold">{totalCount}</p>
  </div>

<form className="mb-6">
  <input
    type="text"
    name="q"
    defaultValue={filters.q || ""}
    placeholder="Поиск: адрес, комментарий, телефон, животное..."
    className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3"
  />
</form>

  <div className="rounded-2xl bg-white p-4 shadow-sm">
    <p className="text-sm text-zinc-500">Новые</p>
    <p className="text-2xl font-bold">{newCount}</p>
  </div>

  <div className="rounded-2xl bg-white p-4 shadow-sm">
    <p className="text-sm text-zinc-500">В работе</p>
    <p className="text-2xl font-bold">{inProgressCount}</p>
  </div>

  <div className="rounded-2xl bg-red-50 p-4 shadow-sm">
    <p className="text-sm text-red-700">Срочные</p>
    <p className="text-2xl font-bold text-red-800">{urgentCount}</p>
  </div>

  <div className="rounded-2xl bg-white p-4 shadow-sm">
    <p className="text-sm text-zinc-500">Закрытые</p>
    <p className="text-2xl font-bold">{closedCount}</p>
  </div>
</div>



      <div className="mb-6 flex flex-wrap gap-2">
  <Link
    href="/admin"
    className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium"
  >
    Все
  </Link>

  <Link
    href="/admin?status=new"
    className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium"
  >
    Новые
  </Link>

  <Link
    href="/admin?status=in_progress"
    className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium"
  >
    В работе
  </Link>

  <Link
    href="/admin?status=duplicate"
    className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium"
  >
    Дубли
  </Link>

  <Link
    href="/admin?status=closed"
    className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium"
  >
    Закрытые
  </Link>

  <Link
    href="/admin?priority=red"
    className="rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-800"
  >
    Срочно
  </Link>

  <Link
    href="/admin?priority=yellow"
    className="rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900"
  >
    Проверить
  </Link>

  <Link
    href="/admin?priority=green"
    className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800"
  >
    Наблюдение
  </Link>
</div>


        <div className="grid gap-4">
          {sortedReports?.length === 0 && (
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              Заявок пока нет.
            </div>
          )}

          {sortedReports?.map((report) => (
            <div
              key={report.id}
              className="rounded-3xl bg-white p-4 shadow-sm md:grid md:grid-cols-[160px_1fr] md:gap-5"
            >
              {report.photos?.[0] ? (
                <img
                  src={report.photos[0]}
                  alt="Фото животного"
                  className="mb-4 h-40 w-full rounded-2xl object-cover md:mb-0"
                />
              ) : (
                <div className="mb-4 flex h-40 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 md:mb-0">
                  Нет фото
                </div>
              )}

              <div>
                <div className="mb-3 flex flex-wrap gap-2">
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

                <h2 className="mb-2 text-xl font-semibold">
                  {report.animal_type} · {report.animal_condition}
                </h2>

                <p className="mb-2 text-zinc-700">
                  <strong>Место:</strong> {report.location_address || "—"}
                </p>

                {report.situation_comment && (
                  <p className="mb-2 text-zinc-700">
                    <strong>Комментарий:</strong> {report.situation_comment}
                  </p>
                )}

                {report.reporter_phone && (
                  <p className="mb-2 text-zinc-700">
                    <strong>Контакт:</strong> {report.reporter_phone}
                  </p>
                )}

                <p className="mt-3 text-sm text-zinc-500">
                  Создано:{" "}
                  {new Date(report.created_at).toLocaleString("ru-RU")}
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={`/admin/reports/${report.id}`}
                    className="rounded-2xl border border-emerald-700 px-4 py-3 font-semibold text-emerald-800"
                  >
                    Открыть заявку
                  </Link>
                </div>

                <StatusUpdateForm
                  reportId={report.id}
                  currentStatus={report.status}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}