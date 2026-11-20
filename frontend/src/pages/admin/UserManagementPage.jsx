import React, { useState, useEffect } from 'react';
import { Users, Shield, User, Search, CheckCircle2, ShieldAlert } from 'lucide-react';
import api from '../../api/client';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

export const UserManagementPage = () => {
  const { isSuperAdmin, user: currentUser } = useAuth();
  const { setToast } = useNotification();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/users?search=${search}`);
      if (response.success && response.data) {
        setUsers(response.data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleRoleChange = async (userId, newRole) => {
    if (!isSuperAdmin) {
      setToast({
        title: 'Permission Denied',
        message: 'Only the Super Administrator has permission to elevate or change user roles.',
        type: 'REJECTION'
      });
      return;
    }

    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      if (res.success) {
        setToast({ title: 'Role Updated', message: res.message, type: 'APPROVAL' });
        setUsers(prev =>
          prev.map(u => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      setToast({ title: 'Error', message: err.message, type: 'REJECTION' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
            Access & Security
          </span>
          <h1 className="font-serif text-2xl font-bold text-navy-900 dark:text-white mt-1">
            Student & Moderator User Management
          </h1>
          <p className="text-xs text-navy-500 mt-1">
            {isSuperAdmin
              ? 'Superadmin Access: You hold full authority to assign Moderator and Admin privileges.'
              : 'Admin View: Role elevation is exclusively restricted to the Super Administrator.'}
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-navy-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student or email..."
            className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-200 dark:border-navy-800 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left divide-y divide-navy-100 dark:divide-navy-800">
              <thead className="bg-navy-50 dark:bg-navy-800/50 text-navy-500 font-semibold">
                <tr>
                  <th className="px-5 py-3">Scholar Details</th>
                  <th className="px-5 py-3">Affiliated College</th>
                  <th className="px-5 py-3">Course / Sem</th>
                  <th className="px-5 py-3">Current Role</th>
                  <th className="px-5 py-3 text-right">Role Assignment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100 dark:divide-navy-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-navy-50/50 dark:hover:bg-navy-800/30 transition">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-navy-900 dark:text-white">{u.fullName}</p>
                      <p className="text-[11px] text-navy-500">{u.email}</p>
                    </td>

                    <td className="px-5 py-3.5 text-navy-600 dark:text-navy-400 max-w-xs truncate">
                      {u.collegeName || 'Not specified'}
                    </td>

                    <td className="px-5 py-3.5 text-navy-600 dark:text-navy-400">
                      {u.course?.code || 'N/A'} {u.semester?.title ? `(${u.semester.title})` : ''}
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                          u.role === 'SUPERADMIN'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300'
                            : u.role === 'ADMIN'
                            ? 'bg-gold-100 text-gold-800 dark:bg-gold-950/80 dark:text-gold-300'
                            : 'bg-navy-100 text-navy-700 dark:bg-navy-800 dark:text-navy-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      {isSuperAdmin && u.id !== currentUser.id ? (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="px-2.5 py-1 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-lg text-xs font-medium text-navy-900 dark:text-white focus:outline-none"
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="SUPERADMIN">SUPERADMIN</option>
                        </select>
                      ) : (
                        <span className="text-[11px] text-navy-400 italic">
                          {u.id === currentUser.id ? 'Self' : 'Protected'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
