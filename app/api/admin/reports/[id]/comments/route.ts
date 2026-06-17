import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();

  const comment = String(body.comment || "").trim();
  const author = String(body.author || "Координатор").trim();

  if (!comment) {
    return NextResponse.json(
      { error: "Комментарий не может быть пустым" },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin.from("report_comments").insert({
    report_id: id,
    author,
    comment,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabaseAdmin.from("report_history").insert({
    report_id: id,
    action: "Добавлен комментарий",
    author,
  });

  return NextResponse.json({ success: true });
}