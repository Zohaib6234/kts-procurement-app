import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  Warehouse,
  CheckCircle2,
  Package,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ExternalLink
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useWarehouse } from '../context/WarehouseContext';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { TabType } from './Navbar';

interface DashboardViewProps {
  onNavigate: (tab: TabType) => void;
  onOpenPRModal?: () => void;
}

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { items, purchaseOrders, purchaseRequisitions, goodsReceiptNotes, zones, vendors } = useWarehouse();

  // Metrics
  const totalValuation = items.reduce((acc, item) => acc + item.quantityOnHand * item.unitCost, 0);
  const lowStockItems = items.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock');
  const activePOs = purchaseOrders.filter(po => po.status === 'issued' || po.status === 'partially_received');
  const pendingPOSpend = activePOs.reduce((acc, po) => acc + po.grandTotal, 0);
  const pendingPRs = purchaseRequisitions.filter(pr => pr.status === 'pending');

  const totalWarehouseCapacity = zones.reduce((acc, z) => acc + z.capacityUnits, 0);
  const totalWarehouseUsed = zones.reduce((acc, z) => acc + z.usedUnits, 0);
  const warehouseOccupancyPct = Math.round((totalWarehouseUsed / totalWarehouseCapacity) * 100);

  // Category breakdown for chart
  const categoryMap: Record<string, { value: number; count: number }> = {};
  items.forEach(item => {
    if (!categoryMap[item.category]) {
      categoryMap[item.category] = { value: 0, count: 0 };
    }
    categoryMap[item.category].value += item.quantityOnHand * item.unitCost;
    categoryMap[item.category].count += 1;
  });

  const categoryChartData = Object.keys(categoryMap).map(cat => ({
    name: cat,
    value: categoryMap[cat].value,
    count: categoryMap[cat].count
  }));

  // Zone utilization data
  const zoneChartData = zones.map(z => ({
    name: z.code,
    fullName: z.name,
    used: z.usedUnits,
    available: z.capacityUnits - z.usedUnits,
    percentage: Math.round((z.usedUnits / z.capacityUnits) * 100)
  }));

  // Average vendor quality
  const avgVendorRating = (vendors.reduce((acc, v) => acc + v.rating, 0) / vendors.length).toFixed(1);
  const avgVendorOTD = Math.round(vendors.reduce((acc, v) => acc + v.onTimeDeliveryRate, 0) / vendors.length);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & KPI Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Operations Dashboard</h1>
          <p className="text-xs text-slate-400">
            Real-time telemetry across Procurement Pipeline, Stock Levels, and Receiving Bay.
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => onNavigate('procurement')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Manage Procurement</span>
          </button>
          <button
            onClick={() => onNavigate('grn')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 transition-all cursor-pointer"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Process Inward GRN</span>
          </button>
        </div>
      </div>

      {/* Primary Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bento Tile 1: Stock Distribution (2 cols) */}
        <div className="col-span-1 md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-base font-semibold text-white">Stock Distribution & Valuation</h2>
                <p className="text-xs text-slate-400 mt-0.5">Live inventory allocation by category weight</p>
              </div>
              <span className="text-xs font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded-md">
                LIVE_REFRESH
              </span>
            </div>

            <div className="space-y-4">
              {categoryChartData.slice(0, 3).map((cat, idx) => {
                const pct = totalValuation > 0 ? Math.round((cat.value / totalValuation) * 100) : 0;
                const colors = ['bg-indigo-500', 'bg-amber-500', 'bg-emerald-500'];
                return (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">{cat.name}</span>
                      <span className="text-slate-400 font-mono">
                        {pct}% ({formatCurrency(cat.value)})
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`${colors[idx % colors.length]} h-2.5 rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(100, Math.max(8, pct))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Total SKUs</p>
              <p className="text-2xl font-bold text-white mt-0.5">{items.length}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Inventory Value</p>
              <p className="text-2xl font-bold text-indigo-300 mt-0.5 truncate">{formatCurrency(totalValuation)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Occupancy</p>
              <p className="text-2xl font-bold text-emerald-400 mt-0.5">{warehouseOccupancyPct}%</p>
            </div>
          </div>
        </div>

        {/* Bento Tile 2: Pending POs */}
        <div
          onClick={() => onNavigate('procurement')}
          className="col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-widest">Pending POs</h3>
            <span className="p-1.5 rounded-lg bg-slate-800 text-indigo-400">
              <ShoppingCart className="w-4 h-4" />
            </span>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-white">{activePOs.length}</span>
              <span className="text-emerald-400 text-xs font-semibold">+{pendingPRs.length} PRs active</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Committed: <span className="text-slate-200 font-semibold">{formatCurrency(pendingPOSpend)}</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span>Awaiting HOD / Receiving</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Bento Tile 3: Low Stock */}
        <div
          onClick={() => onNavigate('warehouse')}
          className="col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-rose-900/60 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-widest">Low Stock</h3>
            <span className="p-1.5 rounded-lg bg-rose-950/60 text-rose-400 border border-rose-800/50">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-rose-500">{String(lowStockItems.length).padStart(2, '0')}</span>
              <span className="text-slate-400 text-xs underline hover:text-slate-200">View all</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">Critical items below buffer threshold</div>
          </div>
          <div className="text-[11px] text-rose-400/80 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span>Requires urgent replenishment</span>
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
          </div>
        </div>

        {/* Bento Tile 4: Warehouse Report Promo Card */}
        <div className="col-span-1 md:col-span-2 bg-indigo-600 rounded-2xl p-6 text-white flex flex-col justify-between shadow-xl shadow-indigo-900/20">
          <div>
            <div className="flex items-center space-x-2 text-indigo-200 text-xs font-medium uppercase tracking-wider mb-1">
              <Package className="w-3.5 h-3.5" />
              <span>Procurement Automation Suite</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">Warehouse Logistics Report</h2>
            <p className="text-indigo-100 text-xs mt-1.5 max-w-md">
              Review real-time vendor fulfillment rates, generate purchase orders, and monitor multi-bay utilization across WH-01 and WH-02.
            </p>
          </div>
          <div className="mt-5 flex items-center space-x-3">
            <button
              onClick={() => onNavigate('procurement')}
              className="bg-white text-indigo-600 font-bold py-2 px-4 rounded-xl text-xs self-start hover:bg-indigo-50 transition-colors shadow-sm cursor-pointer"
            >
              Issue Purchase Order
            </button>
            <button
              onClick={() => onNavigate('audit')}
              className="bg-indigo-700/60 hover:bg-indigo-700 text-white font-medium py-2 px-3.5 rounded-xl text-xs transition-colors border border-indigo-400/30 cursor-pointer"
            >
              View Audit Ledger
            </button>
          </div>
        </div>

        {/* Bento Tile 5: Warehouse Bay Occupancy Meter */}
        <div
          onClick={() => onNavigate('warehouse')}
          className="col-span-1 md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between cursor-pointer hover:border-slate-700 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Warehouse Bay Space Occupancy</h3>
              <p className="text-xs text-slate-400">Total volume allocated across storage zones</p>
            </div>
            <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 rounded">
              {warehouseOccupancyPct}% CAPACITY
            </span>
          </div>

          <div className="space-y-3">
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-amber-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${warehouseOccupancyPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>{formatNumber(totalWarehouseUsed)} Units Used</span>
              <span>{formatNumber(totalWarehouseCapacity - totalWarehouseUsed)} Units Free</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>4 Primary Storage Bays Active</span>
            <span className="text-indigo-400 font-medium">Inspect Bay Slots →</span>
          </div>
        </div>
      </div>

      {/* Visual Charts Bento Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Value by Category Bar Chart */}
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white text-sm">Stock Valuation by Category</h3>
              <p className="text-xs text-slate-400">Total capital invested across item classifications</p>
            </div>
            <span className="text-xs font-semibold text-indigo-400 bg-indigo-950/60 border border-indigo-800/50 px-2.5 py-1 rounded-lg font-mono">
              REAL-TIME
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} angle={-15} textAnchor="end" />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={val => `₨${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Valuation']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: '1px solid #334155',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Warehouse Zone Capacity Distribution */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white text-sm">Zone Space Utilization</h3>
                <p className="text-xs text-slate-400">Volume distribution by dedicated bay</p>
              </div>
              <Warehouse className="w-4 h-4 text-slate-400" />
            </div>
            <div className="space-y-3.5">
              {zones.map(z => {
                const pct = Math.round((z.usedUnits / z.capacityUnits) * 100);
                return (
                  <div key={z.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-300">{z.name} ({z.code})</span>
                      <span className="font-mono font-semibold text-slate-200">{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full ${
                          pct > 85 ? 'bg-rose-500' : pct > 65 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Average Bay Fill Rate</span>
            <span className="font-mono font-semibold text-slate-200">{warehouseOccupancyPct}% Capacity</span>
          </div>
        </div>
      </div>

      {/* Operational Bento Cards: Low Stock Warning + Active POs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Stock Level Actions */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h3 className="font-semibold text-white text-sm">Urgent Reorder Checklist</h3>
            </div>
            <button
              onClick={() => onNavigate('procurement')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center cursor-pointer"
            >
              <span>Create PR</span>
              <ExternalLink className="w-3 h-3 ml-1" />
            </button>
          </div>

          <div className="divide-y divide-slate-800">
            {lowStockItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                All item inventories are currently above safety stock thresholds!
              </div>
            ) : (
              lowStockItems.slice(0, 4).map(item => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-300">{item.sku}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          item.quantityOnHand === 0
                            ? 'bg-rose-950 text-rose-300 border border-rose-800/50'
                            : 'bg-amber-950 text-amber-300 border border-amber-800/50'
                        }`}
                      >
                        {item.quantityOnHand === 0 ? 'Out of Stock' : 'Low Stock'}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-200 mt-0.5">{item.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Bay: {item.warehouseZone} (Bin {item.bin}) • Cost: {formatCurrency(item.unitCost)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-white">
                      {formatNumber(item.quantityOnHand)} <span className="text-slate-400 font-normal">{item.unit}</span>
                    </div>
                    <div className="text-[11px] text-rose-400 font-medium mt-0.5">
                      Buffer: {formatNumber(item.reorderLevel)} {item.unit}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expected Inward Consignments */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <h3 className="font-semibold text-white text-sm">Active Purchase Orders (In Transit)</h3>
            </div>
            <button
              onClick={() => onNavigate('grn')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center cursor-pointer"
            >
              <span>Receive in GRN</span>
              <ExternalLink className="w-3 h-3 ml-1" />
            </button>
          </div>

          <div className="divide-y divide-slate-800">
            {activePOs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No active purchase orders currently pending delivery.
              </div>
            ) : (
              activePOs.slice(0, 4).map(po => (
                <div key={po.id} className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-indigo-400">{po.poNumber}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          po.status === 'partially_received'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800/50'
                            : 'bg-indigo-950 text-indigo-300 border border-indigo-800/50'
                        }`}
                      >
                        {po.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-200 mt-0.5">{po.vendorName}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      ETA: {po.expectedDeliveryDate} • {po.items.length} line item(s)
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-white">{formatCurrency(po.grandTotal)}</div>
                    <button
                      onClick={() => onNavigate('grn')}
                      className="mt-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                    >
                      Process Receipt
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Supplier Performance Bento Snapshot */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h3 className="font-semibold text-white text-sm">Key Vendor Performance Scorecards</h3>
            <p className="text-xs text-slate-400">Real-time fulfillment, quality compliance, and dispatch reliability</p>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">Average Rating:</span>
              <span className="font-bold text-amber-400">★ {avgVendorRating} / 5.0</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">Overall OTD:</span>
              <span className="font-bold text-emerald-400">{avgVendorOTD}% On-Time</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {vendors.map(v => (
            <div
              key={v.id}
              className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/50 hover:bg-slate-800/60 hover:border-slate-700 transition-all cursor-pointer"
              onClick={() => onNavigate('vendors')}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold text-indigo-400">{v.code}</span>
                <span className="text-xs font-bold text-amber-400">★ {v.rating.toFixed(1)}</span>
              </div>
              <div className="text-xs font-bold text-white mt-1.5 truncate" title={v.name}>
                {v.name}
              </div>
              <div className="mt-2.5 space-y-1 text-[11px] text-slate-400">
                <div className="flex justify-between">
                  <span>OTD Rate:</span>
                  <span className="font-semibold text-slate-200">{v.onTimeDeliveryRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Quality Pass:</span>
                  <span className="font-semibold text-emerald-400">{v.qualityRating}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Lead Time:</span>
                  <span className="font-semibold text-slate-200">{v.leadTimeDays}d</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
