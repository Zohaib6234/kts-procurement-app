import React, { useState } from 'react';
import {
  X,
  Lock,
  User,
  Shield,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  KeyRound,
  LogOut,
  Building2,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const LoginModal: React.FC = () => {
  const {
    currentUser,
    users,
    isLoginModalOpen,
    setIsLoginModalOpen,
    login,
    logout,
    switchUser
  } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isLoginModalOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!identifier) {
      setErrorMessage('Please enter your username or work email.');
      return;
    }

    const res = login(identifier, password);
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        setIsLoginModalOpen(false);
        setIdentifier('');
        setPassword('');
        setSuccessMessage('');
      }, 700);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleQuickSwitch = (userId: string) => {
    switchUser(userId);
    setIsLoginModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800/60">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">ERP System Authentication</h3>
              <p className="text-[11px] text-slate-400">Sign in with role-based credentials or switch active profile</p>
            </div>
          </div>
          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Current User Card if Logged In */}
          {currentUser && (
            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-indigo-600/30">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-xs">{currentUser.name}</span>
                    <span className="px-1.5 py-0.5 rounded bg-indigo-900/80 text-indigo-300 font-semibold text-[10px] border border-indigo-700/50 uppercase">
                      {currentUser.role.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{currentUser.email} • {currentUser.department}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setSuccessMessage('Logged out safely.');
                  setTimeout(() => setSuccessMessage(''), 2000);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-rose-100 font-semibold text-xs inline-flex items-center space-x-1 cursor-pointer transition-colors border border-rose-800/50"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}

          {/* Quick Profile Switching (Demo & Testing Convenience) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>1-Click Role Switcher</span>
              </span>
              <span className="text-[10px] text-indigo-400 font-medium">Instant Test Sign-In</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {users.map(u => {
                const isActive = currentUser?.id === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => handleQuickSwitch(u.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-950/60 shadow-sm ring-1 ring-indigo-500/40'
                        : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-slate-200 text-xs truncate flex items-center space-x-1.5">
                        <span>{u.name}</span>
                        {isActive && <CheckCircle2 className="w-3 h-3 text-indigo-400 shrink-0" />}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate capitalize">
                        {u.role.replace('_', ' ')}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">{u.username}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] text-slate-500 uppercase tracking-wider absolute">
              Or Sign In With Credentials
            </span>
          </div>

          {/* Custom Login Form */}
          <form onSubmit={handleCustomLogin} className="space-y-3">
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 flex items-center space-x-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 flex items-center space-x-2 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Username or Official Email
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. admin or kashif.m@falcon-erp.com"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Security Password
              </label>
              <div className="relative">
                <KeyRound className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Tip: Enter any password in demo mode or choose any profile above.
              </p>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all cursor-pointer mt-2"
            >
              <span>Authenticate Session</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
