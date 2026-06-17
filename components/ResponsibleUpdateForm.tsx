"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const RESPONSIBLE_OPTIONS = [
  "",
  "Кристина",
  "Татьяна",
  "Оксана",
  "Алексей",
  "Алан",
];

export default function ResponsibleUpdateForm({
  reportId,
  currentResponsible,
}: {
  reportId: string;
  currentResponsible: string | null;
}) {
  const router = useRouter();

  const [responsible, setResponsible] = useState(currentResponsible || "");
  const [isSaving, setIsSaving] = useState(false);
  const [savedText, setSavedText] = useState("");

  async function handleResponsibleChange(newResponsible: string) {
    setResponsible(newResponsible);
    setIsSaving(true);
    setSavedText("");

    const response = await fetch(`/api/admin/reports/${reportId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ responsible: newResponsible }),
    });

    setIsSaving(false);

    if (!response.ok) {
      setSavedText("Ошибка");
      return;
    }

    setSavedText("Сохранено");
    router.refresh();

    setTimeout(() => {
      setSavedText("");
    }, 1500);
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={responsible}
        onChange={(event) => handleResponsibleChange(event.target.value)}
        disabled={isSaving}
        className="w-36 rounded-xl border border-zinc-300 px-3 py-2 text-sm"
      >
        <option value="">Ответственный</option>

        {RESPONSIBLE_OPTIONS.filter(Boolean).map((person) => (
          <option key={person} value={person}>
            {person}
          </option>
        ))}
      </select>

      {isSaving && <span className="text-sm text-zinc-500">...</span>}

      {savedText && (
        <span className="text-sm text-emerald-700">{savedText}</span>
      )}
    </div>
  );
}