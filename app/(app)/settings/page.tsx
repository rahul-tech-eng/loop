'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const role = (session?.user as any)?.role;
  const currentUserId = (session?.user as any)?.id;

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'ANALYST', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  const [memberToDelete, setMemberToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchMembers = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      if (data.error) setError(data.error);
      else if (Array.isArray(data)) setMembers(data);
    } catch {
      setError('Failed to load team members');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && role === 'ADMIN') {
      fetchMembers(true);
    } else if (status === 'authenticated' && role !== 'ADMIN') {
      setLoading(false);
    }
  }, [status, role]);

  const handleInvite = async () => {
    if (role !== 'ADMIN') {
      setInviteError('Only administrators can add new members.');
      return;
    }

    setInviting(true);
    setInviteError('');
    setInviteSuccess('');

    try {
      const res = await fetch('/api/members/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setInviting(false);

      if (!res.ok) {
        setInviteError(data.error || 'Something went wrong.');
      } else {
        setInviteSuccess(`${data.name} added successfully!`);
        setForm({ name: '', email: '', role: 'ANALYST', password: '' });
        setShowPassword(false);
        fetchMembers(false); // refresh the list
        setTimeout(() => {
          setShowModal(false);
          setInviteSuccess('');
        }, 1500);
      }
    } catch {
      setInviting(false);
      setInviteError('Failed to invite member. Please try again.');
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToDelete) return;
    if (role !== 'ADMIN') {
      setActionMessage({ type: 'error', text: 'Only administrators can remove team members.' });
      return;
    }

    setDeleting(true);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/members?id=${memberToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      setDeleting(false);

      if (!res.ok) {
        setActionMessage({ type: 'error', text: data.error || 'Failed to remove member' });
      } else {
        setActionMessage({ type: 'success', text: `${memberToDelete.name} has been removed from the team.` });
        setMembers(prev => prev.filter(m => m.id !== memberToDelete.id));
        setMemberToDelete(null);
        setTimeout(() => setActionMessage(null), 3500);
      }
    } catch {
      setDeleting(false);
      setActionMessage({ type: 'error', text: 'An unexpected error occurred while removing member.' });
    }
  };

  if (status === 'loading' || (loading && role === 'ADMIN')) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-gray-500 text-sm">Loading team settings...</p>
      </div>
    );
  }

  // Access control check: Only ADMIN can view and manage team settings
  if (status === 'authenticated' && role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Admin Access Required</h2>
        <p className="text-sm text-gray-600 mb-6">
          Only workspace administrators have permission to add, view, or remove team members.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage users and roles in your workspace</p>
        </div>
        <button
          onClick={() => {
            setShowModal(true);
            setInviteError('');
            setInviteSuccess('');
            setForm({ name: '', email: '', role: 'ANALYST', password: '' });
            setShowPassword(false);
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          + Invite Member
        </button>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm flex items-center justify-between ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs font-semibold ml-4 opacity-75 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Name</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Email</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Role</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                  No team members found.
                </td>
              </tr>
            ) : (
              members.map(m => {
                const isCurrentUser = m.id === currentUserId;
                return (
                  <tr key={m.id} className="border-t border-gray-200 hover:bg-gray-50/70 transition">
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {m.name}
                      {isCurrentUser && (
                        <span className="ml-2 text-[11px] font-normal text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
                          You
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{m.email}</td>
                    <td className="px-4 py-3">
                      <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded font-medium">
                        {m.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isCurrentUser ? (
                        <span className="text-xs text-gray-400 italic">Owner</span>
                      ) : (
                        <button
                          onClick={() => setMemberToDelete(m)}
                          className="text-red-600 hover:text-red-800 text-xs font-medium px-2.5 py-1 rounded hover:bg-red-50 border border-transparent hover:border-red-200 transition"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Invite Team Member</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="email@company.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="ANALYST">Analyst</option>
                  <option value="VIEWER">Viewer</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-xs text-gray-400 font-normal">(optional, default: password123)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Set member password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {inviteError && <p className="text-red-500 text-sm mt-3">{inviteError}</p>}
            {inviteSuccess && <p className="text-green-600 text-sm mt-3">{inviteSuccess}</p>}

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleInvite}
                disabled={inviting || !form.name || !form.email}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition"
              >
                {inviting ? 'Adding...' : 'Add Member'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Remove Team Member</h2>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to remove <span className="font-semibold text-gray-900">{memberToDelete.name}</span> ({memberToDelete.email}) from the team? They will no longer have access to this workspace.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleRemoveMember}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition"
              >
                {deleting ? 'Removing...' : 'Yes, Remove Member'}
              </button>
              <button
                onClick={() => setMemberToDelete(null)}
                disabled={deleting}
                className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}