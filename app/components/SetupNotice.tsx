export default function SetupNotice() {
  return (
    <main className="mx-auto max-w-md px-6 py-20 text-center">
      <h1 className="text-lg font-semibold">Supabase še ni nastavljen</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Dodaj ključe v <code className="rounded bg-neutral-100 px-1">.env.local</code> in zaženi{" "}
        <code className="rounded bg-neutral-100 px-1">supabase/schema.sql</code>. Navodila so v{" "}
        <code className="rounded bg-neutral-100 px-1">SETUP.md</code>.
      </p>
    </main>
  );
}
