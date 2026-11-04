import React, { useState, useEffect } from 'react';
import { Users, Shield, User, FileSearch, Activity, CheckCircle2, XCircle } from 'lucide-react';
import { UserAccount, UserRole } from '../../types';
import { getUsers, saveUserAccount } from '../../firebase/services';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const list = await getUsers();
    setUsers(list);
  };

  const toggleStatus = async (user: UserAccount) => {
    const newStatus = user.account_status === 'active' ? 'inactive' : 'active';
    const updated: UserAccount = {
      ...user,
      account_status: newStatus,
      updated_at: new Date().toISOString(),
    };
    await saveUserAccount(updated);
    await loadUsers();
  };

  const filtered = users.filter((u) => {
    if (roleFilter === 'all') return true;
    return u.role === roleFilter;
  });

  const roleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">Administrator</span>;
      case 'researcher':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">Researcher</span>;
      case 'evaluator':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">Peer Evaluator</span>;
      case 'project_officer':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-teal-50 text-teal-700 border border-teal-200">Project Officer</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#153B65]">User Accounts & Role Permissions</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage authenticated proponents, external reviewers, administrators, and monitoring officers.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs">
          {['all', 'researcher', 'admin', 'evaluator', 'project_officer'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg capitalize text-[11px] font-semibold transition-all ${
                roleFilter === r
                  ? 'bg-white text-[#153B65] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-3.5">Full Name & Email</th>
              <th className="p-3.5">System Role</th>
              <th className="p-3.5">Institution / Department</th>
              <th className="p-3.5">Account Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="p-3.5">
                  <p className="font-semibold text-gray-900">{u.full_name}</p>
                  <p className="font-mono text-gray-500 text-[11px]">{u.email}</p>
                </td>
                <td className="p-3.5 whitespace-nowrap">
                  {roleBadge(u.role)}
                </td>
                <td className="p-3.5 max-w-xs text-gray-600">
                  <p className="font-medium truncate">{u.institution || 'DOST Central Office'}</p>
                  <p className="text-[10px] text-gray-400 truncate">{u.department}</p>
                </td>
                <td className="p-3.5 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    u.account_status === 'active'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${u.account_status === 'active' ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                    {u.account_status}
                  </span>
                </td>
                <td className="p-3.5 text-right whitespace-nowrap">
                  <button
                    onClick={() => toggleStatus(u)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors border ${
                      u.account_status === 'active'
                        ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                        : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    {u.account_status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
