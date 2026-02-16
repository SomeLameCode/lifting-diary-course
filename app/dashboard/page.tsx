import { DashboardClient } from "./_components/dashboard-client";

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Dashboard</h1>
      <DashboardClient />
    </main>
  );
}
