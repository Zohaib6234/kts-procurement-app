import { SystemUser, SystemSettings, SecurityLog } from '../types';

export interface StoredUser extends SystemUser {
  passwordHash: string; // Plaintext or simple hash for demo authentication
}

export const INITIAL_USERS: StoredUser[] = [
  {
    id: 'usr-001',
    username: 'admin',
    name: 'Arif Khan',
    email: 'admin@prowarehouse.com',
    role: 'admin',
    department: 'IT & System Administration',
    status: 'active',
    lastLogin: '2026-09-02 11:34 AM',
    createdAt: '2026-01-15',
    assignedWarehouse: 'Global (All Facilities)',
    phone: '+92 300 1234567',
    passwordHash: 'admin123'
  },
  {
    id: 'usr-002',
    username: 'warehouse',
    name: 'Bilal Tariq',
    email: 'warehouse@prowarehouse.com',
    role: 'warehouse_supervisor',
    department: 'Warehouse Logistics & Dispatch',
    status: 'active',
    lastLogin: '2026-09-02 09:12 AM',
    createdAt: '2026-02-01',
    assignedWarehouse: 'WH-01 Central Hub',
    phone: '+92 321 9876543',
    passwordHash: 'wh123'
  },
  {
    id: 'usr-003',
    username: 'procurement',
    name: 'Farhan Saeed',
    email: 'procurement@prowarehouse.com',
    role: 'procurement_manager',
    department: 'Supply Chain & Sourcing',
    status: 'active',
    lastLogin: '2026-09-01 04:50 PM',
    createdAt: '2026-02-10',
    assignedWarehouse: 'WH-01 Central Hub',
    phone: '+92 333 4567890',
    passwordHash: 'po123'
  },
  {
    id: 'usr-004',
    username: 'qc',
    name: 'Zainab Malik',
    email: 'qc@prowarehouse.com',
    role: 'qc_officer',
    department: 'Inward Quality Control (QC)',
    status: 'active',
    lastLogin: '2026-09-02 08:25 AM',
    createdAt: '2026-03-05',
    assignedWarehouse: 'WH-02 Distribution Center',
    phone: '+92 345 6789012',
    passwordHash: 'qc123'
  },
  {
    id: 'usr-005',
    username: 'auditor',
    name: 'Hamza Siddiqui',
    email: 'auditor@prowarehouse.com',
    role: 'auditor',
    department: 'Internal Audit & Risk Compliance',
    status: 'active',
    lastLogin: '2026-08-31 02:15 PM',
    createdAt: '2026-03-20',
    assignedWarehouse: 'Global (All Facilities)',
    phone: '+92 312 3456789',
    passwordHash: 'audit123'
  }
];

export const INITIAL_SETTINGS: SystemSettings = {
  companyName: 'Karachi Transport Service (KTS)',
  facilityCode: 'KTS-MALIR-DEPOT-01',
  currencySymbol: 'Rs.',
  reorderAlertThreshold: 20,
  autoPRGeneration: true,
  strictQCMode: true,
  sessionTimeoutMinutes: 60,
  enforceTwoFactor: false,
  maintenanceMode: false
};

export const INITIAL_SECURITY_LOGS: SecurityLog[] = [
  {
    id: 'sec-001',
    timestamp: '2026-09-02 11:34:12',
    userId: 'usr-001',
    userEmail: 'admin@prowarehouse.com',
    userName: 'Arif Khan',
    action: 'login',
    status: 'success',
    ipAddress: '192.168.1.104',
    details: 'Authenticated successfully via Bento ERP Portal'
  },
  {
    id: 'sec-002',
    timestamp: '2026-09-02 09:12:05',
    userId: 'usr-002',
    userEmail: 'warehouse@prowarehouse.com',
    userName: 'Bilal Tariq',
    action: 'login',
    status: 'success',
    ipAddress: '192.168.1.118',
    details: 'Warehouse Station WH-01 Terminal Login'
  },
  {
    id: 'sec-003',
    timestamp: '2026-09-02 08:25:40',
    userId: 'usr-004',
    userEmail: 'qc@prowarehouse.com',
    userName: 'Zainab Malik',
    action: 'login',
    status: 'success',
    ipAddress: '192.168.2.45',
    details: 'Inward QC Dock Tablet verification'
  },
  {
    id: 'sec-004',
    timestamp: '2026-09-01 18:04:22',
    userId: 'usr-003',
    userEmail: 'procurement@prowarehouse.com',
    userName: 'Farhan Saeed',
    action: 'settings_updated',
    status: 'success',
    ipAddress: '192.168.1.150',
    details: 'Updated PO threshold and supplier lead time defaults'
  },
  {
    id: 'sec-005',
    timestamp: '2026-09-01 14:22:18',
    userEmail: 'guest@unknown.com',
    userName: 'Unknown Attempt',
    action: 'failed_login',
    status: 'warning',
    ipAddress: '10.0.4.88',
    details: 'Invalid password attempt for account: guest@unknown.com'
  }
];
