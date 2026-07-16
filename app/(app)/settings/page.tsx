'use client';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/members')
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setMembers(data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading members...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Team Members</h1>
      <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Name</th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Email</th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Role</th>
          </tr>
        </thead>
        <tbody>
          {members.map(m => (
            <tr key={m.id} className="border-t border-gray-200">
              <td className="px-4 py-3 text-gray-900">{m.name}</td>
              <td className="px-4 py-3 text-gray-600">{m.email}</td>
              <td className="px-4 py-3">
                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">
                  {m.role}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}