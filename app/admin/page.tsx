import { auth } from "@/lib/auth";

export default async function AdminDashboard() {
  const session = await auth();
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-neutral-600">Welcome back, {session?.user?.name ?? session?.user?.email}.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card title="Orders" hint="Phase 6" />
        <Card title="Products" hint="Phase 5" />
        <Card title="Newsletter" hint="Phase 9" />
      </div>
    </div>
  );
}

function Card({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm border border-neutral-200">
      <p className="text-sm text-neutral-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold">—</p>
      <p className="mt-1 text-xs text-neutral-400">{hint}</p>
    </div>
  );
}
