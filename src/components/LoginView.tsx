import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Building2,
  Package,
  Layers,
  Sparkles,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StoredUser } from '../data/authInitialData';

export const LoginView: React.FC = () => {
  const { users, login } = useAuth();
  const [identifier, setIdentifier] = useState('admin@prowarehouse.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = login(identifier, password);
      if (!res.success) {
        setError(res.message || 'Login failed. Please check credentials.');
        setLoading(false);
      }
    }, 300);
  };

  const handleQuickLogin = (user: StoredUser) => {
    setIdentifier(user.email);
    setPassword(user.passwordHash);
    setError(null);
    setLoading(true);
    setTimeout(() => {
      login(user.email, user.passwordHash);
    }, 250);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 my-auto">
        {/* Left Bento: App Brand & Overview */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between backdrop-blur-md shadow-2xl">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white font-bold text-xl tracking-wider">
                PW
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold text-white tracking-tight">ProWarehouse</h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                    Bento OS
                  </span>
                </div>
                <p className="text-xs text-slate-400">Enterprise Warehouse & Procurement</p>
              </div>
            </div>

            <div className="space-y-4 my-6">
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Role-Based Clearance (RBAC)</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Separation of duties across Sourcing, Inward Receiving, QA, and Executive Audit.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Continuous Stock Telemetry</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Live bin slots, cycle counts, automated purchase orders, and GRN verification.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-amber-950 text-amber-400 shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Unified Admin Control</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    User directory, system parameters, data backup, and immutable audit logs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Production Version 2.5</span>
            <span className="flex items-center space-x-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All Clusters Online</span>
            </span>
          </div>
        </div>

        {/* Right Bento: Sign In Form + 1-Click Role Switcher */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[11px] font-medium mb-2 border border-slate-700/60">
                <Lock className="w-3 h-3 text-indigo-400" />
                <span>Authorized Personnel Access Only</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Sign In to ProWarehouse</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your credentials or choose a quick test persona below.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address or Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="e.g. admin@prowarehouse.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <span className="text-[11px] text-indigo-400 hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter security password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>Authenticate & Enter System</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Demo Personas */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>1-Click Test Personas (Quick Demo)</span>
              </span>
              <span className="text-[10px] text-slate-500">Auto fills & signs in</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {users.map(user => {
                const roleBadgeColor =
                  user.role === 'admin'
                    ? 'border-indigo-500/40 text-indigo-300 bg-indigo-950/60'
                    : user.role === 'warehouse_supervisor'
                    ? 'border-emerald-500/40 text-emerald-300 bg-emerald-950/60'
                    : user.role === 'procurement_manager'
                    ? 'border-blue-500/40 text-blue-300 bg-blue-950/60'
                    : user.role === 'qc_officer'
                    ? 'border-amber-500/40 text-amber-300 bg-amber-950/60'
                    : 'border-purple-500/40 text-purple-300 bg-purple-950/60';

                return (
                  <button
                    key={user.id}
                    onClick={() => handleQuickLogin(user)}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                        {user.name.split(' ')[0]}
                      </span>
                      <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${roleBadgeColor}`}>
                        {user.role === 'admin' ? 'Admin' : user.role === 'warehouse_supervisor' ? 'WH' : user.role === 'procurement_manager' ? 'Proc' : user.role === 'qc_officer' ? 'QC' : 'Audit'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      Pass: <span className="font-mono text-slate-300">{user.passwordHash}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
