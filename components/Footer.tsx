export default function Footer() {
  return (
    <footer className="w-full bg-gray-900 border-t border-gray-800 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} LOOP Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-white cursor-pointer transition">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition">Documentation</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
