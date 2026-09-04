import { SystemUser, SystemSettings, SecurityLog } from '../types';

export interface StoredUser extends SystemUser {
  passwordHash: string; // Plaintext or simple hash for demo authentication
}

export const INITIAL_USERS: StoredUser[] = [
  {
    id: 'usr-001',
    username: 'admin',
    name: 'Kashif Mehmood (Admin)',
    email: 'admin@kts.com.pk',
    role: 'admin',
    department: 'Executive Administration & IT',
    status: 'active',
    lastLogin: '2026-09-04 10:30 AM',
    createdAt: '2026-01-15',
    assignedWarehouse: 'Global (All Facilities)',
    phone: '+92 300 1234567',
    passwordHash: 'admin123'
  },
  {
    id: 'usr-002',
    username: 'warehouse',
    name: 'Bilal Tariq (Warehouse Lead)',
    email: 'warehouse@kts.com.pk',
    role: 'warehouse_supervisor',
    department: 'Central Stores & Fleet Inventory',
    status: 'active',
    lastLogin: '2026-09-04 09:12 AM',
    createdAt: '2026-02-01',
    assignedWarehouse: 'KTS Central Bus Depot, Malir',
    phone: '+92 321 9876543',
    passwordHash: 'wh123'
  },
  {
    id: 'usr-003',
    username: 'procurement',
    name: 'Farhan Saeed (Procurement Mgr)',
    email: 'procurement@kts.com.pk',
    role: 'procurement_manager',
    department: 'Supply Chain & Sourcing',
    status: 'active',
    lastLogin: '2026-09-03 04:50 PM',
    createdAt: '2026-02-10',
    assignedWarehouse: 'KTS Central Bus Depot, Malir',
    phone: '+92 333 4567890',
    passwordHash: 'po123'
  },
  {
    id: 'usr-004',
    username: 'qc',
    name: 'Zainab Malik (Inward QC)',
    email: 'qc@kts.com.pk',
    role: 'qc_officer',
    department: 'Inward Quality Control (QC)',
    status: 'active',
    lastLogin: '2026-09-04 08:25 AM',
    createdAt: '2026-03-05',
    assignedWarehouse: 'Inward Receiving Dock Bay 3',
    phone: '+92 345 6789012',
    passwordHash: 'qc123'
  },
  {
    id: 'usr-005',
    username: 'audit',
    name: 'Audit & Compliance Officer',
    email: 'audit.kts.pbs@gmail.com',
    role: 'admin',
    department: 'Internal Audit & Risk Compliance',
    status: 'active',
    lastLogin: '2026-09-04 02:15 PM',
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
    timestamp: '2026-09-04 10:34:12',
    userId: 'usr-001',
    userEmail: 'admin@kts.com.pk',
    userName: 'Kashif Mehmood',
    action: 'login',
    status: 'success',
    ipAddress: '192.168.1.104',
    details: 'Authenticated successfully via KTS Fleet ERP Portal (Admin Access)'
  },
  {
    id: 'sec-002',
    timestamp: '2026-09-04 09:12:05',
    userId: 'usr-002',
    userEmail: 'warehouse@kts.com.pk',
    userName: 'Bilal Tariq',
    action: 'login',
    status: 'success',
    ipAddress: '192.168.1.118',
    details: 'Warehouse Station Malir Depot Terminal Login (Warehouse Scope)'
  },
  {
    id: 'sec-003',
    timestamp: '2026-09-04 08:25:40',
    userId: 'usr-004',
    userEmail: 'qc@kts.com.pk',
    userName: 'Zainab Malik',
    action: 'login',
    status: 'success',
    ipAddress: '192.168.2.45',
    details: 'Inward QC Dock Bay 3 Tablet verification'
  },
  {
    id: 'sec-004',
    timestamp: '2026-09-03 18:04:22',
    userId: 'usr-003',
    userEmail: 'procurement@kts.com.pk',
    userName: 'Farhan Saeed',
    action: 'settings_updated',
    status: 'success',
    ipAddress: '192.168.1.150',
    details: 'Updated PO threshold and supplier lead time defaults'
  },
  {
    id: 'sec-005',
    timestamp: '2026-09-04 02:15:18',
    userId: 'usr-005',
    userEmail: 'audit.kts.pbs@gmail.com',
    userName: 'Audit & Compliance Officer',
    action: 'login',
    status: 'success',
    ipAddress: '10.0.4.88',
    details: 'Executive Audit session initialized'
  }
];
