import ComparisonResultsClient from "@/components/ComparisonResultsClient";

type CalculatorResultsPageProps = {
  searchParams: Promise<{ run?: string }>;
};

export default async function CalculatorResultsPage({
  searchParams,
}: CalculatorResultsPageProps) {
  const params = await searchParams;

  return (
    <main className="min-h-[calc(100vh-5rem-env(safe-area-inset-bottom))] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <ComparisonResultsClient initialShareToken={params.run ?? null} />
      </div>
    </main>
  );
}
