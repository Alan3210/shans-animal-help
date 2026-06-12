import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();

  const { status } = body;

  if (!status) {
    return NextResponse.json(
      { error: "Статус не указан" },
      { status: 400 }
    );
  }

  const allowedStatuses = ["new", "in_progress", "duplicate", "closed"];

  if (!allowedStatuses.includes(status)) {
    return NextResponse.json(
      { error: "Недопустимый статус" },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("animal_reports")
    .update({ status })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}