import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { formatPriority, formatStatus } from "@/lib/formatters";
import StatusUpdateForm from "@/components/StatusUpdateForm";
import ReportsMap from "@/components/ReportsMap";
import ResponsibleUpdateForm from "@/components/ResponsibleUpdateForm";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
searchParams: Promise<{
  status?: string;
  priority?: string;
  responsible?: string;
  q?: string;
}>;
}) {
  const filters = await searchParams;

const { data: reports, error } = await supabaseAdmin
  .from("animal_reports")
  .select("*")
  .eq("archived", false)
  .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-stone-50 px-3 py-8 text-zinc-900 xl:px-6">
        <section className="mx-auto max-w-[1800px]">
          <p className="text-red-700">
            Ошибка загрузки заявок: {error.message}
          </p>
        </section>
      </main>
    );
  }

  const filteredReports = reports?.filter((report) => {
    if (filters.status && report.status !== filters.status) return false;
    if (filters.priority && report.priority !== filters.priority) return false;
    if (filters.responsible === "none" && report.responsible) return false;

if (
  filters.responsible &&
  filters.responsible !== "none" &&
  report.responsible !== filters.responsible
) {
  return false;
}

    if (filters.q) {
      const search = filters.q.toLowerCase();

      const searchableText = [
        report.id,
        report.location_address,
        report.situation_comment,
        report.reporter_phone,
        report.animal_type,
        report.animal_condition,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!searchableText.includes(search)) return false;
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

    if (priorityDiff !== 0) return priorityDiff;

    return (
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  });

  const totalCount = reports?.length || 0;
  const newCount =
    reports?.filter((report) => report.status === "new").length || 0;
  const inProgressCount =
    reports?.filter((report) => report.status === "in_progress").length || 0;
  const duplicateCount =
    reports?.filter((report) => report.status === "duplicate").length || 0;
  const closedCount =
    reports?.filter((report) => report.status === "closed").length || 0;

  const urgentCount =
    reports?.filter((report) => report.priority === "red").length || 0;
  const yellowCount =
    reports?.filter((report) => report.priority === "yellow").length || 0;
  const greenCount =
    reports?.filter((report) => report.priority === "green").length || 0;
  const noResponsibleCount =
    reports?.filter((report) => !report.responsible).length || 0;

  const kristinaCount =
    reports?.filter((report) => report.responsible === "Кристина").length || 0;

  const alanCount =
    reports?.filter((report) => report.responsible === "Алан").length || 0;

    const tatyanaCount =
  reports?.filter((report) => report.responsible === "Татьяна").length || 0;

const oksanaCount =
  reports?.filter((report) => report.responsible === "Оксана").length || 0;


  function getTelegramLink(contact?: string | null) {
    if (!contact) return null;

    const trimmed = contact.trim();

    if (trimmed.startsWith("@")) {
      return `https://t.me/${trimmed.slice(1)}`;
    }

    if (trimmed.startsWith("https://t.me/")) {
      return trimmed;
    }

    if (trimmed.startsWith("t.me/")) {
      return `https://${trimmed}`;
    }

    return null;
  }

  function getPriorityBorder(priority: string) {
    switch (priority) {
      case "red":
        return "border-l-8 border-red-500";
      case "yellow":
        return "border-l-8 border-amber-400";
      case "green":
        return "border-l-8 border-emerald-500";
      default:
        return "";
    }
  }

  function getAgeText(createdAt: string) {
    const created = new Date(createdAt);
    const now = new Date();

    const diffMs = now.getTime() - created.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return "меньше часа назад";
    if (diffHours < 24) return `${diffHours} ч назад`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} дн назад`;
  }

  return (
    <main className="min-h-screen bg-stone-50 px-3 py-8 text-zinc-900 xl:px-6">
      <section className="mx-auto max-w-[1800px]">
<div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
  <div>
    <h1 className="mb-2 text-3xl font-bold">Админка заявок</h1>

    <p className="text-zinc-600">
      Здесь отображаются заявки, отправленные жителями.
    </p>
  </div>

<div className="flex gap-3">
  <Link
    href="/admin/table"
    className="inline-block rounded-2xl border border-emerald-700 px-4 py-3 font-semibold text-emerald-800"
  >
    📋 Табличный режим
  </Link>

  <Link
    href="/admin/archive"
    className="inline-block rounded-2xl border border-zinc-400 px-4 py-3 font-semibold text-zinc-700"
  >
    📦 Архив
  </Link>
</div>
</div>

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
  <span className="text-sm font-bold text-zinc-900">Статус:</span>

  <Link href="/admin" className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium">
    Все ({totalCount})
  </Link>

  <Link href="/admin?status=new" className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium">
    Новые ({newCount})
  </Link>

  <Link href="/admin?status=in_progress" className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium">
    В работе ({inProgressCount})
  </Link>

  <Link href="/admin?status=duplicate" className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium">
    Дубли ({duplicateCount})
  </Link>

  <Link href="/admin?status=closed" className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium">
    Закрытые ({closedCount})
  </Link>

  <span className="ml-3 text-sm font-bold text-zinc-900">Приоритет:</span>

  <Link href="/admin?priority=red" className="rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-800">
    Срочно ({urgentCount})
  </Link>

  <Link href="/admin?priority=yellow" className="rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900">
    Проверить ({yellowCount})
  </Link>

  <Link href="/admin?priority=green" className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800">
    Наблюдение ({greenCount})
  </Link>
</div>

<div className="mt-2 flex flex-wrap items-center gap-2">
  <span className="text-base font-bold text-zinc-700">Быстрые:</span>

  <Link
    href="/admin?responsible=none"
    className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800"
  >
    Без ответственного ({noResponsibleCount})
  </Link>

  <Link
    href="/admin?responsible=Кристина"
    className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800"
  >
    Кристина ({kristinaCount})
  </Link>

<Link
  href="/admin?responsible=Татьяна"
  className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800"
>
  Татьяна ({tatyanaCount})
</Link>

<Link
  href="/admin?responsible=Оксана"
  className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800"
>
  Оксана ({oksanaCount})
</Link>

  <Link
    href="/admin?responsible=Алан"
    className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800"
  >
    Алан ({alanCount})
  </Link>
</div>
          <form className="w-full md:w-80">
            <input
              type="text"
              name="q"
              defaultValue={filters.q || ""}
              placeholder="Поиск..."
              className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 shadow-sm"
            />
          </form>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="grid gap-4">
            {sortedReports?.length === 0 && (
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                Заявок пока нет.
              </div>
            )}

            {sortedReports?.map((report) => (
              <div
                key={report.id}
                className={`rounded-3xl bg-white p-5 shadow-sm md:grid md:grid-cols-[180px_1fr] md:gap-6 ${getPriorityBorder(
                  report.priority
                )}`}
              >
                {report.photos?.[0] ? (
                  <img
                    src={report.photos[0]}
                    alt="Фото животного"
                    className="mb-4 h-44 w-full rounded-2xl object-cover md:mb-0"
                  />
                ) : (
                  <div className="mb-4 flex h-44 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 md:mb-0">
                    Нет фото
                  </div>
                )}

                <div className="grid gap-5 md:grid-cols-[1.35fr_0.9fr]">
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

                    <h2 className="text-xl font-semibold">
                      {report.animal_type} · {report.animal_condition}
                    </h2>

                    <div className="mt-3 text-sm text-zinc-500">
                      <div>
                        Создано:{" "}
                        {new Date(report.created_at).toLocaleString("ru-RU")}
                      </div>

                      <div className="font-medium text-amber-700">
                        ⏱️ {getAgeText(report.created_at)}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <Link
                        href={`/admin/reports/${report.id}`}
                        className="inline-block rounded-xl border border-emerald-700 px-3 py-2 text-sm font-medium text-emerald-800"
                      >
                        Открыть заявку
                      </Link>

                      <StatusUpdateForm
                        reportId={report.id}
                        currentStatus={report.status}
                      />

                      <ResponsibleUpdateForm
                        reportId={report.id}
                        currentResponsible={report.responsible}
                      />
                    </div>
                  </div>




                  <div className="rounded-2xl bg-stone-50 p-4">
                    <p className="mb-2 text-zinc-700">
                      <strong>Место:</strong> {report.location_address || "—"}
                    </p>

                    <p className="mb-2 text-zinc-700">
                      <strong>Комментарий:</strong>{" "}
                      {report.situation_comment || "—"}
                    </p>

                    <div className="mb-4">
                      <strong>Контакт:</strong>{" "}
                      {report.reporter_phone ? report.reporter_phone : "—"}

                      {report.reporter_phone && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {report.location_lat && report.location_lng && (
                            <a
                              href={`https://www.google.com/maps?q=${report.location_lat},${report.location_lng}`}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-xl bg-stone-800 px-3 py-2 text-sm font-medium text-white"
                            >
                              📍 Карта
                            </a>
                          )}

                          <a
                            href={`tel:${report.reporter_phone}`}
                            className="rounded-xl bg-emerald-700 px-3 py-2 text-sm font-medium text-white"
                          >
                            📞 Позвонить
                          </a>

                          {getTelegramLink(report.reporter_phone) && (
                            <a
                              href={
                                getTelegramLink(report.reporter_phone) || "#"
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-xl bg-sky-600 px-2 py-2 text-sm font-medium text-white"
                            >
                              💬 TG
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="hidden xl:block">
            <div className="sticky top-6 rounded-3xl bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-xl font-bold">Карта заявок</h2>
              <ReportsMap reports={reports || []} />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}