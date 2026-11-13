import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-gray-900 border-t border-gray-800 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-gray-800">
          <p className="text-xs text-gray-400 max-w-sm">
            AI Customer Feedback Intelligence Platform. Transform unstructured customer feedback into actionable insights.
          </p>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
              Dashboard
            </Link>
            <Link href="/inbox" className="text-gray-400 hover:text-white transition">
              Inbox
            </Link>
            <Link href="/themes" className="text-gray-400 hover:text-white transition">
              Themes
            </Link>
            <Link href="/trends" className="text-gray-400 hover:text-white transition">
              Trends
            </Link>
            <Link href="/ask" className="text-gray-400 hover:text-white transition">
              Ask LOOP
            </Link>
            <Link href="/reports" className="text-gray-400 hover:text-white transition">
              Reports
            </Link>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} LOOP Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-gray-400 cursor-pointer transition">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-gray-400 cursor-pointer transition">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-gray-400 cursor-pointer transition">Documentation</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
