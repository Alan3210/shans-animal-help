"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CommentForm({
  reportId,
  defaultAuthor,
}: {
  reportId: string;
  defaultAuthor?: string | null;
}) {
  const router = useRouter();

  const [comment, setComment] = useState("");
  const [author, setAuthor] = useState(defaultAuthor || "Координатор");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!comment.trim()) {
      setErrorMessage("Введите комментарий.");
      return;
    }

    setIsSaving(true);

    const response = await fetch(`/api/admin/reports/${reportId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ author, comment }),
    });

    setIsSaving(false);

    if (!response.ok) {
      setErrorMessage("Не удалось сохранить комментарий.");
      return;
    }

    setComment("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      {errorMessage && (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <div className="flex gap-2">
        <select
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
          className="w-40 rounded-xl border border-zinc-300 px-3 py-2 text-sm"
        >
          <option>Координатор</option>
          <option>Кристина</option>
          <option>Татьяна</option>
          <option>Оксана</option>
          <option>Алексей</option>
          <option>Алан</option>
        </select>

        <input
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Комментарий координатора..."
          className="flex-1 rounded-xl border border-zinc-300 px-3 py-2 text-sm"
        />

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:bg-zinc-400"
        >
          {isSaving ? "..." : "Добавить"}
        </button>
      </div>
    </form>
  );
}