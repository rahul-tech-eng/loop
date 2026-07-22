import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-500">403</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mt-4">
          Access denied
        </h2>
        <p className="text-gray-500 mt-2">
          You don't have permission to view this page.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block px-6 py-3 bg-indigo-600
            text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}