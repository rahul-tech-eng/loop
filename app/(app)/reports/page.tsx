 import ReportsList from "@/components/reports/ReportsList";

export default function ReportsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">
          Voice-of-Customer reports generated from your feedback
        </p>
      </div>
      <ReportsList />
    </div>
  );
}