import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, FileText, AlertCircle } from 'lucide-react';
import { PurchaseRequisition, UrgencyLevel, PRItem, InventoryItem } from '../types';
import { formatCurrency } from '../utils/formatters';

interface EditPRModalProps {
  isOpen: boolean;
  onClose: () => void;
  pr: PurchaseRequisition | null;
  availableItems: InventoryItem[];
  onSave: (id: string, updates: Partial<PurchaseRequisition>) => void;
}

export const EditPRModal: React.FC<EditPRModalProps> = ({
  isOpen,
  onClose,
  pr,
  availableItems,
  onSave
}) => {
  if (!isOpen || !pr) return null;

  const [department, setDepartment] = useState(pr.department);
  const [requestedBy, setRequestedBy] = useState(pr.requestedBy);
  const [requiredDate, setRequiredDate] = useState(pr.requiredDate);
  const [urgency, setUrgency] = useState<UrgencyLevel>(pr.urgency);
  const [notes, setNotes] = useState(pr.notes || '');
  const [items, setItems] = useState<PRItem[]>(pr.items);

  useEffect(() => {
    if (pr) {
      setDepartment(pr.department);
      setRequestedBy(pr.requestedBy);
      setRequiredDate(pr.requiredDate);
      setUrgency(pr.urgency);
      setNotes(pr.notes || '');
      setItems([...pr.items]);
    }
  }, [pr]);

  const handleAddItem = () => {
    const firstItem = availableItems[0];
    if (!firstItem) return;
    setItems(prev => [
      ...prev,
      {
        itemId: firstItem.id,
        itemName: firstItem.name,
        sku: firstItem.sku,
        quantity: 10,
        estimatedCost: firstItem.unitCost
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      alert('A requisition must have at least one line item.');
      return;
    }
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof PRItem, value: any) => {
    setItems(prev =>
      prev.map((item, i) => {
        if (i !== index) return item;
        if (field === 'itemId') {
          const invItem = availableItems.find(inv => inv.id === value);
          if (invItem) {
            return {
              ...item,
              itemId: invItem.id,
              itemName: invItem.name,
              sku: invItem.sku,
              estimatedCost: invItem.unitCost
            };
          }
        }
        return { ...item, [field]: value };
      })
    );
  };

  const totalCost = items.reduce((acc, i) => acc + (Number(i.quantity) || 0) * (Number(i.estimatedCost) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!department || !requestedBy || !requiredDate) {
      alert('Please fill in all mandatory fields.');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one item.');
      return;
    }

    onSave(pr.id, {
      department,
      requestedBy,
      requiredDate,
      urgency,
      notes,
      items,
      totalEstimatedCost: totalCost
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800/60">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <span>Edit Purchase Requisition</span>
                <span className="font-mono text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded text-xs border border-indigo-800/50">
                  {pr.prNumber}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Modify requisition specs, delivery requirement, or item quantities</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Requesting Department *
              </label>
              <input
                type="text"
                required
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-800 text-xs bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Requested By (Name & Designation) *
              </label>
              <input
                type="text"
                required
                value={requestedBy}
                onChange={e => setRequestedBy(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-800 text-xs bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Required By Target Date *
              </label>
              <input
                type="date"
                required
                value={requiredDate}
                onChange={e => setRequiredDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-800 text-xs bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Urgency Priority *
              </label>
              <select
                value={urgency}
                onChange={e => setUrgency(e.target.value as UrgencyLevel)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-800 text-xs bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent / Critical</option>
              </select>
            </div>
          </div>

          {/* Line Items */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-200">Requisition Items</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-indigo-300 font-medium cursor-pointer border border-slate-700/60"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 grid grid-cols-12 gap-2 items-center text-xs"
                >
                  <div className="col-span-5">
                    <select
                      value={item.itemId}
                      onChange={e => handleItemChange(idx, 'itemId', e.target.value)}
                      className="w-full px-2 py-1 rounded-lg border border-slate-800 bg-slate-900 text-slate-200 text-xs focus:outline-none"
                    >
                      {availableItems.map(inv => (
                        <option key={inv.id} value={inv.id}>
                          {inv.name} ({inv.sku})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={e => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 rounded-lg border border-slate-800 bg-slate-900 text-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      min="0"
                      placeholder="Est. Cost"
                      value={item.estimatedCost}
                      onChange={e => handleItemChange(idx, 'estimatedCost', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 rounded-lg border border-slate-800 bg-slate-900 text-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Justification & Operational Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Critical spares for quarterly plant preventive overhaul"
              className="w-full px-3 py-1.5 rounded-xl border border-slate-800 text-xs bg-slate-950 text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Cost Summary Box */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Calculated Estimate:</span>
            <span className="text-base font-bold text-emerald-400">{formatCurrency(totalCost)}</span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-2.5 border-t border-slate-800">
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
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
