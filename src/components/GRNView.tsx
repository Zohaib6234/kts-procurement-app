import React, { useState } from 'react';
import {
  PackageCheck,
  Plus,
  Search,
  Printer,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Truck,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { GoodsReceiptNote, GRNItem, PurchaseOrder } from '../types';
import { formatNumber } from '../utils/formatters';
import { GRNDocumentModal } from './GRNDocumentModal';

interface GRNViewProps {
  initialSelectedPOId?: string | null;
}

export const GRNView: React.FC<GRNViewProps> = ({ initialSelectedPOId }) => {
  const { goodsReceiptNotes, purchaseOrders, items, zones, processGRN } = useWarehouse();

  const [searchQuery, setSearchQuery] = useState('');
  const [isReceivingModalOpen, setIsReceivingModalOpen] = useState(false);
  const [selectedGRNForPreview, setSelectedGRNForPreview] = useState<GoodsReceiptNote | null>(null);

  // Receiving Wizard State
  const activePOs = purchaseOrders.filter(
    po => po.status === 'issued' || po.status === 'partially_received'
  );

  const [selectedPOId, setSelectedPOId] = useState<string>(
    initialSelectedPOId || activePOs[0]?.id || ''
  );

  const selectedPO = purchaseOrders.find(po => po.id === selectedPOId);

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [inspectorName, setInspectorName] = useState('Imran Ashraf (Inward QC Officer)');
  const [grnRemarks, setGrnRemarks] = useState('');

  // Items to receive state
  const [receivingItems, setReceivingItems] = useState<GRNItem[]>([]);

  // When PO selection changes in modal
  const handleSelectPO = (poId: string) => {
    setSelectedPOId(poId);
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) return;

    const initialGRNItems: GRNItem[] = po.items.map(poItem => {
      const invItem = items.find(i => i.id === poItem.itemId || i.sku === poItem.sku);
      const remainingQty = Math.max(0, poItem.orderedQty - poItem.receivedQty);

      return {
        itemId: poItem.itemId,
        itemName: poItem.itemName,
        sku: poItem.sku,
        orderedQty: poItem.orderedQty,
        deliveredQty: remainingQty,
        acceptedQty: remainingQty,
        rejectedQty: 0,
        rejectReason: '',
        targetZone: invItem?.warehouseZone || 'Z-RAW',
        targetBin: invItem?.bin || 'B-01',
        batchNumber: `LOT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`
      };
    });

    setReceivingItems(initialGRNItems);
  };

  const handleOpenReceiveModal = () => {
    if (activePOs.length > 0) {
      handleSelectPO(selectedPOId || activePOs[0].id);
      setInvoiceNumber(`INV-${Math.floor(10000 + Math.random() * 90000)}`);
      setVehicleNumber('ISB-7491 (Commercial Truck)');
      setIsReceivingModalOpen(true);
    }
  };

  const handleUpdateItemQty = (index: number, delivered: number, accepted: number) => {
    setReceivingItems(prev => {
      const copy = [...prev];
      const rejected = Math.max(0, delivered - accepted);
      copy[index] = {
        ...copy[index],
        deliveredQty: delivered,
        acceptedQty: accepted,
        rejectedQty: rejected
      };
      return copy;
    });
  };

  const handleUpdateItemLocation = (index: number, zone: string, bin: string) => {
    setReceivingItems(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], targetZone: zone, targetBin: bin };
      return copy;
    });
  };

  const handleUpdateRejectReason = (index: number, reason: string) => {
    setReceivingItems(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], rejectReason: reason };
      return copy;
    });
  };

  const handleSubmitGRN = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;

    const hasRejections = receivingItems.some(item => item.rejectedQty > 0);
    const allRejected = receivingItems.every(item => item.acceptedQty === 0);

    const inspectionStatus = allRejected ? 'rejected' : hasRejections ? 'partial' : 'passed';

    processGRN({
      poId: selectedPO.id,
      poNumber: selectedPO.poNumber,
      vendorId: selectedPO.vendorId,
      vendorName: selectedPO.vendorName,
      receivedBy: inspectorName,
      invoiceNumber,
      vehicleNumber,
      inspectionStatus,
      items: receivingItems,
      remarks: grnRemarks
    });

    setIsReceivingModalOpen(false);
  };

  // Filtered GRNs
  const filteredGRNs = goodsReceiptNotes.filter(grn => {
    return (
      grn.grnNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grn.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grn.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grn.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Goods Receiving & Inward QC (GRN)</h1>
          <p className="text-xs text-slate-400">
            Physical receiving against Purchase Orders, quality inspection verification, and warehouse bin slotting.
          </p>
        </div>
        <div>
          <button
            onClick={handleOpenReceiveModal}
            disabled={activePOs.length === 0}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-50"
          >
            <PackageCheck className="w-4 h-4" />
            <span>Receive Goods Against PO</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Open Purchase Orders</div>
            <div className="text-xl font-bold text-white mt-1">{activePOs.length} Pending Inward</div>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-950/80 text-indigo-400 border border-indigo-800/60">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Completed GRNs</div>
            <div className="text-xl font-bold text-white mt-1">{goodsReceiptNotes.length} Received</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">QC Quality Compliance</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">98.4% Accepted</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs flex items-center justify-between">
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search GRN #, PO #, vendor, invoice..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-800 text-xs bg-slate-800/70 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <span className="text-xs text-slate-400">
          Showing <span className="font-bold text-white">{filteredGRNs.length}</span> Inward Receipt Records
        </span>
      </div>

      {/* GRN Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">GRN Number</th>
                <th className="py-3 px-4">PO Reference</th>
                <th className="py-3 px-4">Vendor Name</th>
                <th className="py-3 px-4">Received Date</th>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Vehicle #</th>
                <th className="py-3 px-4">QC Status</th>
                <th className="py-3 px-4">Items Summary</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredGRNs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No Goods Receipt Notes found.
                  </td>
                </tr>
              ) : (
                filteredGRNs.map(grn => {
                  const totalAccepted = grn.items.reduce((acc, i) => acc + i.acceptedQty, 0);
                  const totalRejected = grn.items.reduce((acc, i) => acc + i.rejectedQty, 0);

                  const statusColor =
                    grn.inspectionStatus === 'passed'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                      : grn.inspectionStatus === 'partial'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                      : 'bg-rose-950 text-rose-300 border border-rose-800/60';

                  return (
                    <tr key={grn.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">{grn.grnNumber}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-indigo-400">{grn.poNumber}</td>
                      <td className="py-3 px-4 font-medium text-slate-200">{grn.vendorName}</td>
                      <td className="py-3 px-4 text-slate-400">{grn.receivedDate}</td>
                      <td className="py-3 px-4 font-mono text-slate-300">{grn.invoiceNumber || '—'}</td>
                      <td className="py-3 px-4 text-slate-400">{grn.vehicleNumber || '—'}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${statusColor}`}>
                          {grn.inspectionStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-200 font-medium">
                          {grn.items.length} item(s) •{' '}
                          <span className="text-emerald-400 font-bold">{formatNumber(totalAccepted)} Acc.</span>
                          {totalRejected > 0 && (
                            <span className="text-rose-400 font-bold ml-1">({formatNumber(totalRejected)} Rej.)</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500">By: {grn.receivedBy}</div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedGRNForPreview(grn)}
                          className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs inline-flex items-center space-x-1 cursor-pointer transition-colors border border-slate-700/60"
                          title="Print / View GRN Slip"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Slip</span>
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

      {/* RECEIVE GOODS MODAL WIZARD */}
      {isReceivingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full p-6 border border-slate-800 text-slate-100 my-8">
            <h2 className="text-lg font-bold text-white mb-1">Process Inward Goods Receipt Note (GRN)</h2>
            <p className="text-xs text-slate-400 mb-4">
              Inspect delivered items against Purchase Order. Accepted quantities immediately update live warehouse stock.
            </p>

            <form onSubmit={handleSubmitGRN} className="space-y-4 text-xs">
              {/* Select PO */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Select Open Purchase Order</label>
                  <select
                    value={selectedPOId}
                    onChange={e => handleSelectPO(e.target.value)}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
                  >
                    {activePOs.map(po => (
                      <option key={po.id} value={po.id}>
                        {po.poNumber} - {po.vendorName} ({po.status.replace('_', ' ')})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Vendor Commercial Invoice #</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. INV-9042"
                    value={invoiceNumber}
                    onChange={e => setInvoiceNumber(e.target.value)}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Inward Delivery Vehicle / Carrier #</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ISB-7491 Bed Truck"
                    value={vehicleNumber}
                    onChange={e => setVehicleNumber(e.target.value)}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Inward QC Receiving Officer</label>
                  <input
                    type="text"
                    required
                    value={inspectorName}
                    onChange={e => setInspectorName(e.target.value)}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Items Table for Inspection */}
              <div className="pt-2 border-t border-slate-800">
                <span className="font-semibold text-slate-200 block mb-2">Quality Inspection & Bay Slotting</span>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {receivingItems.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-mono font-bold text-indigo-400">{item.sku}</span>
                          <span className="text-slate-200 font-medium ml-2">{item.itemName}</span>
                        </div>
                        <span className="text-[11px] text-slate-400">Ordered: {item.orderedQty} units</span>
                      </div>

                      <div className="grid grid-cols-4 gap-2 pt-1">
                        <div>
                          <label className="block text-slate-400 text-[10px] mb-0.5">Delivered Qty</label>
                          <input
                            type="number"
                            min="1"
                            max={item.orderedQty * 2}
                            value={item.deliveredQty}
                            onChange={e => handleUpdateItemQty(idx, Number(e.target.value), Number(e.target.value))}
                            className="w-full p-1.5 border border-slate-700 bg-slate-800 text-white rounded-lg text-xs font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-emerald-400 text-[10px] font-semibold mb-0.5">
                            Accepted Qty (In Stock)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={item.deliveredQty}
                            value={item.acceptedQty}
                            onChange={e => handleUpdateItemQty(idx, item.deliveredQty, Number(e.target.value))}
                            className="w-full p-1.5 border border-emerald-600/60 bg-emerald-950/40 text-emerald-300 rounded-lg text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-rose-400 text-[10px] font-semibold mb-0.5">Rejected Qty</label>
                          <input
                            type="number"
                            readOnly
                            value={item.rejectedQty}
                            className="w-full p-1.5 border border-rose-800/40 rounded-lg bg-rose-950/30 text-xs font-bold text-rose-400"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 text-[10px] mb-0.5">Slot: Zone / Bin</label>
                          <div className="flex space-x-1">
                            <select
                              value={item.targetZone}
                              onChange={e => handleUpdateItemLocation(idx, e.target.value, item.targetBin)}
                              className="w-1/2 p-1.5 border border-slate-700 bg-slate-800 text-white rounded-lg text-[11px]"
                            >
                              {zones.map(z => (
                                <option key={z.id} value={z.code}>
                                  {z.code}
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={item.targetBin}
                              onChange={e => handleUpdateItemLocation(idx, item.targetZone, e.target.value)}
                              placeholder="Bin"
                              className="w-1/2 p-1.5 border border-slate-700 bg-slate-800 text-white rounded-lg text-[11px]"
                            />
                          </div>
                        </div>
                      </div>

                      {item.rejectedQty > 0 && (
                        <div>
                          <label className="block text-rose-400 text-[10px] font-semibold mb-0.5">
                            Reason for Rejection
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Dimensions out of tolerance, dented packaging, batch expired..."
                            value={item.rejectReason}
                            onChange={e => handleUpdateRejectReason(idx, e.target.value)}
                            className="w-full p-1.5 border border-rose-800/60 rounded-lg bg-rose-950/40 text-xs text-rose-300"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Inward QC Observations / Remarks</label>
                <textarea
                  rows={2}
                  value={grnRemarks}
                  onChange={e => setGrnRemarks(e.target.value)}
                  placeholder="Material condition, certificate verification, packaging integrity..."
                  className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReceivingModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer shadow-md shadow-indigo-600/25"
                >
                  Authorize & Update Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {selectedGRNForPreview && (
        <GRNDocumentModal grn={selectedGRNForPreview} onClose={() => setSelectedGRNForPreview(null)} />
      )}
    </div>
  );
};
