import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, ShoppingCart, DollarSign } from 'lucide-react';
import { PurchaseOrder, POItem, Vendor, InventoryItem, POStatus } from '../types';
import { formatCurrency } from '../utils/formatters';

interface EditPOModalProps {
  isOpen: boolean;
  onClose: () => void;
  po: PurchaseOrder | null;
  vendors: Vendor[];
  availableItems: InventoryItem[];
  onSave: (id: string, updates: Partial<PurchaseOrder>) => void;
}

export const EditPOModal: React.FC<EditPOModalProps> = ({
  isOpen,
  onClose,
  po,
  vendors,
  availableItems,
  onSave
}) => {
  if (!isOpen || !po) return null;

  const [vendorId, setVendorId] = useState(po.vendorId);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(po.expectedDeliveryDate);
  const [paymentTerms, setPaymentTerms] = useState(po.paymentTerms);
  const [shippingTerms, setShippingTerms] = useState(po.shippingTerms);
  const [deliveryAddress, setDeliveryAddress] = useState(po.deliveryAddress);
  const [status, setStatus] = useState<POStatus>(po.status);
  const [notes, setNotes] = useState(po.notes || '');
  const [items, setItems] = useState<POItem[]>(po.items);

  useEffect(() => {
    if (po) {
      setVendorId(po.vendorId);
      setExpectedDeliveryDate(po.expectedDeliveryDate);
      setPaymentTerms(po.paymentTerms);
      setShippingTerms(po.shippingTerms);
      setDeliveryAddress(po.deliveryAddress);
      setStatus(po.status);
      setNotes(po.notes || '');
      setItems([...po.items]);
    }
  }, [po]);

  const handleAddItem = () => {
    const firstItem = availableItems[0];
    if (!firstItem) return;
    setItems(prev => [
      ...prev,
      {
        itemId: firstItem.id,
        itemName: firstItem.name,
        sku: firstItem.sku,
        orderedQty: 50,
        receivedQty: 0,
        unitPrice: firstItem.unitCost,
        total: 50 * firstItem.unitCost
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      alert('A purchase order must have at least one line item.');
      return;
    }
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'itemId' | 'orderedQty' | 'unitPrice', value: any) => {
    setItems(prev =>
      prev.map((item, i) => {
        if (i !== index) return item;

        if (field === 'itemId') {
          const invItem = availableItems.find(inv => inv.id === value);
          if (invItem) {
            const qty = item.orderedQty;
            const price = invItem.unitCost;
            return {
              ...item,
              itemId: invItem.id,
              itemName: invItem.name,
              sku: invItem.sku,
              unitPrice: price,
              total: qty * price
            };
          }
        }

        const updated = { ...item, [field]: value };
        if (field === 'orderedQty' || field === 'unitPrice') {
          const qty = Number(field === 'orderedQty' ? value : item.orderedQty) || 0;
          const price = Number(field === 'unitPrice' ? value : item.unitPrice) || 0;
          updated.total = qty * price;
        }
        return updated;
      })
    );
  };

  const subtotal = items.reduce((acc, i) => acc + (Number(i.total) || 0), 0);
  const taxAmount = Math.round(subtotal * 0.17);
  const grandTotal = subtotal + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vendorObj = vendors.find(v => v.id === vendorId);
    if (!vendorObj) {
      alert('Please select a valid supplier/vendor.');
      return;
    }
    if (items.length === 0) {
      alert('Purchase order must contain items.');
      return;
    }

    onSave(po.id, {
      vendorId: vendorObj.id,
      vendorName: vendorObj.name,
      expectedDeliveryDate,
      paymentTerms,
      shippingTerms,
      deliveryAddress,
      status,
      notes,
      items,
      subtotal,
      taxAmount,
      grandTotal
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800/60">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <span>Edit Purchase Order</span>
                <span className="font-mono text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded text-xs border border-indigo-800/50">
                  {po.poNumber}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Update supplier details, delivery target, pricing, or commercial terms</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Assigned Vendor / Supplier *
              </label>
              <select
                value={vendorId}
                onChange={e => setVendorId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-800 text-xs bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
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
                Expected Delivery Date *
              </label>
              <input
                type="date"
                required
                value={expectedDeliveryDate}
                onChange={e => setExpectedDeliveryDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-800 text-xs bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                PO Status *
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as POStatus)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-800 text-xs bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="draft">Draft</option>
                <option value="issued">Issued / In-Transit</option>
                <option value="partially_received">Partially Received</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Commercial Payment Terms
              </label>
              <input
                type="text"
                value={paymentTerms}
                onChange={e => setPaymentTerms(e.target.value)}
                placeholder="e.g. Net 30, 20% Advance"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-800 text-xs bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Incoterms / Shipping Terms
              </label>
              <input
                type="text"
                value={shippingTerms}
                onChange={e => setShippingTerms(e.target.value)}
                placeholder="e.g. FOB Destination - Warehouse Bay"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-800 text-xs bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Destination Delivery Address
            </label>
            <input
              type="text"
              value={deliveryAddress}
              onChange={e => setDeliveryAddress(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-800 text-xs bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Line items */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-200">Order Line Items</span>
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
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Ordered Qty"
                      value={item.orderedQty}
                      onChange={e => handleItemChange(idx, 'orderedQty', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 rounded-lg border border-slate-800 bg-slate-900 text-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="Unit Price"
                      value={item.unitPrice}
                      onChange={e => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 rounded-lg border border-slate-800 bg-slate-900 text-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2 text-right font-semibold text-slate-300">
                    {formatCurrency(item.total)}
                  </div>
                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Remove line"
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
              Purchase Order Remarks
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Commercial stipulations, inspection instructions, or delivery notes"
              className="w-full px-3 py-1.5 rounded-xl border border-slate-800 text-xs bg-slate-950 text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Pricing Calculation Summary */}
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 grid grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Subtotal (Excl. Tax):</span>
              <span className="font-bold text-white">{formatCurrency(subtotal)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Sales Tax GST (17%):</span>
              <span className="font-bold text-slate-300">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">Grand Total Payable:</span>
              <span className="font-bold text-emerald-400 text-sm">{formatCurrency(grandTotal)}</span>
            </div>
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
              <span>Update Purchase Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
