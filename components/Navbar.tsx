 "use client"


 import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Navbar() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  return (
      <nav className="w-full bg-gray-900 text-white px-4 py-3 flex items-center justify-between gap-4">
  {/* Links  */}
  <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide min-w-0">
    <span className="text-xl font-bold text-purple-400 shrink-0">LOOP</span>
    <Link href="/dashboard" className="text-sm text-gray-300 hover:text-white shrink-0">
      Dashboard
    </Link>
    <Link href="/inbox" className="text-sm text-gray-300 hover:text-white shrink-0">
      Inbox
    </Link>
    <Link href="/themes" className="text-sm text-gray-300 hover:text-white shrink-0">
      Themes
    </Link>
    <Link href="/trends" className="text-sm text-gray-300 hover:text-white shrink-0">
      Trends
    </Link>
    <Link href="/ask" className="text-sm text-gray-300 hover:text-white shrink-0">
      Ask LOOP
    </Link>
    <Link href="/reports" className="text-sm text-gray-300 hover:text-white shrink-0">
      Reports
    </Link>
    {role === 'ADMIN' && (
      <Link href="/settings" className="text-sm text-gray-300 hover:text-white shrink-0">
        Team
      </Link>
    )}
  </div>

  {/* Profile Info & Logout */}
  <div className="flex items-center gap-3 shrink-0">
    {session?.user && (
      <div
        className="flex items-center gap-2 bg-gray-800/80 border border-gray-700 px-2.5 py-1.5 rounded-lg text-xs"
        title={`${session.user.name || ''} (${session.user.email || ''})`}
      >
        <div className="w-6 h-6 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center text-gray-300 shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-3.5 h-3.5"
          >
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex items-center gap-2">
          {session.user.name && (
            <span className="font-medium text-gray-200 hidden sm:inline max-w-[120px] truncate">
              {session.user.name}
            </span>
          )}
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
              role === 'ADMIN'
                ? 'bg-purple-900/70 text-purple-300 border border-purple-500/40'
                : role === 'ANALYST'
                ? 'bg-blue-900/70 text-blue-300 border border-blue-500/40'
                : 'bg-emerald-900/70 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            {role || 'VIEWER'}
          </span>
        </div>
      </div>
    )}

    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-1.5 rounded transition shrink-0"
    >
      Logout
    </button>
  </div>
</nav>
  );
}
 