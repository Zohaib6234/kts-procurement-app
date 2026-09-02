import React, { createContext, useContext, useState, useEffect } from 'react';
import { SystemUser, UserRole, SystemSettings, SecurityLog } from '../types';
import { INITIAL_USERS, INITIAL_SETTINGS, INITIAL_SECURITY_LOGS, StoredUser } from '../data/authInitialData';

interface AuthContextType {
  currentUser: SystemUser | null;
  users: StoredUser[];
  systemSettings: SystemSettings;
  securityLogs: SecurityLog[];
  login: (emailOrUsername: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  switchUser: (userId: string) => void;
  addUser: (user: Omit<SystemUser, 'id' | 'createdAt'>, password?: string) => void;
  updateUser: (id: string, updates: Partial<SystemUser>) => void;
  deleteUser: (id: string) => boolean;
  toggleUserStatus: (id: string) => void;
  resetUserPassword: (id: string, newPass: string) => void;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
  clearSecurityLogs: () => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<StoredUser[]>(() => {
    const saved = localStorage.getItem('erp_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<SystemUser | null>(() => {
    const saved = localStorage.getItem('erp_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_USERS[0];
      }
    }
    // Default logged in as Super Admin for instant preview accessibility
    return INITIAL_USERS[0];
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('erp_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>(() => {
    const saved = localStorage.getItem('erp_security_logs');
    return saved ? JSON.parse(saved) : INITIAL_SECURITY_LOGS;
  });

  // Sync users
  useEffect(() => {
    localStorage.setItem('erp_users', JSON.stringify(users));
  }, [users]);

  // Sync current user
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('erp_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('erp_auth_user');
    }
  }, [currentUser]);

  // Sync settings
  useEffect(() => {
    localStorage.setItem('erp_settings', JSON.stringify(systemSettings));
  }, [systemSettings]);

  // Sync security logs
  useEffect(() => {
    localStorage.setItem('erp_security_logs', JSON.stringify(securityLogs));
  }, [securityLogs]);

  const addLog = (
    action: SecurityLog['action'],
    status: SecurityLog['status'],
    details: string,
    userEmail: string,
    userName: string,
    userId?: string
  ) => {
    const now = new Date();
    const formatted = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
    const newLog: SecurityLog = {
      id: `sec-${Date.now().toString(36)}`,
      timestamp: formatted,
      userId,
      userEmail,
      userName,
      action,
      status,
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 200 + 10),
      details
    };
    setSecurityLogs(prev => [newLog, ...prev.slice(0, 99)]);
  };

  const login = (emailOrUsername: string, password: string): { success: boolean; message?: string } => {
    const query = emailOrUsername.trim().toLowerCase();
    const found = users.find(
      u => u.email.toLowerCase() === query || u.username.toLowerCase() === query
    );

    if (!found) {
      addLog('failed_login', 'error', `Unknown account identifier: "${emailOrUsername}"`, emailOrUsername, 'Guest / Unknown');
      return { success: false, message: 'User account not found with this email or username.' };
    }

    if (found.status === 'suspended') {
      addLog('failed_login', 'warning', `Attempted login on suspended account: ${found.email}`, found.email, found.name, found.id);
      return { success: false, message: 'This user account is suspended by System Administrator.' };
    }

    if (found.passwordHash !== password) {
      addLog('failed_login', 'error', `Invalid password entered for: ${found.email}`, found.email, found.name, found.id);
      return { success: false, message: 'Invalid password. Please check your credentials.' };
    }

    // Update last login
    const nowStr = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const updatedUser = { ...found, lastLogin: nowStr };
    setCurrentUser(updatedUser);

    setUsers(prev => prev.map(u => (u.id === found.id ? { ...u, lastLogin: nowStr } : u)));
    addLog('login', 'success', `Authenticated successfully as ${found.role.replace('_', ' ').toUpperCase()}`, found.email, found.name, found.id);

    return { success: true };
  };

  const logout = () => {
    if (currentUser) {
      addLog('logout', 'success', 'User ended session normally', currentUser.email, currentUser.name, currentUser.id);
    }
    setCurrentUser(null);
  };

  const switchUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found && found.status === 'active') {
      setCurrentUser(found);
      addLog('login', 'success', `Quick role switched to ${found.name} (${found.role})`, found.email, found.name, found.id);
    }
  };

  const addUser = (userData: Omit<SystemUser, 'id' | 'createdAt'>, password = 'user123') => {
    const newUser: StoredUser = {
      ...userData,
      id: `usr-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString().split('T')[0],
      passwordHash: password
    };
    setUsers(prev => [newUser, ...prev]);
    if (currentUser) {
      addLog('user_created', 'success', `Created user ${newUser.name} (${newUser.email}) with role ${newUser.role}`, currentUser.email, currentUser.name, currentUser.id);
    }
  };

  const updateUser = (id: string, updates: Partial<SystemUser>) => {
    setUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, ...updates } : u))
    );
    if (currentUser?.id === id) {
      setCurrentUser(prev => (prev ? { ...prev, ...updates } : null));
    }
    if (currentUser) {
      addLog('user_updated', 'success', `Modified profile for user ID ${id}`, currentUser.email, currentUser.name, currentUser.id);
    }
  };

  const deleteUser = (id: string): boolean => {
    if (currentUser?.id === id) {
      alert('You cannot delete your own active administrator account.');
      return false;
    }
    const target = users.find(u => u.id === id);
    setUsers(prev => prev.filter(u => u.id !== id));
    if (currentUser && target) {
      addLog('user_deleted', 'warning', `Deleted account: ${target.name} (${target.email})`, currentUser.email, currentUser.name, currentUser.id);
    }
    return true;
  };

  const toggleUserStatus = (id: string) => {
    if (currentUser?.id === id) {
      alert('You cannot suspend your own active administrator account.');
      return;
    }
    setUsers(prev =>
      prev.map(u => {
        if (u.id === id) {
          const newStatus = u.status === 'active' ? 'suspended' : 'active';
          if (currentUser) {
            addLog('user_updated', 'warning', `Changed status of ${u.name} to ${newStatus.toUpperCase()}`, currentUser.email, currentUser.name, currentUser.id);
          }
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const resetUserPassword = (id: string, newPass: string) => {
    setUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, passwordHash: newPass } : u))
    );
    const target = users.find(u => u.id === id);
    if (currentUser && target) {
      addLog('password_reset', 'success', `Password reset performed for ${target.email}`, currentUser.email, currentUser.name, currentUser.id);
    }
  };

  const updateSystemSettings = (updates: Partial<SystemSettings>) => {
    setSystemSettings(prev => ({ ...prev, ...updates }));
    if (currentUser) {
      addLog('settings_updated', 'success', `Updated system configuration parameters`, currentUser.email, currentUser.name, currentUser.id);
    }
  };

  const clearSecurityLogs = () => {
    setSecurityLogs([]);
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true; // Super admin has all permissions
    if (Array.isArray(roles)) {
      return roles.includes(currentUser.role);
    }
    return currentUser.role === roles;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        systemSettings,
        securityLogs,
        login,
        logout,
        switchUser,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        resetUserPassword,
        updateSystemSettings,
        clearSecurityLogs,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
