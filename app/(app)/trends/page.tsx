import   TrendsList  from  "@/components/trends/TrendsList";

export default function TrendsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Trends</h1>
        <p className="text-sm text-gray-500 mt-1">
          Theme volume over time — last 7 days vs previous 7 days
        </p>
      </div>
      <TrendsList />
    </div>
  );
}