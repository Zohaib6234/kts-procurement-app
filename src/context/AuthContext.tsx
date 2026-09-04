import React, { createContext, useContext, useState, useEffect } from 'react';
import { SystemUser, SecurityLog, SystemSettings } from '../types';
import {
  StoredUser,
  INITIAL_USERS,
  INITIAL_SETTINGS,
  INITIAL_SECURITY_LOGS
} from '../data/authInitialData';

interface AuthContextType {
  currentUser: StoredUser | null;
  isAuthenticated: boolean;
  users: StoredUser[];
  securityLogs: SecurityLog[];
  systemSettings: SystemSettings;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  login: (identifier: string, password?: string) => { success: boolean; message: string };
  logout: () => void;
  switchUser: (userId: string) => void;
  addUser: (user: Omit<StoredUser, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<StoredUser>) => void;
  deleteUser: (id: string) => void;
  updateSettings: (updates: Partial<SystemSettings>) => void;
  logAction: (action: SecurityLog['action'], details: string, status?: SecurityLog['status']) => void;
  clearSecurityLogs: () => void;
  resetUsersAndSettings: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<StoredUser[]>(() => {
    const saved = localStorage.getItem('pms_system_users');
    if (!saved) return INITIAL_USERS;
    try {
      const parsed: StoredUser[] = JSON.parse(saved);
      // Migrate any stale prowarehouse.com domains or missing accounts
      const merged = INITIAL_USERS.map(initUser => {
        const existing = parsed.find(
          u => u.id === initUser.id || u.username.toLowerCase() === initUser.username.toLowerCase()
        );
        if (!existing) return initUser;
        // Keep updated fields like KTS email and department
        return {
          ...existing,
          email: initUser.email,
          name: initUser.name,
          role: initUser.role,
          department: initUser.department,
          assignedWarehouse: initUser.assignedWarehouse,
          passwordHash: existing.passwordHash || initUser.passwordHash
        };
      });
      // Also keep any custom users added via AdminView
      const customUsers = parsed.filter(u => !INITIAL_USERS.some(init => init.id === u.id));
      return [...merged, ...customUsers];
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<StoredUser | null>(() => {
    const saved = localStorage.getItem('pms_active_user');
    if (saved) {
      try {
        const parsed: StoredUser = JSON.parse(saved);
        const matched = INITIAL_USERS.find(
          u => u.id === parsed.id || u.username.toLowerCase() === parsed.username.toLowerCase()
        );
        if (matched) {
          return { ...parsed, email: matched.email, role: matched.role, name: matched.name };
        }
        return parsed;
      } catch (e) {
        return INITIAL_USERS[0];
      }
    }
    return INITIAL_USERS[0];
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>(() => {
    const saved = localStorage.getItem('pms_security_logs');
    return saved ? JSON.parse(saved) : INITIAL_SECURITY_LOGS;
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('pms_system_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('pms_system_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('pms_active_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('pms_active_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('pms_security_logs', JSON.stringify(securityLogs));
  }, [securityLogs]);

  useEffect(() => {
    localStorage.setItem('pms_system_settings', JSON.stringify(systemSettings));
  }, [systemSettings]);

  const logAction = (
    action: SecurityLog['action'],
    details: string,
    status: SecurityLog['status'] = 'success'
  ) => {
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newLog: SecurityLog = {
      id: `sec-${Date.now().toString().slice(-5)}`,
      timestamp,
      userId: currentUser?.id,
      userEmail: currentUser?.email || 'system@kts.com.pk',
      userName: currentUser?.name || 'System Operator',
      action,
      status,
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 80 + 10),
      details
    };

    setSecurityLogs(prev => [newLog, ...prev.slice(0, 99)]);
  };

  const login = (identifier: string, password?: string) => {
    const trimmed = identifier.trim().toLowerCase();
    
    // Support aliases: 'wh' -> warehouse, 'po' -> procurement
    let normalized = trimmed;
    if (trimmed === 'wh' || trimmed === 'store' || trimmed === 'stores') normalized = 'warehouse';
    if (trimmed === 'po' || trimmed === 'purchasing') normalized = 'procurement';
    if (trimmed === 'audit' || trimmed === 'auditor') normalized = 'audit';

    const foundUser = users.find(
      u =>
        u.username.toLowerCase() === normalized ||
        u.email.toLowerCase() === normalized ||
        u.role.toLowerCase() === normalized ||
        (normalized === 'warehouse' && u.role === 'warehouse_supervisor') ||
        (normalized === 'procurement' && u.role === 'procurement_manager')
    );

    if (!foundUser) {
      logAction('failed_login', `Failed sign-in attempt for identifier: "${identifier}"`, 'error');
      return { success: false, message: 'User identifier not recognized. Please check email or username.' };
    }

    if (foundUser.status === 'suspended') {
      logAction('failed_login', `Denied sign-in to suspended account: ${foundUser.email}`, 'warning');
      return { success: false, message: 'Your account is suspended. Please contact the Administrator.' };
    }

    // Password validation: allow correct password or default role demo passwords
    const validPass =
      !password ||
      password === foundUser.passwordHash ||
      password === 'admin123' ||
      (foundUser.role === 'warehouse_supervisor' && password === 'wh123') ||
      (foundUser.role === 'procurement_manager' && password === 'po123') ||
      (foundUser.role === 'qc_officer' && password === 'qc123') ||
      (foundUser.role === 'admin' && password === 'admin123');

    if (!validPass) {
      logAction('failed_login', `Incorrect password attempt for user: ${foundUser.email}`, 'error');
      return { success: false, message: `Invalid password for ${foundUser.username}. Try "${foundUser.passwordHash}".` };
    }

    const updatedUser: StoredUser = {
      ...foundUser,
      lastLogin: new Date().toLocaleString()
    };

    setUsers(prev => prev.map(u => (u.id === foundUser.id ? updatedUser : u)));
    setCurrentUser(updatedUser);
    logAction('login', `User ${foundUser.name} authenticated successfully (${foundUser.role})`, 'success');
    return { success: true, message: `Welcome back, ${foundUser.name}!` };
  };

  const logout = () => {
    if (currentUser) {
      logAction('logout', `User ${currentUser.name} signed out cleanly`, 'success');
    }
    setCurrentUser(null);
  };

  const switchUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      logAction('login', `Switched active profile to ${target.name} (${target.role})`, 'success');
    }
  };

  const addUser = (userData: Omit<StoredUser, 'id' | 'createdAt'>) => {
    const newId = `usr-${String(users.length + 1).padStart(3, '0')}`;
    const newUser: StoredUser = {
      ...userData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
      passwordHash: userData.passwordHash || 'user123'
    };

    setUsers(prev => [...prev, newUser]);
    logAction('user_created', `Registered new operator: ${newUser.name} (${newUser.role})`);
  };

  const updateUser = (id: string, updates: Partial<StoredUser>) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === id) {
          const updated = { ...u, ...updates };
          if (currentUser?.id === id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
    logAction('user_updated', `Updated permissions/profile for user ID: ${id}`);
  };

  const deleteUser = (id: string) => {
    const userToDelete = users.find(u => u.id === id);
    if (userToDelete?.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1) {
      alert('Cannot delete the primary System Administrator account.');
      return;
    }

    setUsers(prev => prev.filter(u => u.id !== id));
    logAction('user_deleted', `Deleted user account: ${userToDelete?.name || id}`, 'warning');

    if (currentUser?.id === id) {
      const fallback = users.find(u => u.id !== id) || null;
      setCurrentUser(fallback);
    }
  };

  const updateSettings = (updates: Partial<SystemSettings>) => {
    setSystemSettings(prev => ({ ...prev, ...updates }));
    logAction('settings_updated', 'Updated master ERP parameters');
  };

  const clearSecurityLogs = () => {
    setSecurityLogs([]);
  };

  const resetUsersAndSettings = () => {
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setSystemSettings(INITIAL_SETTINGS);
    setSecurityLogs(INITIAL_SECURITY_LOGS);
    localStorage.removeItem('pms_system_users');
    localStorage.removeItem('pms_active_user');
    localStorage.removeItem('pms_system_settings');
    localStorage.removeItem('pms_security_logs');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        users,
        securityLogs,
        systemSettings,
        isLoginModalOpen,
        setIsLoginModalOpen,
        login,
        logout,
        switchUser,
        addUser,
        updateUser,
        deleteUser,
        updateSettings,
        logAction,
        clearSecurityLogs,
        resetUsersAndSettings
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
