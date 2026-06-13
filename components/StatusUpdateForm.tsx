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
  const [savedText, setSavedText] = useState("");

  async function handleStatusChange(newStatus: string) {
    setStatus(newStatus);
    setIsSaving(true);
    setSavedText("");

    const response = await fetch(`/api/admin/reports/${reportId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    });

    setIsSaving(false);

    if (!response.ok) {
      setSavedText("Ошибка сохранения");
      return;
    }

    setSavedText("Сохранено");
    router.refresh();

    setTimeout(() => {
      setSavedText("");
    }, 1500);
  }

  return (
    <div className="mt-4 flex items-center gap-2">
      <span className="text-sm text-zinc-500">Статус:</span>

      <select
        value={status}
        onChange={(event) => handleStatusChange(event.target.value)}
        disabled={isSaving}
        className="w-44 rounded-xl border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100"
      >
        <option value="new">Новая</option>
        <option value="in_progress">В работе</option>
        <option value="duplicate">Дубль</option>
        <option value="closed">Закрыта</option>
      </select>

      {isSaving && <span className="text-sm text-zinc-500">Сохраняем...</span>}

      {savedText && (
        <span className="text-sm text-emerald-700">{savedText}</span>
      )}
    </div>
  );
}