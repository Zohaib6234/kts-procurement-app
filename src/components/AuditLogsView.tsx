import React, { useState } from 'react';
import {
  ClipboardList,
  Search,
  Filter,
  Download,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { MovementType, StockMovement } from '../types';
import { formatNumber, exportToCSV } from '../utils/formatters';

export const AuditLogsView: React.FC = () => {
  const { movements } = useWarehouse();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredMovements = movements.filter(mov => {
    const matchesSearch =
      mov.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mov.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mov.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mov.performedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mov.reason.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || mov.movementType === typeFilter;

    return matchesSearch && matchesType;
  });

  const handleExportCSV = () => {
    const rows = filteredMovements.map(m => ({
      Timestamp: m.date,
      Type: m.movementType.toUpperCase(),
      SKU: m.sku,
      ItemName: m.itemName,
      QuantityDelta: m.quantity,
      FromLocation: m.fromLocation || '',
      ToLocation: m.toLocation || '',
      Reference: m.referenceNumber,
      PerformedBy: m.performedBy,
      Reason: m.reason
    }));

    exportToCSV(`Warehouse_Stock_Ledger_${new Date().toISOString().split('T')[0]}`, rows);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Movement & Stock Audit Ledger</h1>
          <p className="text-xs text-slate-400">
            Immutable tracking of all receipts, department dispatches, bin transfers, and cycle count adjustments.
          </p>
        </div>
        <div>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Audit Trail (CSV)</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference, SKU, item, auditor..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-800 text-xs bg-slate-800/70 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-800 text-xs bg-slate-800/70 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Movement Types</option>
            <option value="receipt">Goods Receipt (Inward)</option>
            <option value="issue">Material Issue (Outward)</option>
            <option value="transfer">Bin/Zone Transfer</option>
            <option value="adjustment">Cycle Count Adjustment</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Showing <span className="font-bold text-white">{filteredMovements.length}</span> Log Entries
        </span>
      </div>

      {/* Movement Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">SKU & Item Name</th>
                <th className="py-3 px-4 text-right">Quantity Delta</th>
                <th className="py-3 px-4">Location Route</th>
                <th className="py-3 px-4">Reference #</th>
                <th className="py-3 px-4">Executed By</th>
                <th className="py-3 px-4">Operation Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No movement records matching criteria.
                  </td>
                </tr>
              ) : (
                filteredMovements.map(mov => {
                  const isPositive = mov.quantity > 0;
                  const isNegative = mov.quantity < 0;

                  const typeColor =
                    mov.movementType === 'receipt'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
                      : mov.movementType === 'issue'
                      ? 'bg-blue-950 text-blue-300 border-blue-800/60'
                      : mov.movementType === 'transfer'
                      ? 'bg-purple-950 text-purple-300 border-purple-800/60'
                      : 'bg-amber-950 text-amber-300 border-amber-800/60';

                  return (
                    <tr key={mov.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-mono whitespace-nowrap">{mov.date}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${typeColor}`}>
                          {mov.movementType}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-white">{mov.sku}</span>
                        <div className="text-slate-400 text-[11px] truncate max-w-xs">{mov.itemName}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-sm whitespace-nowrap">
                        <span className={isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-slate-300'}>
                          {isPositive ? `+${formatNumber(mov.quantity)}` : formatNumber(mov.quantity)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-[11px]">
                        {mov.fromLocation && (
                          <div>
                            <span className="text-slate-500">From: </span>
                            {mov.fromLocation}
                          </div>
                        )}
                        {mov.toLocation && (
                          <div>
                            <span className="text-slate-500">To: </span>
                            {mov.toLocation}
                          </div>
                        )}
                        {!mov.fromLocation && !mov.toLocation && <span className="text-slate-500">—</span>}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-indigo-400 whitespace-nowrap">
                        {mov.referenceNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-200 whitespace-nowrap">{mov.performedBy}</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px] max-w-xs">{mov.reason}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
