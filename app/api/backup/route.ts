import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

async function fetchAllRows(tableName: string) {
  const pageSize = 1000;
  let from = 0;
  let allRows: unknown[] = [];

  while (true) {
    const to = from + pageSize - 1;

    const { data, error } = await supabaseAdmin
      .from(tableName)
      .select("*")
      .order("created_at", { ascending: true })
      .range(from, to);

    if (error) {
      throw new Error(`${tableName}: ${error.message}`);
    }

    const rows = data || [];
    allRows = [...allRows, ...rows];

    if (rows.length < pageSize) break;

    from += pageSize;
  }

  return allRows;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.BACKUP_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      { error: "BACKUP_SECRET is not configured" },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [animalReports, reportComments, reportHistory] = await Promise.all([
      fetchAllRows("animal_reports"),
      fetchAllRows("report_comments"),
      fetchAllRows("report_history"),
    ]);

    return NextResponse.json({
      backup_created_at: new Date().toISOString(),
      counts: {
        animal_reports: animalReports.length,
        report_comments: reportComments.length,
        report_history: reportHistory.length,
      },
      tables: {
        animal_reports: animalReports,
        report_comments: reportComments,
        report_history: reportHistory,
      },
    });
  } catch (error) {
    console.error("Backup error:", error);

    return NextResponse.json({ error: "Backup failed" }, { status: 500 });
  }
}