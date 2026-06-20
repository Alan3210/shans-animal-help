import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function formatStatusLabel(status: string | null) {
  switch (status) {
    case "new":
      return "Новая";
    case "in_progress":
      return "В работе";
    case "duplicate":
      return "Дубль";
    case "closed":
      return "Закрыта";
    default:
      return status || "—";
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const id = searchParams.get("id");
  const action = searchParams.get("action");
  const secret = searchParams.get("secret");

  if (secret !== process.env.TELEGRAM_ACTION_SECRET) {
    return NextResponse.json({ error: "Недоступно" }, { status: 403 });
  }

  if (!id || !action) {
    return NextResponse.json(
      { error: "Не хватает параметров" },
      { status: 400 }
    );
  }

  const statusByAction: Record<string, string> = {
    in_progress: "in_progress",
    closed: "closed",
  };

  const newStatus = statusByAction[action];

  if (!newStatus) {
    return NextResponse.json(
      { error: "Неизвестное действие" },
      { status: 400 }
    );
  }

  const { data: currentReport, error: currentError } = await supabaseAdmin
    .from("animal_reports")
    .select("status")
    .eq("id", id)
    .single();

  if (currentError || !currentReport) {
    return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
  }

  const { error } = await supabaseAdmin
    .from("animal_reports")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabaseAdmin.from("report_history").insert({
    report_id: id,
    action: `Статус изменён из Telegram: ${formatStatusLabel(
      currentReport.status
    )} → ${formatStatusLabel(newStatus)}`,
    author: "Telegram",
  });

  const adminBaseUrl =
    process.env.ADMIN_BASE_URL || "https://shans-animal-help.vercel.app";

  return NextResponse.redirect(`${adminBaseUrl}/admin/reports/${id}`);
}