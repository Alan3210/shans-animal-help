import ReportForm from "@/components/ReportForm";

export default function ReportPage() {
  return (
    <main className="min-h-screen bg-stone-50 px-5 py-8 text-zinc-900">
      <section className="mx-auto max-w-md">
        <h1 className="mb-2 text-2xl font-bold">Сообщить о животном</h1>

        <p className="mb-6 text-sm text-zinc-600">
          Заполните короткую заявку. Волонтёры увидят фото, место и описание.
        </p>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <ReportForm />
        </div>
      </section>
    </main>
  );
}