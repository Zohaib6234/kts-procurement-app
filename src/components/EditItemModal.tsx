import React, { useState, useEffect } from 'react';
import { X, Save, Package, DollarSign, MapPin, Building2 } from 'lucide-react';
import { InventoryItem, Vendor, WarehouseZone } from '../types';
import { formatCurrency } from '../utils/formatters';

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  vendors: Vendor[];
  zones: WarehouseZone[];
  onSave: (id: string, updates: Partial<InventoryItem>) => void;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({
  isOpen,
  onClose,
  item,
  vendors,
  zones,
  onSave
}) => {
  if (!isOpen || !item) return null;

  const [sku, setSku] = useState(item.sku);
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState(item.category);
  const [unit, setUnit] = useState(item.unit);
  const [vendorId, setVendorId] = useState(item.vendorId || vendors[0]?.id || '');
  const [quantityOnHand, setQuantityOnHand] = useState(item.quantityOnHand);
  const [reorderLevel, setReorderLevel] = useState(item.reorderLevel);
  const [safetyStock, setSafetyStock] = useState(item.safetyStock);
  const [unitCost, setUnitCost] = useState(item.unitCost);
  const [warehouseZone, setWarehouseZone] = useState(item.warehouseZone);
  const [aisle, setAisle] = useState(item.aisle);
  const [shelf, setShelf] = useState(item.shelf);
  const [bin, setBin] = useState(item.bin);

  useEffect(() => {
    if (item) {
      setSku(item.sku);
      setName(item.name);
      setCategory(item.category);
      setUnit(item.unit);
      setVendorId(item.vendorId || vendors[0]?.id || '');
      setQuantityOnHand(item.quantityOnHand);
      setReorderLevel(item.reorderLevel);
      setSafetyStock(item.safetyStock);
      setUnitCost(item.unitCost);
      setWarehouseZone(item.warehouseZone);
      setAisle(item.aisle);
      setShelf(item.shelf);
      setBin(item.bin);
    }
  }, [item, vendors]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !name) {
      alert('Please provide SKU and item name.');
      return;
    }

    const assignedVendor = vendors.find(v => v.id === vendorId);

    // Compute updated status
    const qty = Number(quantityOnHand) || 0;
    const reorder = Number(reorderLevel) || 0;
    let status: InventoryItem['status'] = 'in_stock';
    if (qty <= 0) {
      status = 'out_of_stock';
    } else if (qty <= reorder) {
      status = 'low_stock';
    } else if (qty > reorder * 3) {
      status = 'overstocked';
    }

    onSave(item.id, {
      sku: sku.toUpperCase(),
      name,
      category,
      unit,
      vendorId: assignedVendor?.id,
      vendorName: assignedVendor?.name,
      quantityOnHand: qty,
      reorderLevel: reorder,
      safetyStock: Number(safetyStock) || 0,
      unitCost: Number(unitCost) || 0,
      warehouseZone,
      aisle,
      shelf,
      bin,
      status
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800/60">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <span>Edit Inventory Item</span>
                <span className="font-mono text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded text-xs border border-indigo-800/50">
                  {item.sku}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Update item specifications, supplier association, or storage location</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Stock Keeping Unit (SKU) *
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={e => setSku(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Item Description / Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Assigned Supplier / Vendor *
              </label>
              <select
                value={vendorId}
                onChange={e => setVendorId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              >
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Raw Materials">Raw Materials</option>
                <option value="Packaging">Packaging</option>
                <option value="Consumables">Consumables</option>
                <option value="Spare Parts">Spare Parts</option>
                <option value="Electronics">Electronics</option>
                <option value="PPE / Safety">PPE / Safety</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Unit of Measure *
              </label>
              <input
                type="text"
                required
                value={unit}
                onChange={e => setUnit(e.target.value)}
                placeholder="e.g. Pieces, kg, Meters"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Physical On-Hand Qty *
              </label>
              <input
                type="number"
                min="0"
                required
                value={quantityOnHand}
                onChange={e => setQuantityOnHand(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Reorder Threshold *
              </label>
              <input
                type="number"
                min="0"
                required
                value={reorderLevel}
                onChange={e => setReorderLevel(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Safety Stock Buffer
              </label>
              <input
                type="number"
                min="0"
                value={safetyStock}
                onChange={e => setSafetyStock(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Unit Standard Cost (PKR) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={unitCost}
                onChange={e => setUnitCost(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-emerald-400 font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Location slots */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80">
            <span className="block text-[11px] font-semibold text-slate-200 mb-2.5">
              Warehouse Storage Bin & Bay Assignment
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Zone</label>
                <select
                  value={warehouseZone}
                  onChange={e => setWarehouseZone(e.target.value)}
                  className="w-full px-2 py-1 rounded-lg border border-slate-800 bg-slate-900 text-slate-200 text-xs focus:outline-none"
                >
                  {zones.map(z => (
                    <option key={z.id} value={z.code}>
                      {z.code} ({z.name})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Aisle</label>
                <input
                  type="text"
                  value={aisle}
                  onChange={e => setAisle(e.target.value)}
                  className="w-full px-2 py-1 rounded-lg border border-slate-800 bg-slate-900 text-slate-200 text-xs focus:outline-none uppercase"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Shelf</label>
                <input
                  type="text"
                  value={shelf}
                  onChange={e => setShelf(e.target.value)}
                  className="w-full px-2 py-1 rounded-lg border border-slate-800 bg-slate-900 text-slate-200 text-xs focus:outline-none uppercase"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Bin Slot</label>
                <input
                  type="text"
                  value={bin}
                  onChange={e => setBin(e.target.value)}
                  className="w-full px-2 py-1 rounded-lg border border-slate-800 bg-slate-900 text-slate-200 text-xs focus:outline-none uppercase font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400">
              Total Stock Valuation: <strong className="text-white">{formatCurrency((Number(quantityOnHand) || 0) * (Number(unitCost) || 0))}</strong>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end space-x-2.5 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/25 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Item</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
