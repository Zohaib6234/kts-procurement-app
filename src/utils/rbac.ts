import { UserRole } from '../types';

export type TabType =
  | 'dashboard'
  | 'procurement'
  | 'warehouse'
  | 'issuance'
  | 'grn'
  | 'vendors'
  | 'audit'
  | 'admin';

export interface RoleConfig {
  role: UserRole;
  title: string;
  shortTitle: string;
  scopeBadge: string;
  description: string;
  allowedTabs: TabType[];
  defaultTab: TabType;
  badgeBg: string;
  canManageUsers: boolean;
  canEditSettings: boolean;
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  admin: {
    role: 'admin',
    title: 'System Administrator',
    shortTitle: 'Admin (Full Access)',
    scopeBadge: 'All Modules (Master Clearance)',
    description: 'Unrestricted master access across all procurement, warehouse, fleet stores, security gate passes, audit logs, and administrative controls.',
    allowedTabs: ['dashboard', 'procurement', 'warehouse', 'issuance', 'grn', 'vendors', 'audit', 'admin'],
    defaultTab: 'dashboard',
    badgeBg: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60',
    canManageUsers: true,
    canEditSettings: true
  },
  warehouse_supervisor: {
    role: 'warehouse_supervisor',
    title: 'Warehouse & Stores Lead',
    shortTitle: 'Warehouse Only',
    scopeBadge: 'Warehouse & Stores Modules Only',
    description: 'Dedicated warehouse store operations: Stock inventory, inward goods receipt notes (GRN), outward stock issuance, returnable gate passes (RGP/NRGP), and inventory movement logs.',
    allowedTabs: ['warehouse', 'issuance', 'grn', 'audit'],
    defaultTab: 'warehouse',
    badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
    canManageUsers: false,
    canEditSettings: false
  },
  procurement_manager: {
    role: 'procurement_manager',
    title: 'Procurement & Sourcing Manager',
    shortTitle: 'Procurement Only',
    scopeBadge: 'Procurement & Sourcing Modules Only',
    description: 'Dedicated procurement & sourcing operations: Purchase requisitions (PR), PO creation & authorization, vendor commercial directory, and inward delivery tracking.',
    allowedTabs: ['procurement', 'vendors', 'grn'],
    defaultTab: 'procurement',
    badgeBg: 'bg-sky-950/80 text-sky-300 border-sky-700/60',
    canManageUsers: false,
    canEditSettings: false
  },
  qc_officer: {
    role: 'qc_officer',
    title: 'Inward Quality Inspector',
    shortTitle: 'QC & Inspection Only',
    scopeBadge: 'Quality & Inward Inspection Only',
    description: 'Inward goods receipt inspection, physical specification testing, QC acceptance/rejection vouchers, and store location allocation.',
    allowedTabs: ['grn', 'warehouse'],
    defaultTab: 'grn',
    badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
    canManageUsers: false,
    canEditSettings: false
  },
  auditor: {
    role: 'auditor',
    title: 'Internal Audit & Compliance Officer',
    shortTitle: 'Auditor (Audit Oversight)',
    scopeBadge: 'Full Operational Audit Oversight',
    description: 'Enterprise movement logs, stock ledger verification, financial valuation, and gate pass register compliance.',
    allowedTabs: ['dashboard', 'audit', 'warehouse', 'procurement', 'issuance', 'grn', 'vendors'],
    defaultTab: 'audit',
    badgeBg: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
    canManageUsers: false,
    canEditSettings: false
  }
};

export const getRoleConfig = (role?: UserRole): RoleConfig => {
  if (!role || !ROLE_CONFIGS[role]) {
    return ROLE_CONFIGS.admin;
  }
  return ROLE_CONFIGS[role];
};

export const isTabAllowed = (role: UserRole | undefined, tab: TabType): boolean => {
  const config = getRoleConfig(role);
  return config.allowedTabs.includes(tab);
};

export const getDefaultTabForRole = (role: UserRole | undefined): TabType => {
  const config = getRoleConfig(role);
  return config.defaultTab;
};
