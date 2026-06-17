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

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();

  const { status, responsible } = body;

  const { data: currentReport, error: currentError } = await supabaseAdmin
    .from("animal_reports")
    .select("status, responsible")
    .eq("id", id)
    .single();

  if (currentError || !currentReport) {
    return NextResponse.json(
      { error: "Заявка не найдена" },
      { status: 404 }
    );
  }

  const updateData: {
    status?: string;
    responsible?: string | null;
  } = {};

  const historyActions: string[] = [];

  if (status !== undefined) {
    const allowedStatuses = ["new", "in_progress", "duplicate", "closed"];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Недопустимый статус" },
        { status: 400 }
      );
    }

    updateData.status = status;

    if (status !== currentReport.status) {
      historyActions.push(
        `Статус изменён: ${formatStatusLabel(
          currentReport.status
        )} → ${formatStatusLabel(status)}`
      );
    }
  }

  if (responsible !== undefined) {
    const newResponsible = responsible || null;

    updateData.responsible = newResponsible;

    if (newResponsible !== currentReport.responsible) {
      historyActions.push(
        `Ответственный изменён: ${
          currentReport.responsible || "не назначен"
        } → ${newResponsible || "не назначен"}`
      );
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: "Нет данных для обновления" },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("animal_reports")
    .update(updateData)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (historyActions.length > 0) {
    await supabaseAdmin.from("report_history").insert(
      historyActions.map((action) => ({
        report_id: id,
        action,
        author: "Координатор",
      }))
    );
  }

  return NextResponse.json({ success: true });
}