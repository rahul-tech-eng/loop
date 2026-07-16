 import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">LOOP</h1>
        <p className="mt-2 text-gray-500">AI Customer-Feedback Intelligence Platform</p>
        <div className="mt-6 flex gap-4 justify-center">
          <Link href="/login"
            className="bg-indigo-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
            Sign in
          </Link>
          <Link href="/signup"
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md text-sm font-medium hover:bg-gray-50">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}