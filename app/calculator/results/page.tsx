import { redirect } from "next/navigation";
import ComparisonResultsClient from "@/components/ComparisonResultsClient";
import { getCurrentUser } from "@/lib/session";

export default async function CalculatorResultsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/calculator/results");
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <ComparisonResultsClient />
      </div>
    </main>
  );
}
