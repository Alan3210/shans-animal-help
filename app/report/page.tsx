import ReportForm from "@/components/ReportForm";

export default function ReportPage() {
  return (
    <main className="min-h-screen bg-stone-50 px-5 py-8 text-zinc-900">
      <section className="mx-auto max-w-md">
           <div className="rounded-3xl bg-white p-6 shadow-sm">
          <ReportForm />
        </div>
      </section>
    </main>
  );
}