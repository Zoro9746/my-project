import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { adminService, AdminUser } from '../../services/adminService';
import { useToast } from '../../contexts/ToastContext';
import { Users, Search, Key, Shield, UserCheck, UserX, RefreshCw, CheckCircle2 } from 'lucide-react';

export const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Password reset modal state
  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [resetting, setResetting] = useState<boolean>(false);

  const { showSuccess, showError } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers({
        role: roleFilter,
        status: statusFilter,
        search: searchQuery,
      });
      setUsers(data);
    } catch (err: any) {
      showError('Failed to fetch user accounts directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleToggleStatus = async (user: AdminUser) => {
    try {
      const updatedStatus = !user.isActive;
      await adminService.updateUserStatus(user.id, updatedStatus);
      showSuccess(`User ${user.name} ${updatedStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchUsers();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;

    if (newPassword.length < 6) {
      showError('Password must be at least 6 characters long.');
      return;
    }

    setResetting(true);
    try {
      await adminService.resetUserPassword(resetTarget.id, newPassword);
      showSuccess(`Password for ${resetTarget.name} reset successfully!`);
      setResetTarget(null);
      setNewPassword('');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Password reset failed.');
    } finally {
      setResetting(false);
    }
  };

  const columns: Column<AdminUser>[] = [
    {
      header: 'User Name & Contact',
      cell: (item) => (
        <div>
          <p className="font-bold text-indigo-950">{item.name}</p>
          <p className="text-xs text-indigo-600/80">{item.email}</p>
        </div>
      ),
    },
    {
      header: 'Role',
      cell: (item) => {
        switch (item.role) {
          case 'STUDENT':
            return <Badge variant="info">Student ({item.student?.rollNo || 'N/A'})</Badge>;
          case 'DOCTOR':
            return <Badge variant="success">Doctor ({item.doctor?.specialization || 'General'})</Badge>;
          case 'PHARMACIST':
            return <Badge variant="warning">Pharmacist</Badge>;
          case 'ADMIN':
            return <Badge variant="danger">System Admin</Badge>;
          default:
            return <Badge variant="neutral">{item.role}</Badge>;
        }
      },
    },
    {
      header: 'Account Status',
      cell: (item) => (
        <Badge variant={item.isActive ? 'success' : 'danger'}>
          {item.isActive ? 'Active' : 'Deactivated'}
        </Badge>
      ),
    },
    {
      header: 'Joined Date',
      cell: (item) => (
        <span className="text-xs text-indigo-600/80 font-mono">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={item.isActive ? 'danger' : 'secondary'}
            onClick={() => handleToggleStatus(item)}
          >
            {item.isActive ? 'Deactivate' : 'Activate'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            icon={<Key className="w-3.5 h-3.5" />}
            onClick={() => {
              setResetTarget(item);
              setNewPassword('');
            }}
          >
            Reset Password
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Header
        title="User Account Management"
        subtitle="Manage user profiles, role assignments, account activation status, and admin password resets"
        action={
          <Button variant="outline" icon={<RefreshCw />} onClick={fetchUsers}>
            Refresh Users
          </Button>
        }
      />

      {/* Role Filter Tabs & Search Bar */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {[
              { label: 'All Roles', value: '' },
              { label: 'Students', value: 'STUDENT' },
              { label: 'Doctors', value: 'DOCTOR' },
              { label: 'Pharmacists', value: 'PHARMACIST' },
              { label: 'Admins', value: 'ADMIN' },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setRoleFilter(tab.value)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  roleFilter === tab.value
                    ? 'bg-purple-600 text-white shadow-sm border border-purple-600'
                    : 'text-indigo-700 hover:bg-purple-50 bg-white border border-indigo-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Search name, email or roll no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
              icon={<Search className="w-4 h-4" />}
            />
            <Button size="sm" onClick={fetchUsers}>
              Search
            </Button>
          </div>
        </div>
      </Card>

      <Card title="System User Accounts Directory">
        <Table
          columns={columns}
          data={users}
          keyExtractor={(item) => item.id}
          emptyMessage="No user accounts found matching query criteria."
          loading={loading}
        />
      </Card>

      {/* Admin Password Reset Modal */}
      {resetTarget && (
        <Modal
          isOpen={Boolean(resetTarget)}
          onClose={() => setResetTarget(null)}
          title={`Admin Password Reset — ${resetTarget.name}`}
          maxWidth="md"
        >
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            <p className="text-xs text-indigo-800">
              Target User: <strong className="text-indigo-950 font-bold">{resetTarget.email}</strong> ({resetTarget.role})
            </p>

            <Input
              label="Enter New Password *"
              type="password"
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-indigo-100">
              <Button variant="ghost" onClick={() => setResetTarget(null)}>
                Cancel
              </Button>
              <Button type="submit" loading={resetting} icon={<CheckCircle2 />}>
                Reset Password Now
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
