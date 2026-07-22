 "use client"


 import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Navbar() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  return (
      <nav className="w-full bg-gray-900 text-white px-4 py-3 flex items-center justify-between gap-4">
  {/* Links — scrollable on mobile */}
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

  {/* Logout — always visible */}
  <button
    onClick={() => signOut({ callbackUrl: '/login' })}
    className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-1.5 rounded shrink-0"
  >
    Logout
  </button>
</nav>
  );
}
 