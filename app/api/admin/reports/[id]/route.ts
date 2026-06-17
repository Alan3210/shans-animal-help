import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();

  const { status, responsible } = body;

  const updateData: {
    status?: string;
    responsible?: string | null;
  } = {};

  if (status !== undefined) {
    const allowedStatuses = ["new", "in_progress", "duplicate", "closed"];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Недопустимый статус" },
        { status: 400 }
      );
    }

    updateData.status = status;
  }

  if (responsible !== undefined) {
    updateData.responsible = responsible || null;
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
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}