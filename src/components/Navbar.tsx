import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Warehouse,
  PackageCheck,
  Building2,
  ClipboardList,
  AlertTriangle,
  RotateCcw,
  Download,
  ShieldCheck,
  LogOut,
  ChevronDown,
  User,
  Sparkles,
  Sun,
  Moon,
  FileSpreadsheet,
  FileText,
  Truck
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { exportToCSV } from '../utils/formatters';
import {
  exportInventoryToExcel,
  exportInventoryToPDF,
  exportGatePassRegisterToExcel,
  exportGatePassRegisterToPDF
} from '../utils/exportUtils';

export type TabType = 'dashboard' | 'procurement' | 'warehouse' | 'issuance' | 'grn' | 'vendors' | 'audit' | 'admin';

interface NavbarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const { items, purchaseRequisitions, purchaseOrders, gatePasses, resetToDemoData } = useWarehouse();
  const { currentUser, users, logout, switchUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const lowStockCount = items.filter(i => i.status === 'low_stock' || i.status === 'out_of_stock').length;
  const pendingPRCount = purchaseRequisitions.filter(pr => pr.status === 'pending').length;
  const activePOCount = purchaseOrders.filter(po => po.status === 'issued' || po.status === 'partially_received').length;
  const activeRGPCount = gatePasses.filter(gp => gp.passType === 'returnable' && gp.status !== 'returned').length;

  const handleExportFullReport = () => {
    const stockReport = items.map(item => ({
      SKU: item.sku,
      Name: item.name,
      Category: item.category,
      Unit: item.unit,
      QuantityOnHand: item.quantityOnHand,
      ReorderLevel: item.reorderLevel,
      UnitCost: item.unitCost,
      Valuation: item.quantityOnHand * item.unitCost,
      Zone: item.warehouseZone,
      Aisle: item.aisle,
      Bin: item.bin,
      Status: item.status
    }));
    exportToCSV(`Warehouse_Inventory_${new Date().toISOString().split('T')[0]}`, stockReport);
  };

  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard & KPIs', icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      id: 'procurement',
      label: 'Procurement (PR / PO)',
      icon: <ShoppingCart className="w-4 h-4" />,
      badge: pendingPRCount,
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'warehouse',
      label: 'Warehouse & Stock',
      icon: <Warehouse className="w-4 h-4" />,
      badge: lowStockCount,
      badgeColor: 'bg-rose-100 text-rose-800'
    },
    {
      id: 'issuance',
      label: 'Issuance & Gate Pass',
      icon: <Truck className="w-4 h-4" />,
      badge: activeRGPCount > 0 ? activeRGPCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'grn',
      label: 'Goods Receipt (GRN)',
      icon: <PackageCheck className="w-4 h-4" />,
      badge: activePOCount,
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    { id: 'vendors', label: 'Vendor Directory', icon: <Building2 className="w-4 h-4" /> },
    { id: 'audit', label: 'Movement & Audit', icon: <ClipboardList className="w-4 h-4" /> },
    {
      id: 'admin',
      label: 'Admin Portal',
      icon: <ShieldCheck className="w-4 h-4" />,
      badgeColor: 'bg-indigo-100 text-indigo-800'
    }
  ];

  const roleLabel =
    currentUser?.role === 'admin'
      ? 'Admin'
      : currentUser?.role === 'warehouse_supervisor'
      ? 'WH Lead'
      : currentUser?.role === 'procurement_manager'
      ? 'Procurement'
      : currentUser?.role === 'qc_officer'
      ? 'QC Officer'
      : 'Auditor';

  return (
    <header className="bg-slate-950/90 border-b border-slate-800/80 sticky top-0 z-30 text-white backdrop-blur-md">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
            <div className="w-11 h-11 rounded-xl bg-white p-0.5 flex items-center justify-center shadow-lg shadow-sky-500/20 border border-sky-500/30 overflow-hidden shrink-0">
              <img
                src="/kts-logo.png"
                alt="Karachi Transport Service (KTS) Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback to text initials if image fails
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<span class="text-blue-900 font-black text-sm tracking-tighter">KTS</span>';
                }}
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                  Karachi Transport Service
                </span>
                <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-sky-950/80 text-sky-400 font-semibold border border-sky-800/60 hidden sm:inline-block">
                  Procurement & Warehouse
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <span>Fleet Depot & Central Logistics</span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="text-emerald-400 text-[11px] hidden sm:inline flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  Cloud SQL Online
                </span>
              </p>
            </div>
          </div>

          {/* Quick Stat Badges & Actions */}
          <div className="flex items-center space-x-2.5">
            <div className="hidden lg:flex items-center bg-slate-900 border border-slate-800 rounded-full px-3.5 py-1.5 text-xs text-slate-300 gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span>Systems Live: WH-01, WH-02</span>
            </div>

            {lowStockCount > 0 && (
              <button
                onClick={() => onSelectTab('warehouse')}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs font-medium hover:bg-rose-900/60 transition-colors cursor-pointer"
                title="Items needing reorder"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>{lowStockCount} Low Stock</span>
              </button>
            )}

            {/* Export Hub Dropdown */}
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-slate-800 transition-colors cursor-pointer"
                title="Download inventory and reports in Excel, PDF, or CSV"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden md:inline font-medium">Export</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isExportMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 text-xs z-50 animate-in fade-in">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Warehouse Reports
                  </div>
                  <button
                    onClick={() => {
                      exportInventoryToExcel(items);
                      setIsExportMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-semibold">Stock Ledger (.xlsx)</div>
                      <div className="text-[10px] text-slate-400">Excel spreadsheet report</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      exportInventoryToPDF(items);
                      setIsExportMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-rose-400" />
                    <div>
                      <div className="font-semibold">Stock Ledger (.pdf)</div>
                      <div className="text-[10px] text-slate-400">Print-ready PDF report</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      exportGatePassRegisterToExcel(gatePasses);
                      setIsExportMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left cursor-pointer"
                  >
                    <Truck className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-semibold">Gate Pass Register (.xlsx)</div>
                      <div className="text-[10px] text-slate-400">RGP & NRGP issuance ledger</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      exportGatePassRegisterToPDF(gatePasses);
                      setIsExportMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <div>
                      <div className="font-semibold">Gate Pass Register (.pdf)</div>
                      <div className="text-[10px] text-slate-400">Security gate dispatch log</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      handleExportFullReport();
                      setIsExportMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-indigo-400" />
                    <div>
                      <div className="font-semibold">CSV Raw Export</div>
                      <div className="text-[10px] text-slate-400">Comma-separated values</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer text-xs"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden lg:inline text-slate-300 font-medium">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden lg:inline text-slate-700 font-medium">Dark</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                if (confirm('Reset system data back to default demo state? Any local edits will be refreshed.')) {
                  resetToDemoData();
                }
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
              title="Reset Demo Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Logged in User Profile Chip & Dropdown */}
            {currentUser && (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs text-white uppercase shadow-sm">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-semibold text-white leading-tight flex items-center space-x-1">
                      <span>{currentUser.name.split(' ')[0]}</span>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                        {roleLabel}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Popover */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 text-xs z-50 animate-in fade-in zoom-in-95">
                    {/* User Info Header */}
                    <div className="pb-3 border-b border-slate-800 flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-sm text-white uppercase">
                        {currentUser.name.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-white truncate">{currentUser.name}</div>
                        <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                        <div className="text-[10px] text-indigo-400 mt-0.5">{currentUser.department}</div>
                      </div>
                    </div>

                    {/* Quick Access to Admin */}
                    <div className="py-2.5 border-b border-slate-800">
                      <button
                        onClick={() => {
                          onSelectTab('admin');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-indigo-400" />
                        <span className="font-semibold">Open Admin Portal</span>
                      </button>
                    </div>

                    {/* Quick Role Switcher */}
                    <div className="py-2.5 border-b border-slate-800">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        <span>Quick Switch Persona (Demo)</span>
                      </div>
                      <div className="space-y-1">
                        {users.map(u => (
                          <button
                            key={u.id}
                            onClick={() => {
                              switchUser(u.id);
                              setIsUserMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] transition-colors cursor-pointer ${
                              currentUser.id === u.id
                                ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-800/60 font-semibold'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                          >
                            <span className="truncate">{u.name}</span>
                            <span className="text-[9px] uppercase px-1 rounded bg-slate-800 text-slate-400">
                              {u.role === 'admin' ? 'Admin' : u.role === 'warehouse_supervisor' ? 'WH' : u.role === 'procurement_manager' ? 'Proc' : u.role === 'qc_officer' ? 'QC' : 'Audit'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Logout */}
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-xl text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors cursor-pointer font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out / Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <div className="border-t border-slate-800/80 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1.5 sm:space-x-2 overflow-x-auto py-2 no-scrollbar" aria-label="Tabs">
            {navItems.map(tab => {
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 font-semibold'
                      : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white text-indigo-700' : 'bg-slate-800 text-slate-300 border border-slate-700/50'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
