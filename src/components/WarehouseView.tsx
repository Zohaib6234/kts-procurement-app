import React, { useState } from 'react';
import {
  Warehouse,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Send,
  SlidersHorizontal,
  Download,
  AlertTriangle,
  CheckCircle2,
  Boxes,
  MapPin,
  Pencil,
  Trash2,
  FileSpreadsheet,
  FileText,
  Building2,
  Truck
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { InventoryItem, StockStatus } from '../types';
import { formatCurrency, formatNumber, exportToCSV } from '../utils/formatters';
import { EditItemModal } from './EditItemModal';
import { exportInventoryToExcel, exportInventoryToPDF } from '../utils/exportUtils';

interface WarehouseViewProps {
  onNavigateToIssuance?: (itemId?: string) => void;
}

export const WarehouseView: React.FC<WarehouseViewProps> = ({ onNavigateToIssuance }) => {
  const {
    items,
    zones,
    vendors,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    issueMaterial,
    adjustStock
  } = useWarehouse();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals state
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<InventoryItem | null>(null);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedItemForAction, setSelectedItemForAction] = useState<InventoryItem | null>(null);

  // New Item Form State
  const [newItemSku, setNewItemSku] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemVendorId, setNewItemVendorId] = useState(vendors[0]?.id || '');
  const [newItemCategory, setNewItemCategory] = useState('Raw Materials');
  const [newItemUnit, setNewItemUnit] = useState('Pieces');
  const [newItemQty, setNewItemQty] = useState(100);
  const [newItemReorder, setNewItemReorder] = useState(50);
  const [newItemSafety, setNewItemSafety] = useState(20);
  const [newItemCost, setNewItemCost] = useState(1500);
  const [newItemZone, setNewItemZone] = useState('Z-RAW');
  const [newItemAisle, setNewItemAisle] = useState('A-01');
  const [newItemShelf, setNewItemShelf] = useState('S-01');
  const [newItemBin, setNewItemBin] = useState('B-01');

  // Issue Form State
  const [issueQty, setIssueQty] = useState(1);
  const [issueTarget, setIssueTarget] = useState('Production Line 1 - Fabrication');
  const [issueReason, setIssueReason] = useState('Daily production batch release');
  const [issueUser, setIssueUser] = useState('Kashif Mehmood (Storekeeper)');
  const [issueError, setIssueError] = useState('');

  // Adjust Form State
  const [adjustNewQty, setAdjustNewQty] = useState(0);
  const [adjustReason, setAdjustReason] = useState('Monthly physical cycle count discrepancy');
  const [adjustUser, setAdjustUser] = useState('Zahid Ali (Internal Auditor)');

  // Categories list
  const categories = Array.from(new Set(items.map(i => i.category)));

  // Filtered Items
  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.vendorName && item.vendorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.bin.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesZone = selectedZone === 'all' || item.warehouseZone === selectedZone;
    const matchesVendor = selectedVendor === 'all' || item.vendorId === selectedVendor;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesZone && matchesVendor && matchesStatus;
  });

  // Handle Add Item
  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedVendor = vendors.find(v => v.id === newItemVendorId);

    addInventoryItem({
      sku: newItemSku.toUpperCase(),
      name: newItemName,
      category: newItemCategory,
      unit: newItemUnit,
      vendorId: assignedVendor?.id,
      vendorName: assignedVendor?.name,
      quantityOnHand: Number(newItemQty),
      reservedQuantity: 0,
      reorderLevel: Number(newItemReorder),
      safetyStock: Number(newItemSafety),
      unitCost: Number(newItemCost),
      warehouseZone: newItemZone,
      aisle: newItemAisle,
      shelf: newItemShelf,
      bin: newItemBin
    });

    setIsAddItemModalOpen(false);
    // Reset form
    setNewItemSku('');
    setNewItemName('');
  };

  // Open Issue Modal
  const handleOpenIssue = (item: InventoryItem) => {
    setSelectedItemForAction(item);
    setIssueQty(1);
    setIssueError('');
    setIsIssueModalOpen(true);
  };

  const handleConfirmIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForAction) return;

    if (issueQty > selectedItemForAction.quantityOnHand) {
      setIssueError(`Cannot issue ${issueQty} units. Only ${selectedItemForAction.quantityOnHand} available on hand.`);
      return;
    }

    const success = issueMaterial(
      selectedItemForAction.id,
      issueQty,
      issueTarget,
      issueReason,
      issueUser
    );

    if (success) {
      setIsIssueModalOpen(false);
      setSelectedItemForAction(null);
    }
  };

  // Open Adjust Modal
  const handleOpenAdjust = (item: InventoryItem) => {
    setSelectedItemForAction(item);
    setAdjustNewQty(item.quantityOnHand);
    setIsAdjustModalOpen(true);
  };

  const handleConfirmAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForAction) return;

    adjustStock(selectedItemForAction.id, Number(adjustNewQty), adjustReason, adjustUser);
    setIsAdjustModalOpen(false);
    setSelectedItemForAction(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Warehouse & Stock Control</h1>
          <p className="text-xs text-slate-400">
            Real-time stock on hand, bin slotting locations, department material issue, and cycle audit reconciliations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportInventoryToExcel(filteredItems)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-all cursor-pointer"
            title="Export Stock Ledger to Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
          <button
            onClick={() => exportInventoryToPDF(filteredItems)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-all cursor-pointer"
            title="Export Stock Valuation to PDF"
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
          {onNavigateToIssuance && (
            <button
              onClick={() => onNavigateToIssuance()}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 hover:text-white text-xs font-semibold border border-amber-500/40 transition-all cursor-pointer shadow-xs"
              title="Issue stock with printable Gate Pass"
            >
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Issue & Gate Pass</span>
            </button>
          )}
          <button
            onClick={() => setIsAddItemModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item Master</span>
          </button>
        </div>
      </div>

      {/* Warehouse Bays & Zones Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {zones.map(zone => {
          const usedPct = Math.round((zone.usedUnits / zone.capacityUnits) * 100);
          const isSelected = selectedZone === zone.code;

          return (
            <div
              key={zone.id}
              onClick={() => setSelectedZone(isSelected ? 'all' : zone.code)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-950/40 shadow-md ring-1 ring-indigo-500/50'
                  : 'border-slate-800 bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-white">{zone.code}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    usedPct > 80
                      ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {usedPct}%
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-200 mt-1 truncate">{zone.name}</div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${
                    usedPct > 80 ? 'bg-rose-500' : usedPct > 60 ? 'bg-amber-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${usedPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
                <span>Used: {formatNumber(zone.usedUnits)}</span>
                <span>Cap: {formatNumber(zone.capacityUnits)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by SKU, item name, vendor..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-800 text-xs bg-slate-800/70 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={selectedVendor}
            onChange={e => setSelectedVendor(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-800 text-xs bg-slate-800/70 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Vendors / Suppliers</option>
            {vendors.map(v => (
              <option key={v.id} value={v.id}>
                {v.code} - {v.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-800 text-xs bg-slate-800/70 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={selectedZone}
            onChange={e => setSelectedZone(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-800 text-xs bg-slate-800/70 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Zones</option>
            {zones.map(z => (
              <option key={z.id} value={z.code}>
                {z.code} - {z.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-800 text-xs bg-slate-800/70 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Stock Statuses</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock (Reorder)</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="overstocked">Overstocked</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="font-bold text-white">{filteredItems.length}</span> of {items.length} SKUs
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">SKU & Item Details</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">On Hand Qty</th>
                <th className="py-3 px-4 text-right">Safety / Reorder</th>
                <th className="py-3 px-4 text-right">Unit Cost</th>
                <th className="py-3 px-4 text-right">Total Valuation</th>
                <th className="py-3 px-4">Warehouse Slot</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    No inventory items found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const statusBadge =
                    item.status === 'out_of_stock'
                      ? 'bg-rose-950 text-rose-300 border-rose-800/60'
                      : item.status === 'low_stock'
                      ? 'bg-amber-950 text-amber-300 border-amber-800/60'
                      : item.status === 'overstocked'
                      ? 'bg-purple-950 text-purple-300 border-purple-800/60'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-800/60';

                  const valuation = item.quantityOnHand * item.unitCost;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-indigo-400">{item.sku}</div>
                        <div className="text-xs font-medium text-slate-200 mt-0.5 max-w-xs">{item.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs font-medium text-slate-300">
                          {item.vendorName || 'Unassigned'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700/60">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-bold text-sm text-white">{formatNumber(item.quantityOnHand)}</div>
                        <div className="text-[10px] text-slate-400">{item.unit}</div>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400">
                        <div>Min: {formatNumber(item.reorderLevel)}</div>
                        <div className="text-[10px] text-slate-500">Safe: {formatNumber(item.safetyStock)}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-300">
                        {formatCurrency(item.unitCost)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-white">
                        {formatCurrency(valuation)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1 font-mono text-[11px] font-medium text-indigo-400">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>
                            {item.warehouseZone} • {item.bin}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Aisle {item.aisle} • Shelf {item.shelf}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${statusBadge}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {onNavigateToIssuance && (
                          <button
                            onClick={() => onNavigateToIssuance(item.id)}
                            disabled={item.quantityOnHand <= 0}
                            className="px-2 py-1 rounded-lg bg-amber-950/70 hover:bg-amber-900 text-amber-300 font-semibold text-xs inline-flex items-center space-x-1 cursor-pointer disabled:opacity-40 transition-colors border border-amber-800/60 shadow-xs"
                            title="Issue with official printable Gate Pass"
                          >
                            <Truck className="w-3 h-3" />
                            <span>Gate Pass</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenIssue(item)}
                          disabled={item.quantityOnHand <= 0}
                          className="px-2 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 font-semibold text-xs inline-flex items-center space-x-1 cursor-pointer disabled:opacity-40 transition-colors border border-indigo-800/60 shadow-xs"
                          title="Issue material to production or department"
                        >
                          <Send className="w-3 h-3" />
                          <span>Issue</span>
                        </button>
                        <button
                          onClick={() => handleOpenAdjust(item)}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs inline-flex items-center space-x-1 cursor-pointer transition-colors border border-slate-700/60"
                          title="Cycle count reconciliation"
                        >
                          <SlidersHorizontal className="w-3 h-3" />
                          <span>Audit</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItemForEdit(item);
                            setIsEditItemModalOpen(true);
                          }}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer border border-slate-700/60"
                          title="Edit Inventory Item"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete item "${item.name}" (${item.sku})?`)) {
                              deleteInventoryItem(item.id);
                            }
                          }}
                          className="p-1 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 transition-colors cursor-pointer border border-rose-800/40"
                          title="Delete Inventory Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD ITEM MASTER */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-800 text-slate-100 my-8">
            <h2 className="text-lg font-bold text-white mb-1">Add New Item to Warehouse Catalog</h2>
            <p className="text-xs text-slate-400 mb-4">
              Register a new SKU with standard safety thresholds and warehouse slot allocation.
            </p>

            <form onSubmit={handleCreateItem} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RAW-STL-002"
                    value={newItemSku}
                    onChange={e => setNewItemSku(e.target.value)}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs uppercase focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Raw Materials, Spares"
                    value={newItemCategory}
                    onChange={e => setNewItemCategory(e.target.value)}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Item Description / Name</label>
                <input
                  type="text"
                  required
                  placeholder="Full technical name of item..."
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Primary Supplier / Vendor</label>
                <select
                  value={newItemVendorId}
                  onChange={e => setNewItemVendorId(e.target.value)}
                  className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.code} - {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pieces, Drums, Kgs"
                    value={newItemUnit}
                    onChange={e => setNewItemUnit(e.target.value)}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Opening Stock</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newItemQty}
                    onChange={e => setNewItemQty(Number(e.target.value))}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Standard Unit Cost (₨)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newItemCost}
                    onChange={e => setNewItemCost(Number(e.target.value))}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Reorder Level Threshold</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newItemReorder}
                    onChange={e => setNewItemReorder(Number(e.target.value))}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Safety Stock Buffer</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newItemSafety}
                    onChange={e => setNewItemSafety(Number(e.target.value))}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Location Slotting */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="font-semibold text-slate-200 block mb-2">Slot Allocation</span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-0.5">Zone</label>
                    <select
                      value={newItemZone}
                      onChange={e => setNewItemZone(e.target.value)}
                      className="w-full p-1.5 border border-slate-700 bg-slate-800 text-white rounded-lg"
                    >
                      {zones.map(z => (
                        <option key={z.id} value={z.code}>
                          {z.code}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-0.5">Aisle</label>
                    <input
                      type="text"
                      value={newItemAisle}
                      onChange={e => setNewItemAisle(e.target.value)}
                      className="w-full p-1.5 border border-slate-700 bg-slate-800 text-white rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-0.5">Shelf</label>
                    <input
                      type="text"
                      value={newItemShelf}
                      onChange={e => setNewItemShelf(e.target.value)}
                      className="w-full p-1.5 border border-slate-700 bg-slate-800 text-white rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-0.5">Bin Code</label>
                    <input
                      type="text"
                      value={newItemBin}
                      onChange={e => setNewItemBin(e.target.value)}
                      className="w-full p-1.5 border border-slate-700 bg-slate-800 text-white rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer shadow-md shadow-indigo-600/25"
                >
                  Create Master Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ISSUE MATERIAL */}
      {isIssueModalOpen && selectedItemForAction && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-800 text-slate-100 my-8">
            <h2 className="text-lg font-bold text-white mb-1">Issue Material / Store Dispatch</h2>
            <p className="text-xs text-slate-400 mb-4">
              Dispatch item from warehouse stock to department or production line.
            </p>

            <form onSubmit={handleConfirmIssue} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="font-mono font-bold text-indigo-400">{selectedItemForAction.sku}</div>
                <div className="font-medium text-slate-200 text-xs mt-0.5">{selectedItemForAction.name}</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Location: {selectedItemForAction.warehouseZone} / {selectedItemForAction.bin} • Current Stock:{' '}
                  <span className="font-bold text-white">
                    {selectedItemForAction.quantityOnHand} {selectedItemForAction.unit}
                  </span>
                </div>
              </div>

              {issueError && (
                <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs font-medium">
                  {issueError}
                </div>
              )}

              {onNavigateToIssuance && (
                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/50 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-amber-300 leading-tight">
                    Need an official vehicle gate pass with security clearance & printable slip?
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const id = selectedItemForAction.id;
                      setIsIssueModalOpen(false);
                      onNavigateToIssuance(id);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] shrink-0 cursor-pointer shadow-xs transition"
                  >
                    Use Gate Pass
                  </button>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Quantity to Issue ({selectedItemForAction.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedItemForAction.quantityOnHand}
                  required
                  value={issueQty}
                  onChange={e => {
                    setIssueError('');
                    setIssueQty(Number(e.target.value));
                  }}
                  className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Recipient Destination / Department</label>
                <input
                  type="text"
                  required
                  value={issueTarget}
                  onChange={e => setIssueTarget(e.target.value)}
                  className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Authorized Storekeeper / Issuer</label>
                <input
                  type="text"
                  required
                  value={issueUser}
                  onChange={e => setIssueUser(e.target.value)}
                  className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Purpose / Work Order Ref</label>
                <textarea
                  rows={2}
                  required
                  value={issueReason}
                  onChange={e => setIssueReason(e.target.value)}
                  className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer shadow-md shadow-indigo-600/25"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADJUST STOCK / AUDIT */}
      {isAdjustModalOpen && selectedItemForAction && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-800 text-slate-100 my-8">
            <h2 className="text-lg font-bold text-white mb-1">Physical Inventory Reconciliation</h2>
            <p className="text-xs text-slate-400 mb-4">
              Reconcile physical floor count discrepancy. Delta will be logged in the permanent audit ledger.
            </p>

            <form onSubmit={handleConfirmAdjust} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="font-mono font-bold text-indigo-400">{selectedItemForAction.sku}</div>
                <div className="font-medium text-slate-200 text-xs mt-0.5">{selectedItemForAction.name}</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  System Recorded Balance:{' '}
                  <span className="font-bold text-white">
                    {selectedItemForAction.quantityOnHand} {selectedItemForAction.unit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Actual Physical Verified Count ({selectedItemForAction.unit})
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={adjustNewQty}
                  onChange={e => setAdjustNewQty(Number(e.target.value))}
                  className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
                <div className="mt-1 text-[11px] text-slate-400">
                  Variance:{' '}
                  <span
                    className={`font-bold ${
                      adjustNewQty - selectedItemForAction.quantityOnHand >= 0
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {adjustNewQty - selectedItemForAction.quantityOnHand > 0 ? '+' : ''}
                    {adjustNewQty - selectedItemForAction.quantityOnHand} {selectedItemForAction.unit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Auditor / Verifier</label>
                <input
                  type="text"
                  required
                  value={adjustUser}
                  onChange={e => setAdjustUser(e.target.value)}
                  className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Audit Justification</label>
                <textarea
                  rows={2}
                  required
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  placeholder="e.g. Broken packaging write-off, count error in previous shift..."
                  className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer shadow-md shadow-indigo-600/25"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ITEM MODAL */}
      {isEditItemModalOpen && selectedItemForEdit && (
        <EditItemModal
          isOpen={isEditItemModalOpen}
          onClose={() => {
            setIsEditItemModalOpen(false);
            setSelectedItemForEdit(null);
          }}
          item={selectedItemForEdit}
          vendors={vendors}
          zones={zones}
          onSave={(id, updates) => updateInventoryItem(id, updates)}
        />
      )}
    </div>
  );
};
