import React from 'react';
import { Printer, X, Download } from 'lucide-react';
import { PurchaseOrder } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { triggerDirectPrint } from '../utils/printHelper';
import { exportPOSlipPDF } from '../utils/exportUtils';
import { useWarehouse } from '../context/WarehouseContext';

interface PODocumentModalProps {
  po: PurchaseOrder | null;
  onClose: () => void;
}

export const PODocumentModal: React.FC<PODocumentModalProps> = ({ po, onClose }) => {
  const { systemSettings } = useWarehouse();
  if (!po) return null;

  const handlePrint = () => {
    const el = document.getElementById(`po-print-${po.id}`);
    if (el) {
      triggerDirectPrint(el.innerHTML, `KTS_Purchase_Order_${po.poNumber}`);
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden border border-slate-700/50">
        {/* Actions bar */}
        <div className="bg-slate-950 text-white px-6 py-3.5 flex items-center justify-between print:hidden border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm">Purchase Order Preview</span>
            <span className="text-xs bg-slate-800 text-sky-300 px-2 py-0.5 rounded-md font-mono border border-slate-700">
              {po.poNumber}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold cursor-pointer transition-colors shadow-md shadow-sky-600/25"
              title="Print PO Voucher"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Direct Print</span>
            </button>
            <button
              onClick={() => exportPOSlipPDF(po)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700 transition"
              title="Download PDF document"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
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
        <div id={`po-print-${po.id}`} className="p-8 sm:p-10 text-slate-800 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-lg bg-white border border-slate-300 p-1 flex items-center justify-center shrink-0">
                <img
                  src="/kts-logo.png"
                  alt="KTS Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<span style="font-weight:900;font-size:14px;color:#091e3a;">KTS</span>';
                  }}
                />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                  {systemSettings.companyName || 'KARACHI TRANSPORT SERVICE (KTS)'}
                </h2>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">Procurement & Fleet Supply Chain Division</p>
                <p className="text-xs text-slate-500">Central Bus Depot, Malir Transit Hub, Karachi • Facility: {systemSettings.facilityCode || 'KTS-MALIR-DEPOT-01'}</p>
                <p className="text-xs text-slate-500">NTN: 893241-7 • GST Reg: 07-01-9988-001</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-sky-800 tracking-wider">PURCHASE ORDER</span>
              <div className="mt-2 space-y-0.5 text-xs text-slate-600">
                <div>
                  <span className="font-semibold text-slate-800">PO Number: </span>
                  <span className="font-mono font-bold text-slate-900">{po.poNumber}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Issue Date: </span>
                  <span>{po.orderDate}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Delivery Due: </span>
                  <span className="font-medium text-blue-900">{po.expectedDeliveryDate}</span>
                </div>
                {po.prNumber && (
                  <div>
                    <span className="font-semibold text-slate-800">Requisition Ref: </span>
                    <span className="font-mono">{po.prNumber}</span>
                  </div>
                )}
                <div>
                  <span className="font-semibold text-slate-800">Status: </span>
                  <span className="uppercase font-bold text-emerald-700">{po.status.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vendor & Delivery Grid */}
          <div className="grid grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Vendor / Supplier:</span>
              <div className="font-bold text-sm text-slate-900 mt-1">{po.vendorName}</div>
              <p className="text-slate-600 mt-1">Approved Corporate Vendor</p>
              <p className="text-slate-600 mt-2 font-medium">
                Payment Terms: <span className="text-slate-900">{po.paymentTerms || 'Net 30'}</span>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Delivery & Inward Dock:</span>
              <div className="font-bold text-sm text-slate-900 mt-1">{po.deliveryAddress}</div>
              <p className="text-slate-600 mt-1">Shipping Terms: {po.shippingTerms || 'FOB Destination'}</p>
              <p className="text-slate-600 mt-2 font-medium">Receiving Bay: KTS Central Depot Inward Gate Bay 3</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 text-right">Qty Ordered</th>
                  <th className="py-2.5 px-3 text-right">Received</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {po.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-700">{item.sku}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{item.itemName}</td>
                    <td className="py-2.5 px-3 text-right font-semibold">{formatNumber(item.orderedQty)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">{formatNumber(item.receivedQty)}</td>
                    <td className="py-2.5 px-3 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary */}
          <div className="flex justify-between items-start pt-2">
            <div className="max-w-xs text-[11px] text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700">Special Instructions & Terms:</p>
              <p>{po.notes || 'Goods subject to mandatory inward QC and caliper verification prior to GRN signing.'}</p>
              <p>Late delivery penalty: 0.5% per week of delay.</p>
            </div>

            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-medium text-slate-900">{formatCurrency(po.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Sales Tax / GST (17%):</span>
                <span className="font-medium text-slate-900">{formatCurrency(po.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-300 pt-2">
                <span>Grand Total:</span>
                <span className="text-blue-700">{formatCurrency(po.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-10 border-t border-slate-200 text-xs">
            <div>
              <div className="border-b border-slate-400 w-44 mb-1"></div>
              <p className="font-bold text-slate-800">Procurement Manager</p>
              <p className="text-slate-500 text-[10px]">Authorized Signature & Stamp</p>
            </div>
            <div className="text-right">
              <div className="border-b border-slate-400 w-44 ml-auto mb-1"></div>
              <p className="font-bold text-slate-800">Finance Controller</p>
              <p className="text-slate-500 text-[10px]">Budgetary Release Authorization</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
