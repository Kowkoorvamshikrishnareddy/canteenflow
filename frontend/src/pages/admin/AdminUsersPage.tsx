import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { UserProfile, UserRole } from '../../types';
import {
  Users,
  ShieldCheck,
  GraduationCap,
  ChefHat,
  Search,
  Check,
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getUsers();
      setUsers(res.users);
    } catch (e) {
      console.error('Failed to load users:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      setUpdatingId(userId);
      const res = await api.updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? res.user : u)));
    } catch (err: any) {
      alert(err.message || 'Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-ink-primary tracking-tight">
          Campus Members & Role Access Control
        </h1>
        <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
          Assign role-based access permissions for students, kitchen staff, and administrators
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-glass-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-ink-secondary font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Campus Member</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Current Role</th>
                <th className="px-6 py-3.5 text-right">Assign Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop'}
                          alt={user.fullName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <span className="font-bold text-ink-primary block">{user.fullName}</span>
                          <span className="text-[10px] text-ink-secondary">{user.phone || '+91 98765 00000'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-3.5 font-medium text-ink-secondary">
                      {user.email}
                    </td>

                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                          user.role === 'admin'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : user.role === 'staff'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {user.role === 'admin' ? (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        ) : user.role === 'staff' ? (
                          <ChefHat className="w-3.5 h-3.5" />
                        ) : (
                          <GraduationCap className="w-3.5 h-3.5" />
                        )}
                        {user.role}
                      </span>
                    </td>

                    <td className="px-6 py-3.5 text-right">
                      <select
                        value={user.role}
                        disabled={updatingId === user.id}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-ink-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                      >
                        <option value="student">Student</option>
                        <option value="staff">Canteen Staff</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
