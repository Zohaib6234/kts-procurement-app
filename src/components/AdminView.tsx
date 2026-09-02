import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  KeyRound,
  SlidersHorizontal,
  ShieldCheck,
  Database,
  UserPlus,
  Edit2,
  Trash2,
  Lock,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Building,
  Check,
  X,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWarehouse } from '../context/WarehouseContext';
import { UserRole, SystemUser } from '../types';
import { StoredUser } from '../data/authInitialData';

type AdminTab = 'users' | 'permissions' | 'settings' | 'security' | 'database';

export const AdminView: React.FC = () => {
  const {
    currentUser,
    users,
    systemSettings,
    securityLogs,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    resetUserPassword,
    updateSystemSettings,
    clearSecurityLogs,
    switchUser
  } = useAuth();

  const { items, vendors, purchaseRequisitions, purchaseOrders, goodsReceiptNotes, movements, resetToDemoData } = useWarehouse();

  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // New User Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('warehouse_supervisor');
  const [newUserDepartment, setNewUserDepartment] = useState('');
  const [newUserWarehouse, setNewUserWarehouse] = useState('WH-01 Central Hub');
  const [newUserPassword, setNewUserPassword] = useState('pass123');
  const [newUserPhone, setNewUserPhone] = useState('');

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<StoredUser | null>(null);

  // Password Reset Modal State
  const [resettingUser, setResettingUser] = useState<StoredUser | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');

  // Settings local state
  const [companyName, setCompanyName] = useState(systemSettings.companyName);
  const [facilityCode, setFacilityCode] = useState(systemSettings.facilityCode);
  const [currencySymbol, setCurrencySymbol] = useState(systemSettings.currencySymbol);
  const [reorderThreshold, setReorderThreshold] = useState(systemSettings.reorderAlertThreshold);
  const [autoPR, setAutoPR] = useState(systemSettings.autoPRGeneration);
  const [strictQC, setStrictQC] = useState(systemSettings.strictQCMode);
  const [sessionTimeout, setSessionTimeout] = useState(systemSettings.sessionTimeoutMinutes);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  // Security Log Search
  const [logSearchQuery, setLogSearchQuery] = useState('');

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-800/80 text-rose-400 mx-auto flex items-center justify-center mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Administrator Access Restricted</h2>
          <p className="text-xs text-slate-400 mt-2 mb-6">
            Your current account <span className="text-slate-200 font-semibold">{currentUser?.name}</span> holds the role of{' '}
            <span className="text-indigo-400 font-semibold">{currentUser?.role.replace('_', ' ').toUpperCase()}</span>. System administration functions require Super Admin clearance.
          </p>
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                const adminUser = users.find(u => u.role === 'admin');
                if (adminUser) switchUser(adminUser.id);
              }}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              Switch to Administrator Persona (Arif Khan)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings({
      companyName,
      facilityCode,
      currencySymbol,
      reorderAlertThreshold: Number(reorderThreshold),
      autoPRGeneration: autoPR,
      strictQCMode: strictQC,
      sessionTimeoutMinutes: Number(sessionTimeout)
    });
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 3000);
  };

  // Handle Add User Submit
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addUser(
      {
        username: newUserUsername.trim().toLowerCase(),
        name: newUserName.trim(),
        email: newUserEmail.trim().toLowerCase(),
        role: newUserRole,
        department: newUserDepartment.trim(),
        assignedWarehouse: newUserWarehouse,
        status: 'active',
        phone: newUserPhone.trim()
      },
      newUserPassword
    );
    setIsAddUserModalOpen(false);
    // Reset form
    setNewUserName('');
    setNewUserUsername('');
    setNewUserEmail('');
    setNewUserDepartment('');
    setNewUserPassword('pass123');
    setNewUserPhone('');
  };

  // Handle Edit User Submit
  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    updateUser(editingUser.id, {
      name: editingUser.name,
      email: editingUser.email,
      role: editingUser.role,
      department: editingUser.department,
      assignedWarehouse: editingUser.assignedWarehouse,
      phone: editingUser.phone
    });
    setEditingUser(null);
  };

  // Handle Password Reset Submit
  const handlePasswordResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser || !newPasswordValue) return;
    resetUserPassword(resettingUser.id, newPasswordValue);
    setResettingUser(null);
    setNewPasswordValue('');
  };

  // Export full JSON database snapshot
  const handleExportDatabase = () => {
    const fullSnapshot = {
      systemVersion: '2.5.0',
      exportedAt: new Date().toISOString(),
      company: systemSettings.companyName,
      items,
      vendors,
      purchaseRequisitions,
      purchaseOrders,
      goodsReceiptNotes,
      movements,
      users: users.map(u => ({ ...u, passwordHash: '***PROTECTED***' })),
      systemSettings
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullSnapshot, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ProWarehouse_Full_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Filtered security logs
  const filteredLogs = securityLogs.filter(log => {
    return (
      log.userEmail.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.ipAddress.includes(logSearchQuery)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">System Administration & Access Control</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60 text-[10px] uppercase font-bold tracking-wider">
              Root Level
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise user management, role-based authorization matrix, system configuration, and security audit ledger.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New User</span>
          </button>
        </div>
      </div>

      {/* Quick Bento Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active System Users</div>
            <div className="text-xl font-bold text-white mt-1">
              {users.filter(u => u.status === 'active').length}{' '}
              <span className="text-xs font-normal text-slate-500">/ {users.length} total</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-950/80 text-indigo-400 border border-indigo-800/60">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Clearance Roles</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">5 Defined Tiers</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
            <KeyRound className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Security Events</div>
            <div className="text-xl font-bold text-indigo-300 mt-1">{securityLogs.length} Logged</div>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-950/80 text-indigo-400 border border-indigo-800/60">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Database Entities</div>
            <div className="text-xl font-bold text-white mt-1">
              {items.length + vendors.length + purchaseOrders.length + goodsReceiptNotes.length} Records
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-950/80 text-purple-400 border border-purple-800/60">
            <Database className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Admin Module Navigation Tabs */}
      <div className="flex border-b border-slate-800/80 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-slate-800 text-white border border-slate-700/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-400" />
          <span>User Directory ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'permissions'
              ? 'bg-slate-800 text-white border border-slate-700/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <KeyRound className="w-4 h-4 text-emerald-400" />
          <span>Role Permissions Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-slate-800 text-white border border-slate-700/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 text-amber-400" />
          <span>System & Warehouse Parameters</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-slate-800 text-white border border-slate-700/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Security & Login Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'database'
              ? 'bg-slate-800 text-white border border-slate-700/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Database className="w-4 h-4 text-purple-400" />
          <span>Data Backup & Recovery</span>
        </button>
      </div>

      {/* TAB 1: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2 flex-1 min-w-[280px]">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user by name, email, department, username..."
                  value={userSearchQuery}
                  onChange={e => setUserSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-800 text-xs bg-slate-800/70 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="py-1.5 px-3 rounded-xl border border-slate-800 text-xs bg-slate-800/70 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Super Admin</option>
                <option value="warehouse_supervisor">Warehouse Supervisor</option>
                <option value="procurement_manager">Procurement Manager</option>
                <option value="qc_officer">QC Receiving Officer</option>
                <option value="auditor">Internal Auditor</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="py-1.5 px-3 rounded-xl border border-slate-800 text-xs bg-slate-800/70 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
              </select>
            </div>

            <span className="text-xs text-slate-400 font-medium">
              Showing <span className="font-bold text-white">{filteredUsers.length}</span> User Accounts
            </span>
          </div>

          {/* Users Table */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">User Details</th>
                    <th className="py-3 px-4">Username</th>
                    <th className="py-3 px-4">System Role</th>
                    <th className="py-3 px-4">Department & Warehouse</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Last Activity</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No users found matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => {
                      const isSelf = currentUser?.id === user.id;

                      const roleBadgeColor =
                        user.role === 'admin'
                          ? 'bg-indigo-950 text-indigo-300 border-indigo-800/60'
                          : user.role === 'warehouse_supervisor'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
                          : user.role === 'procurement_manager'
                          ? 'bg-blue-950 text-blue-300 border-blue-800/60'
                          : user.role === 'qc_officer'
                          ? 'bg-amber-950 text-amber-300 border-amber-800/60'
                          : 'bg-purple-950 text-purple-300 border-purple-800/60';

                      return (
                        <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white uppercase">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-semibold text-white flex items-center space-x-1.5">
                                  <span>{user.name}</span>
                                  {isSelf && (
                                    <span className="text-[9px] bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 px-1.5 py-0.2 rounded">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-300">@{user.username}</td>
                          <td className="py-3 px-4">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${roleBadgeColor}`}>
                              {user.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            <div className="font-medium text-slate-200">{user.department}</div>
                            <div className="text-[10px] text-slate-500">{user.assignedWarehouse}</div>
                          </td>
                          <td className="py-3 px-4">
                            {user.status === 'active' ? (
                              <span className="inline-flex items-center space-x-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Active</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-rose-950 text-rose-300 border border-rose-800/60">
                                <XCircle className="w-3 h-3 text-rose-400" />
                                <span>Suspended</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                            {user.lastLogin || 'Never logged in'}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-1">
                              {/* Quick switch to this user */}
                              <button
                                onClick={() => switchUser(user.id)}
                                title="Quick test switch to this user"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                              </button>

                              {/* Edit User */}
                              <button
                                onClick={() => setEditingUser(user)}
                                title="Edit user profile"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Reset Password */}
                              <button
                                onClick={() => {
                                  setResettingUser(user);
                                  setNewPasswordValue('');
                                }}
                                title="Reset security password"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 cursor-pointer"
                              >
                                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                              </button>

                              {/* Toggle active / suspended */}
                              {!isSelf && (
                                <button
                                  onClick={() => toggleUserStatus(user.id)}
                                  title={user.status === 'active' ? 'Suspend account' : 'Activate account'}
                                  className={`p-1.5 rounded-lg border cursor-pointer ${
                                    user.status === 'active'
                                      ? 'bg-amber-950/60 hover:bg-amber-900/60 text-amber-400 border-amber-800/60'
                                      : 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border-emerald-800/60'
                                  }`}
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Delete User */}
                              {!isSelf && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to permanently delete user "${user.name}"?`)) {
                                      deleteUser(user.id);
                                    }
                                  }}
                                  title="Delete user"
                                  className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-400 border border-rose-800/60 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROLE PERMISSION MATRIX */}
      {activeTab === 'permissions' && (
        <div className="space-y-4">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-1">Access Control & Responsibility Matrix (RBAC)</h3>
            <p className="text-xs text-slate-400 mb-4">
              Overview of authorized capabilities across all ProWarehouse operational tiers.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Functional Capability</th>
                    <th className="py-3 px-4 text-center">Super Admin</th>
                    <th className="py-3 px-4 text-center">Warehouse Supervisor</th>
                    <th className="py-3 px-4 text-center">Procurement Manager</th>
                    <th className="py-3 px-4 text-center">QC Officer</th>
                    <th className="py-3 px-4 text-center">Auditor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {[
                    { capability: 'View Real-Time Inventory & Valuation', admin: true, wh: true, proc: true, qc: true, audit: true },
                    { capability: 'Issue Stock to Departments & Bins', admin: true, wh: true, proc: false, qc: false, audit: false },
                    { capability: 'Cycle Count & Stock Adjustment', admin: true, wh: true, proc: false, qc: false, audit: false },
                    { capability: 'Create Purchase Requisitions (PR)', admin: true, wh: true, proc: true, qc: false, audit: false },
                    { capability: 'Approve / Reject PRs', admin: true, wh: false, proc: true, qc: false, audit: false },
                    { capability: 'Issue Official Purchase Orders (PO)', admin: true, wh: false, proc: true, qc: false, audit: false },
                    { capability: 'Process Inward Receiving & QC (GRN)', admin: true, wh: true, proc: false, qc: true, audit: false },
                    { capability: 'Batch Rejection & Quality Remarks', admin: true, wh: false, proc: false, qc: true, audit: false },
                    { capability: 'Manage Approved Vendors & Spend', admin: true, wh: false, proc: true, qc: false, audit: false },
                    { capability: 'Export CSV & Audit Reports', admin: true, wh: true, proc: true, qc: true, audit: true },
                    { capability: 'User Management & Role Assignment', admin: true, wh: false, proc: false, qc: false, audit: false },
                    { capability: 'System Configuration & Parameters', admin: true, wh: false, proc: false, qc: false, audit: false },
                    { capability: 'Database Backup, Restore & Reset', admin: true, wh: false, proc: false, qc: false, audit: false }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-4 font-medium text-slate-200">{row.capability}</td>
                      <td className="py-2.5 px-4 text-center">
                        {row.admin ? (
                          <span className="inline-flex p-1 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/60">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex p-1 rounded bg-slate-800 text-slate-600">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {row.wh ? (
                          <span className="inline-flex p-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex p-1 rounded bg-slate-800 text-slate-600">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {row.proc ? (
                          <span className="inline-flex p-1 rounded bg-blue-950 text-blue-400 border border-blue-800/60">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex p-1 rounded bg-slate-800 text-slate-600">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {row.qc ? (
                          <span className="inline-flex p-1 rounded bg-amber-950 text-amber-400 border border-amber-800/60">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex p-1 rounded bg-slate-800 text-slate-600">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {row.audit ? (
                          <span className="inline-flex p-1 rounded bg-purple-950 text-purple-400 border border-purple-800/60">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex p-1 rounded bg-slate-800 text-slate-600">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM CONFIGURATION & PARAMETERS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-1">General Enterprise Configuration</h3>
            <p className="text-xs text-slate-400 mb-6">
              Master parameters controlling procurement automation, warehouse thresholds, and audit behavior.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Operating Corporation Name
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Primary Facility / Plant Code
                </label>
                <input
                  type="text"
                  required
                  value={facilityCode}
                  onChange={e => setFacilityCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Base Financial Currency Symbol
                </label>
                <select
                  value={currencySymbol}
                  onChange={e => setCurrencySymbol(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="$">US Dollar ($)</option>
                  <option value="₨">Pakistani Rupee (₨)</option>
                  <option value="₹">Indian Rupee (₹)</option>
                  <option value="€">Euro (€)</option>
                  <option value="£">British Pound (£)</option>
                  <option value="AED">UAE Dirham (AED)</option>
                  <option value="SAR">Saudi Riyal (SAR)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Critical Low-Stock Reorder Threshold (%)
                </label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={reorderThreshold}
                  onChange={e => setReorderThreshold(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Inactivity Session Timeout (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={sessionTimeout}
                  onChange={e => setSessionTimeout(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Operational Flags & Policies
              </h4>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div>
                  <div className="text-xs font-semibold text-white">Strict Quality Inspection Mode</div>
                  <div className="text-[11px] text-slate-400">
                    Incoming items must have an Authorized GRN record with QC Passed status before quantity reflects in available warehouse stock.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={strictQC}
                  onChange={e => setStrictQC(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div>
                  <div className="text-xs font-semibold text-white">Automated PR Suggestion Engine</div>
                  <div className="text-[11px] text-slate-400">
                    Automatically draft purchase requisitions when SKU quantities hit safety stock benchmarks.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoPR}
                  onChange={e => setAutoPR(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800">
              {settingsSavedMessage ? (
                <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Configuration saved successfully and broadcast to all modules!</span>
                </div>
              ) : (
                <span className="text-[11px] text-slate-500">Changes apply immediately across live sessions.</span>
              )}

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-colors cursor-pointer"
              >
                Save System Parameters
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 4: SECURITY & LOGIN AUDIT LEDGER */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit trail by user, IP, action, or details..."
                value={logSearchQuery}
                onChange={e => setLogSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-800 text-xs bg-slate-800/70 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">
                Total Events: <span className="font-bold text-white">{filteredLogs.length}</span>
              </span>
              <button
                onClick={() => {
                  if (confirm('Clear the current security audit log history?')) {
                    clearSecurityLogs();
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-medium cursor-pointer"
              >
                Clear Log History
              </button>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Event Action</th>
                    <th className="py-3 px-4">Account / Performer</th>
                    <th className="py-3 px-4">Terminal IP</th>
                    <th className="py-3 px-4">Event Outcome</th>
                    <th className="py-3 px-4">Telemetry Context</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No security events recorded.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map(log => {
                      const statusColor =
                        log.status === 'success'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
                          : log.status === 'warning'
                          ? 'bg-amber-950 text-amber-300 border-amber-800/60'
                          : 'bg-rose-950 text-rose-300 border-rose-800/60';

                      return (
                        <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-indigo-400 font-bold uppercase text-[11px]">
                              {log.action.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-white">{log.userName}</div>
                            <div className="text-[11px] text-slate-400">{log.userEmail}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-300">{log.ipAddress}</td>
                          <td className="py-3 px-4">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${statusColor}`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-300 text-[11px] max-w-xs truncate">{log.details}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DATABASE BACKUP & RESTORATION */}
      {activeTab === 'database' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800/60 flex items-center justify-center mb-4">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Export Full ERP Database Snapshot</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Download a clean, structured JSON file containing all stock records, purchase requisitions, orders, GRNs, vendors, users, and audit records.
              </p>
            </div>
            <button
              onClick={handleExportDatabase}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center justify-center space-x-2 cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON Backup Snapshot</span>
            </button>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-950 text-rose-400 border border-rose-800/60 flex items-center justify-center mb-4">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Reset System to Factory Demo State</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Restores default industrial inventory items, sample purchase orders, vendor scorecards, and demo user accounts in your local storage.
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('CRITICAL ACTION: Reset all inventory, purchase orders, and receiving records back to initial demo seeds?')) {
                  resetToDemoData();
                  alert('ERP state refreshed to initial demo seed.');
                }
              }}
              className="w-full py-2.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800/80 text-xs font-semibold flex items-center justify-center space-x-2 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset Demo Database</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW USER */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-800 text-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h2 className="text-base font-bold text-white">Provision New System User</h2>
                <p className="text-xs text-slate-400">Configure role clearance and access credentials</p>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={e => setNewUserName(e.target.value)}
                    placeholder="e.g. Tariq Mehmood"
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Username Handle</label>
                  <input
                    type="text"
                    required
                    value={newUserUsername}
                    onChange={e => setNewUserUsername(e.target.value)}
                    placeholder="e.g. tmehmood"
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={e => setNewUserEmail(e.target.value)}
                    placeholder="tariq@prowarehouse.com"
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Assigned System Role</label>
                  <select
                    value={newUserRole}
                    onChange={e => setNewUserRole(e.target.value as UserRole)}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="warehouse_supervisor">Warehouse Supervisor</option>
                    <option value="procurement_manager">Procurement Manager</option>
                    <option value="qc_officer">Inward QC Inspector</option>
                    <option value="auditor">Internal Auditor</option>
                    <option value="admin">Super Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={newUserDepartment}
                    onChange={e => setNewUserDepartment(e.target.value)}
                    placeholder="e.g. Sourcing & Logistics"
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Assigned Facility / Hub</label>
                  <select
                    value={newUserWarehouse}
                    onChange={e => setNewUserWarehouse(e.target.value)}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="WH-01 Central Hub">WH-01 Central Hub</option>
                    <option value="WH-02 Distribution Center">WH-02 Distribution Center</option>
                    <option value="Global (All Facilities)">Global (All Facilities)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={newUserPhone}
                    onChange={e => setNewUserPhone(e.target.value)}
                    placeholder="+92 300 0000000"
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Initial Password</label>
                  <input
                    type="text"
                    required
                    value={newUserPassword}
                    onChange={e => setNewUserPassword(e.target.value)}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30"
                >
                  Confirm & Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT USER */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-800 text-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h2 className="text-base font-bold text-white">Edit User Profile: {editingUser.name}</h2>
                <p className="text-xs text-slate-400">Update role assignments and facility parameters</p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="space-y-3.5">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editingUser.email}
                    onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">System Role</label>
                  <select
                    value={editingUser.role}
                    onChange={e => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="warehouse_supervisor">Warehouse Supervisor</option>
                    <option value="procurement_manager">Procurement Manager</option>
                    <option value="qc_officer">Inward QC Inspector</option>
                    <option value="auditor">Internal Auditor</option>
                    <option value="admin">Super Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={editingUser.department}
                    onChange={e => setEditingUser({ ...editingUser, department: e.target.value })}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Assigned Facility</label>
                  <select
                    value={editingUser.assignedWarehouse}
                    onChange={e => setEditingUser({ ...editingUser, assignedWarehouse: e.target.value })}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="WH-01 Central Hub">WH-01 Central Hub</option>
                    <option value="WH-02 Distribution Center">WH-02 Distribution Center</option>
                    <option value="Global (All Facilities)">Global (All Facilities)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">Phone</label>
                <input
                  type="text"
                  value={editingUser.phone || ''}
                  onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30"
                >
                  Save Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESET PASSWORD */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-800 text-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h2 className="text-base font-bold text-white">Reset User Password</h2>
                <p className="text-xs text-slate-400">Account: {resettingUser.email}</p>
              </div>
              <button
                onClick={() => setResettingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">New Security Password</label>
                <input
                  type="text"
                  required
                  placeholder="Enter new password"
                  value={newPasswordValue}
                  onChange={e => setNewPasswordValue(e.target.value)}
                  className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-md shadow-amber-600/30"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
