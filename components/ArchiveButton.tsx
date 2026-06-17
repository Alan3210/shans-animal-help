"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ArchiveButton({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  async function handleArchive() {
    const confirmed = window.confirm("Отправить заявку в архив?");

    if (!confirmed) return;

    setIsSaving(true);

    const response = await fetch(`/api/admin/reports/${reportId}/archive`, {
      method: "PATCH",
    });

    setIsSaving(false);

    if (!response.ok) {
      alert("Не удалось отправить заявку в архив.");
      return;
    }

    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleArchive}
      disabled={isSaving}
      className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 disabled:bg-zinc-100"
    >
      {isSaving ? "..." : "В архив"}
    </button>
  );
}