import React, { useState } from 'react';
import { WarehouseProvider } from './context/WarehouseContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar, TabType } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ProcurementView } from './components/ProcurementView';
import { WarehouseView } from './components/WarehouseView';
import { IssuanceView } from './components/IssuanceView';
import { GRNView } from './components/GRNView';
import { VendorView } from './components/VendorView';
import { AuditLogsView } from './components/AuditLogsView';
import { AdminView } from './components/AdminView';
import { LoginView } from './components/LoginView';

const MainApp: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [grnSelectedPOId, setGrnSelectedPOId] = useState<string | null>(null);
  const [issuanceItemId, setIssuanceItemId] = useState<string | null>(null);

  // If not authenticated, present the professional login screen
  if (!currentUser) {
    return <LoginView />;
  }

  const handleNavigateToGRNWithPO = (poId: string) => {
    setGrnSelectedPOId(poId);
    setCurrentTab('grn');
  };

  const handleNavigateToIssuance = (itemId?: string) => {
    setIssuanceItemId(itemId || null);
    setCurrentTab('issuance');
  };

  const handleSelectTab = (tab: TabType) => {
    if (tab !== 'grn') {
      setGrnSelectedPOId(null);
    }
    if (tab !== 'issuance') {
      setIssuanceItemId(null);
    }
    setCurrentTab(tab);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-600 selection:text-white">
      <Navbar currentTab={currentTab} onSelectTab={handleSelectTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {currentTab === 'dashboard' && <DashboardView onNavigate={handleSelectTab} />}
        {currentTab === 'procurement' && (
          <ProcurementView onNavigateToGRNWithPO={handleNavigateToGRNWithPO} />
        )}
        {currentTab === 'warehouse' && (
          <WarehouseView onNavigateToIssuance={handleNavigateToIssuance} />
        )}
        {currentTab === 'issuance' && (
          <IssuanceView preSelectedItemId={issuanceItemId} />
        )}
        {currentTab === 'grn' && <GRNView initialSelectedPOId={grnSelectedPOId} />}
        {currentTab === 'vendors' && <VendorView />}
        {currentTab === 'audit' && <AuditLogsView />}
        {currentTab === 'admin' && <AdminView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-5 text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-200">ProWarehouse ERP</span>
            <span className="text-slate-500">• Bento Grid Operating Suite</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-400 text-[11px]">
            <span className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              <span>RBAC Security Active</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Automated Reorder Engine</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Persistent Stock Ledger</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WarehouseProvider>
          <MainApp />
        </WarehouseProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

