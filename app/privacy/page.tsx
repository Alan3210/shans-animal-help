import Link from "next/link";
import { privacyPolicyText } from "@/lib/privacyPolicy";

export const metadata = {
  title: "Политика обработки персональных данных",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-stone-50 px-5 py-8 text-zinc-900">
      <section className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-sm">
        <Link href="/" className="mb-6 inline-block text-emerald-700">
          ← На главную
        </Link>

        <article className="whitespace-pre-wrap text-sm leading-7 text-zinc-800">
          {privacyPolicyText}
        </article>
      </section>
    </main>
  );
}