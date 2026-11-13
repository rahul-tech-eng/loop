"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Inbox", href: "/inbox" },
    { name: "Themes", href: "/themes" },
    { name: "Trends", href: "/trends" },
    { name: "Ask LOOP", href: "/ask" },
    { name: "Reports", href: "/reports" },
    ...(role === "ADMIN" ? [{ name: "Team", href: "/settings" }] : []),
  ];

  return (
    <nav className="sticky top-0 z-40 w-full bg-gray-900 border-b border-gray-800 text-white shadow-md">
      {/* Top Bar */}
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        {/* Left Section: Brand & Desktop Links */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-bold text-purple-400 shrink-0">
            LOOP
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/dashboard" && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm px-3 py-1.5 rounded-md transition ${
                    isActive
                      ? "bg-gray-800 text-purple-300 font-medium"
                      : "text-gray-300 hover:text-white hover:bg-gray-800/60"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Section: Profile & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {session?.user && (
            <div
              className="flex items-center gap-2 bg-gray-800/80 border border-gray-700 px-2.5 py-1.5 rounded-lg text-xs"
              title={`${session.user.name || ""} (${session.user.email || ""})`}
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
                  <span className="font-medium text-gray-200 hidden sm:inline max-w-[100px] truncate">
                    {session.user.name}
                  </span>
                )}
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                    role === "ADMIN"
                      ? "bg-purple-900/70 text-purple-300 border border-purple-500/40"
                      : role === "ANALYST"
                      ? "bg-blue-900/70 text-blue-300 border border-blue-500/40"
                      : "bg-emerald-900/70 text-emerald-300 border border-emerald-500/40"
                  }`}
                >
                  {role || "VIEWER"}
                </span>
              </div>
            </div>
          )}

          {/* Desktop Logout Button */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="hidden sm:inline-flex bg-purple-600 hover:bg-purple-700 text-white text-sm px-3.5 py-1.5 rounded transition shrink-0"
          >
            Logout
          </button>

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="md:hidden p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-900 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/dashboard" && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          <div className="pt-3 mt-2 border-t border-gray-800 sm:hidden">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full text-center bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
 