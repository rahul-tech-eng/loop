 import AskLoop from "@/components/ask/AskLoop";

export default function AskPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Ask LOOP</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ask plain-English questions about your customer feedback
        </p>
      </div>
      <AskLoop />
    </div>
  );
}