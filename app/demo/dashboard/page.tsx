import DashboardDemo from "@/app/dashboard/DashboardDemo";

// Vedno dosegljiv lastnikov dashboard z demo podatki (BREZ prijave) — za prodajni walkthrough.
export const dynamic = "force-static";

export default function DemoDashboardPage() {
  return <DashboardDemo />;
}
