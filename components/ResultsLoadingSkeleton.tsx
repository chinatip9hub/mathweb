export default function ResultsLoadingSkeleton() {
  return (
    <div className="results-skeleton space-y-6 pb-24" aria-busy="true" aria-label="กำลังโหลดผลการคำนวณ">
      <div className="theme-card p-5 sm:p-6">
        <div className="results-skeleton__line results-skeleton__line--short" />
        <div className="results-skeleton__line results-skeleton__line--title mt-4" />
        <div className="results-skeleton__line results-skeleton__line--medium mt-3" />
        <div className="mt-5 flex flex-wrap gap-2">
          <div className="results-skeleton__pill" />
          <div className="results-skeleton__pill" />
          <div className="results-skeleton__pill" />
        </div>
      </div>

      <div className="theme-card p-5 sm:p-6">
        <div className="results-skeleton__line results-skeleton__line--medium" />
        <div className="results-skeleton__block mt-5 h-56" />
        <div className="results-skeleton__block mt-4 h-16" />
      </div>

      <div className="theme-card p-5 sm:p-6">
        <div className="results-skeleton__block h-72" />
      </div>
    </div>
  );
}
