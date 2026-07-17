'use client';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Navbar() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  return (
    <nav className="w-full bg-gray-900 text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
        <span className="text-xl font-bold text-purple-400">LOOP</span>
        <Link href="/dashboard" className="text-sm text-gray-300 hover:text-white">
          Dashboard
        </Link>
        {role === 'ADMIN' && (
          <Link href="/settings" className="text-sm text-gray-300 hover:text-white">
            Team
          </Link>
        )}
        <a href="/inbox">Inbox</a>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-300">
          {session?.user?.name} · {(session?.user as any)?.role}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-1.5 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}