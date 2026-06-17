import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const { error } = await supabaseAdmin
    .from("animal_reports")
    .update({ archived: true })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  await supabaseAdmin.from("report_history").insert({
    report_id: id,
    action: "Заявка отправлена в архив",
    author: "Координатор",
  });

  return NextResponse.json({ success: true });
}