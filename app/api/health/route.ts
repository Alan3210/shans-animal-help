import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();

  try {
    const { error: databaseError } = await supabaseAdmin
      .from("animal_reports")
      .select("id")
      .limit(1);

    const { error: storageError } = await supabaseAdmin.storage
      .from("report-photos")
      .list("", {
        limit: 1,
      });

    const databaseOk = !databaseError;
    const storageOk = !storageError;

    const ok = databaseOk && storageOk;

    return NextResponse.json(
      {
        ok,
        database: databaseOk ? "ok" : "error",
        storage: storageOk ? "ok" : "error",
        database_error: databaseError?.message || null,
        storage_error: storageError?.message || null,
        checked_at: new Date().toISOString(),
        response_time_ms: Date.now() - startedAt,
      },
      {
        status: ok ? 200 : 500,
      }
    );
  } catch (error) {
    console.error("Healthcheck error:", error);

    return NextResponse.json(
      {
        ok: false,
        database: "unknown",
        storage: "unknown",
        error: "Healthcheck failed",
        checked_at: new Date().toISOString(),
        response_time_ms: Date.now() - startedAt,
      },
      {
        status: 500,
      }
    );
  }
}