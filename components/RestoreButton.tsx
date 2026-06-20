"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RestoreButton({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  async function handleRestore() {
    const confirmed = window.confirm("Вернуть заявку из архива?");

    if (!confirmed) return;

    setIsSaving(true);

    const response = await fetch(`/api/admin/reports/${reportId}/restore`, {
      method: "PATCH",
    });

    setIsSaving(false);

    if (!response.ok) {
      alert("Не удалось восстановить заявку.");
      return;
    }

    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleRestore}
      disabled={isSaving}
      className="rounded-xl border border-emerald-700 px-3 py-2 text-sm font-medium text-emerald-800 disabled:bg-zinc-100"
    >
      {isSaving ? "..." : "Вернуть"}
    </button>
  );
}