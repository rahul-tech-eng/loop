"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-yellow-500">500</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mt-4">
          Something went wrong
        </h2>
        <p className="text-gray-500 mt-2">{error.message}</p>
        <button
          onClick={reset}
          className="mt-6 inline-block px-6 py-3 bg-indigo-600
            text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}