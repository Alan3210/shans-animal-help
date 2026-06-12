"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StatusUpdateForm({
  reportId,
  currentStatus,
}: {
  reportId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);

    await fetch(`/api/admin/reports/${reportId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    setIsSaving(false);
    router.refresh();
  }

  return (
    <div className="mt-4 flex gap-2">
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value)}
        className="flex-1 rounded-2xl border border-zinc-300 p-3"
      >
        <option value="new">Новая</option>
        <option value="in_progress">В работе</option>
        <option value="duplicate">Дубль</option>
        <option value="closed">Закрыта</option>
      </select>

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="rounded-2xl bg-emerald-700 px-4 py-3 font-semibold text-white disabled:bg-zinc-400"
      >
        {isSaving ? "..." : "Сохранить"}
      </button>
    </div>
  );
}