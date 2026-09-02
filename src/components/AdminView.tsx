import React, { useState } from 'react';
import {
  Shield,
  Users,
  KeyRound,
  FileSpreadsheet,
  FileText,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  Search,
  Filter,
  Sliders,
  Building2,
  Activity,
  Lock,
  UserCheck,
  UserX,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWarehouse } from '../context/WarehouseContext';
import { SystemUser, UserRole, SecurityLog } from '../types';
import { exportAuditLogsToExcel, exportAuditLogsToPDF } from '../utils/exportUtils';

export const AdminView: React.FC = () => {
  const {
    currentUser,
    users,
    securityLogs,
    systemSettings,
    addUser,
    updateUser,
    deleteUser,
    updateSettings,
    clearSecurityLogs,
    resetUsersAndSettings
  } = useAuth();

  const { resetToDemoData, items, vendors, purchaseOrders } = useWarehouse();

  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'settings'>('users');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logActionFilter, setLogActionFilter] = useState<string>('all');

  // Modals
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<SystemUser | null>(null);

  // New User Form State
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('warehouse_supervisor');
  const [newDept, setNewDept] = useState('Warehouse & Inventory');
  const [newWarehouse, setNewWarehouse] = useState('Central Plant 1 - Karachi');
  const [newPhone, setNewPhone] = useState('');

  // Settings local state
  const [settingsForm, setSettingsForm] = useState(systemSettings);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(userSearchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Filtered logs
  const filteredLogs = securityLogs.filter(log => {
    const matchesSearch =
      log.userName.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.ipAddress.includes(logSearchQuery);
    const matchesAction = logActionFilter === 'all' || log.action === logActionFilter;
    return matchesSearch && matchesAction;
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newUsername || !newEmail) {
      alert('Please fill in required fields.');
      return;
    }

    addUser({
      name: newName,
      username: newUsername.toLowerCase(),
      email: newEmail,
      role: newRole,
      department: newDept,
      assignedWarehouse: newWarehouse,
      phone: newPhone,
      status: 'active'
    });

    setIsAddUserModalOpen(false);
    setNewName('');
    setNewUsername('');
    setNewEmail('');
    setNewPhone('');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 2500);
  };

  const handleFullDemoReset = () => {
    if (
      confirm(
        '⚠️ Are you sure you want to reset all ERP data to default demo state? This will restore initial stock, suppliers, purchase requisitions, orders, and system logs.'
      )
    ) {
      resetToDemoData();
      resetUsersAndSettings();
      alert('System successfully restored to initial state.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/60">
              <Shield className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">System Administration & Governance</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Role-Based Access Control (RBAC), user directory, master ERP parameters, and immutable security audit logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleFullDemoReset}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-all cursor-pointer"
            title="Reset system to clean factory demonstration state"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset Demo Data</span>
          </button>
          {activeTab === 'users' && (
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register New User</span>
            </button>
          )}
          {activeTab === 'audit' && (
            <>
              <button
                onClick={() => exportAuditLogsToExcel(filteredLogs)}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Excel</span>
              </button>
              <button
                onClick={() => exportAuditLogsToPDF(filteredLogs)}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-all cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-rose-400" />
                <span>Export PDF</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bento Grid Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">System Operators</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white tracking-tight">{users.length}</span>
            <span className="text-xs font-semibold text-emerald-400">
              {users.filter(u => u.status === 'active').length} active
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Multi-tier role delegation enabled</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Logged Security Events</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white tracking-tight">{securityLogs.length}</span>
            <span className="text-xs font-semibold text-slate-400">Audit trail entries</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Real-time action logging active</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Governance Policy</span>
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-lg font-bold text-white tracking-tight">Strict QC & PR Flow</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Session timeout: {systemSettings.sessionTimeoutMinutes}m</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">ERP Facility</span>
            <Building2 className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-sm font-bold text-white truncate">{systemSettings.facilityCode}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">{systemSettings.companyName}</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center space-x-2 ${
            activeTab === 'users'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>User Management ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center space-x-2 ${
            activeTab === 'audit'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Audit & Security Logs ({securityLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center space-x-2 ${
            activeTab === 'settings'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Master ERP Settings</span>
        </button>
      </div>

      {/* TAB 1: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2 flex-1 min-w-[280px]">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, department..."
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
                <option value="admin">Administrator</option>
                <option value="procurement_manager">Procurement Manager</option>
                <option value="warehouse_supervisor">Warehouse Supervisor</option>
                <option value="qc_officer">Quality Control Officer</option>
                <option value="auditor">Auditor</option>
              </select>
            </div>

            <div className="text-xs text-slate-400 font-medium">
              Showing <span className="font-bold text-white">{filteredUsers.length}</span> of {users.length} accounts
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">User Details</th>
                    <th className="py-3 px-4">System Role</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Facility / Plant</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Activity</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No user accounts found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => {
                      const isCurrent = currentUser?.id === u.id;
                      const roleBadgeColor =
                        u.role === 'admin'
                          ? 'bg-purple-950 text-purple-300 border-purple-800/60'
                          : u.role === 'procurement_manager'
                          ? 'bg-indigo-950 text-indigo-300 border-indigo-800/60'
                          : u.role === 'warehouse_supervisor'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
                          : u.role === 'qc_officer'
                          ? 'bg-amber-950 text-amber-300 border-amber-800/60'
                          : 'bg-slate-800 text-slate-300 border-slate-700/60';

                      return (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-8 h-8 rounded-xl bg-indigo-600/80 flex items-center justify-center font-bold text-white text-xs">
                                {u.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-white flex items-center space-x-1.5">
                                  <span>{u.name}</span>
                                  {isCurrent && (
                                    <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-400 text-[10px] border border-indigo-800/60">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono">
                                  {u.username} • {u.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${roleBadgeColor}`}>
                              {u.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-300 font-medium">{u.department}</td>
                          <td className="py-3 px-4 text-slate-400">{u.assignedWarehouse}</td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() =>
                                updateUser(u.id, {
                                  status: u.status === 'active' ? 'suspended' : 'active'
                                })
                              }
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors border ${
                                u.status === 'active'
                                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900'
                                  : 'bg-rose-950 text-rose-400 border-rose-800/60 hover:bg-rose-900'
                              }`}
                              title="Click to toggle account status"
                            >
                              {u.status === 'active' ? 'Active' : 'Suspended'}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-slate-400 text-[11px]">
                            {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedUserForEdit(u);
                                setIsEditUserModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer border border-slate-700/60"
                              title="Edit User Profile & Role"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to remove user "${u.name}"?`)) {
                                  deleteUser(u.id);
                                }
                              }}
                              disabled={u.role === 'admin' && users.filter(x => x.role === 'admin').length <= 1}
                              className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 transition-colors cursor-pointer border border-rose-800/40 disabled:opacity-30"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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

      {/* TAB 2: AUDIT & SECURITY LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2 flex-1 min-w-[280px]">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search logs by actor, action, IP, or details..."
                  value={logSearchQuery}
                  onChange={e => setLogSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-800 text-xs bg-slate-800/70 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={logActionFilter}
                onChange={e => setLogActionFilter(e.target.value)}
                className="py-1.5 px-3 rounded-xl border border-slate-800 text-xs bg-slate-800/70 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Action Types</option>
                <option value="login">User Sign-in</option>
                <option value="logout">User Sign-out</option>
                <option value="failed_login">Failed Auth Attempt</option>
                <option value="user_created">User Provisioning</option>
                <option value="user_updated">User Modification</option>
                <option value="settings_updated">Settings Alteration</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (confirm('Clear local security logs display?')) {
                    clearSecurityLogs();
                  }
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                Clear Log History
              </button>
              <span className="text-xs text-slate-400 font-medium">
                <strong className="text-white">{filteredLogs.length}</strong> events
              </span>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">IP / Host</th>
                    <th className="py-3 px-4">Event Description</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No audit events recorded under this filter.
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
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                            {log.timestamp}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">{log.userName}</div>
                            <div className="text-[10px] text-slate-400">{log.userEmail}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[10px] border border-slate-700/60">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                            {log.ipAddress}
                          </td>
                          <td className="py-3 px-4 text-slate-200 text-xs max-w-md">{log.details}</td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${statusColor}`}>
                              {log.status}
                            </span>
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

      {/* TAB 3: MASTER SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xs max-w-3xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">ERP Master Parameters & Policy Settings</h2>
              <p className="text-xs text-slate-400">Configure corporate identifiers, safety thresholds, and QC enforcement</p>
            </div>
            {settingsSavedToast && (
              <span className="px-3 py-1 rounded-xl bg-emerald-950 text-emerald-300 text-xs font-semibold border border-emerald-800/60 animate-in fade-in flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Configuration Saved</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 pt-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Registered Legal Corporate Name
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.companyName}
                  onChange={e => setSettingsForm({ ...settingsForm, companyName: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Primary Hub / Facility Code
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.facilityCode}
                  onChange={e => setSettingsForm({ ...settingsForm, facilityCode: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Currency Symbol / Format
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.currencySymbol}
                  onChange={e => setSettingsForm({ ...settingsForm, currencySymbol: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Session Timeout Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={settingsForm.sessionTimeoutMinutes}
                  onChange={e =>
                    setSettingsForm({ ...settingsForm, sessionTimeoutMinutes: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Policy Toggles */}
            <div className="pt-2 space-y-3">
              <span className="block text-[11px] font-semibold text-slate-200">Governance Policies</span>

              <label className="flex items-center space-x-3 p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={settingsForm.strictQCMode}
                  onChange={e => setSettingsForm({ ...settingsForm, strictQCMode: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                />
                <div>
                  <div className="font-semibold text-white text-xs">Strict Quality Control (QC) Gatekeeping</div>
                  <div className="text-[11px] text-slate-400">
                    Require mandatory QA inspection on all incoming Goods Receipts before inventory is released for issuance.
                  </div>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={settingsForm.autoPRGeneration}
                  onChange={e => setSettingsForm({ ...settingsForm, autoPRGeneration: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                />
                <div>
                  <div className="font-semibold text-white text-xs">Automated Reorder Alerts & Suggestions</div>
                  <div className="text-[11px] text-slate-400">
                    Flag SKUs below safety stock buffer directly in the Procurement dashboard.
                  </div>
                </div>
              </label>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="submit"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save ERP Configuration</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD USER */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="font-bold text-sm text-white">Register ERP User Account</h3>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Imran Hashmi"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="imran.h"
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Assigned Role *</label>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="admin">Administrator</option>
                    <option value="procurement_manager">Procurement Manager</option>
                    <option value="warehouse_supervisor">Warehouse Supervisor</option>
                    <option value="qc_officer">Quality Control Officer</option>
                    <option value="auditor">Internal Auditor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Work Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="imran.h@falcon-erp.com"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={newDept}
                    onChange={e => setNewDept(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+92 300 ..."
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Assigned Facility</label>
                <input
                  type="text"
                  value={newWarehouse}
                  onChange={e => setNewWarehouse(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer shadow-md shadow-indigo-600/25"
                >
                  Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT USER */}
      {isEditUserModalOpen && selectedUserForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="font-bold text-sm text-white">Modify User Profile</h3>
              <button
                onClick={() => {
                  setIsEditUserModalOpen(false);
                  setSelectedUserForEdit(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                updateUser(selectedUserForEdit.id, selectedUserForEdit);
                setIsEditUserModalOpen(false);
                setSelectedUserForEdit(null);
              }}
              className="p-5 space-y-3 text-xs"
            >
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={selectedUserForEdit.name}
                  onChange={e =>
                    setSelectedUserForEdit({ ...selectedUserForEdit, name: e.target.value })
                  }
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Role</label>
                  <select
                    value={selectedUserForEdit.role}
                    onChange={e =>
                      setSelectedUserForEdit({
                        ...selectedUserForEdit,
                        role: e.target.value as UserRole
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="admin">Administrator</option>
                    <option value="procurement_manager">Procurement Manager</option>
                    <option value="warehouse_supervisor">Warehouse Supervisor</option>
                    <option value="qc_officer">Quality Control Officer</option>
                    <option value="auditor">Internal Auditor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Status</label>
                  <select
                    value={selectedUserForEdit.status}
                    onChange={e =>
                      setSelectedUserForEdit({
                        ...selectedUserForEdit,
                        status: e.target.value as 'active' | 'suspended'
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={selectedUserForEdit.email}
                  onChange={e =>
                    setSelectedUserForEdit({ ...selectedUserForEdit, email: e.target.value })
                  }
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Department</label>
                <input
                  type="text"
                  value={selectedUserForEdit.department}
                  onChange={e =>
                    setSelectedUserForEdit({ ...selectedUserForEdit, department: e.target.value })
                  }
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditUserModalOpen(false);
                    setSelectedUserForEdit(null);
                  }}
                  className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer shadow-md shadow-indigo-600/25"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
