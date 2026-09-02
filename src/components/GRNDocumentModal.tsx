import React from 'react';
import { Printer, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { GoodsReceiptNote } from '../types';
import { formatNumber } from '../utils/formatters';

interface GRNDocumentModalProps {
  grn: GoodsReceiptNote | null;
  onClose: () => void;
}

export const GRNDocumentModal: React.FC<GRNDocumentModalProps> = ({ grn, onClose }) => {
  if (!grn) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden border border-slate-700/50">
        {/* Actions bar */}
        <div className="bg-slate-950 text-white px-6 py-3.5 flex items-center justify-between print:hidden border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm">Goods Receipt Note (GRN)</span>
            <span className="text-xs bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-md font-mono border border-slate-700">
              {grn.grnNumber}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold cursor-pointer transition-colors shadow-md shadow-emerald-600/25"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Inspection Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-10 text-slate-800 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white font-bold flex items-center justify-center text-sm">
                  QC
                </div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">PRO-LOGIX ENTERPRISE</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">Quality Assurance & Inward Receiving Station</p>
              <p className="text-xs text-slate-500">Central Logistics Bay 04, Islamabad Works</p>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-emerald-800 tracking-wider">GOODS RECEIPT NOTE</span>
              <div className="mt-2 space-y-0.5 text-xs text-slate-600">
                <div>
                  <span className="font-semibold text-slate-800">GRN No: </span>
                  <span className="font-mono font-bold text-slate-900">{grn.grnNumber}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Date Received: </span>
                  <span>{grn.receivedDate}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-800">PO Reference: </span>
                  <span className="font-mono font-bold text-blue-700">{grn.poNumber}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Vendor Invoice: </span>
                  <span className="font-mono">{grn.invoiceNumber || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Receiving Details */}
          <div className="grid grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Supplier / Vendor:</span>
              <p className="font-bold text-slate-900 mt-0.5">{grn.vendorName}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Delivery Vehicle:</span>
              <p className="font-medium text-slate-800 mt-0.5">{grn.vehicleNumber || 'Standard Courier / Vendor Truck'}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Inward QC Inspector:</span>
              <p className="font-medium text-slate-800 mt-0.5">{grn.receivedBy}</p>
            </div>
          </div>

          {/* QC Inspection Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 text-right">Ordered</th>
                  <th className="py-2.5 px-3 text-right">Delivered</th>
                  <th className="py-2.5 px-3 text-right text-emerald-700">Accepted</th>
                  <th className="py-2.5 px-3 text-right text-rose-700">Rejected</th>
                  <th className="py-2.5 px-3">Slot Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {grn.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-700">{item.sku}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      <div>{item.itemName}</div>
                      {item.rejectReason && (
                        <div className="text-[10px] text-rose-600 font-normal mt-0.5">
                          Reason: {item.rejectReason}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500">{formatNumber(item.orderedQty)}</td>
                    <td className="py-2.5 px-3 text-right font-semibold">{formatNumber(item.deliveredQty)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                      {formatNumber(item.acceptedQty)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-600">
                      {formatNumber(item.rejectedQty)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      {item.targetZone} / {item.targetBin}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Remarks */}
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs">
            <span className="font-semibold text-amber-900">QC Comments & Remarks: </span>
            <span className="text-amber-800">
              {grn.remarks || 'Items received in sound packaging. Accepted quantity added directly to inventory ledger.'}
            </span>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-xs">
            <div>
              <div className="border-b border-slate-400 w-44 mb-1"></div>
              <p className="font-bold text-slate-800">Inward QC & Receiving Officer</p>
              <p className="text-slate-500 text-[10px]">{grn.receivedBy}</p>
            </div>
            <div className="text-right">
              <div className="border-b border-slate-400 w-44 ml-auto mb-1"></div>
              <p className="font-bold text-slate-800">Warehouse Master / Storekeeper</p>
              <p className="text-slate-500 text-[10px]">Put-away Location Verified</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
