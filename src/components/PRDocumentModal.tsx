import React from 'react';
import { Printer, X, Download, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { PurchaseRequisition } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { triggerDirectPrint } from '../utils/printHelper';
import { exportPRSlipPDF } from '../utils/exportUtils';
import { useWarehouse } from '../context/WarehouseContext';

interface PRDocumentModalProps {
  pr: PurchaseRequisition | null;
  onClose: () => void;
}

export const PRDocumentModal: React.FC<PRDocumentModalProps> = ({ pr, onClose }) => {
  const { systemSettings } = useWarehouse();
  if (!pr) return null;

  const handlePrint = () => {
    const el = document.getElementById(`pr-print-${pr.id}`);
    if (el) {
      triggerDirectPrint(el.innerHTML, `KTS_Purchase_Requisition_${pr.prNumber}`);
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
            <span className="font-bold text-sm">Purchase Requisition Voucher</span>
            <span className="text-xs bg-slate-800 text-sky-300 px-2 py-0.5 rounded-md font-mono border border-slate-700">
              {pr.prNumber}
            </span>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
              pr.status === 'approved'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                : pr.status === 'rejected'
                ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                : 'bg-amber-950 text-amber-300 border border-amber-800/60'
            }`}>
              {pr.status.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold cursor-pointer transition-colors shadow-md shadow-sky-600/25"
              title="Print Requisition slip"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Direct Print</span>
            </button>
            <button
              onClick={() => exportPRSlipPDF(pr)}
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
        <div id={`pr-print-${pr.id}`} className="p-8 sm:p-10 text-slate-800 space-y-6">
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
                <p className="text-xs text-slate-600 font-semibold mt-0.5">
                  FLEET MAINTENANCE & CENTRAL STORE PROCUREMENT REQUISITION
                </p>
                <p className="text-xs text-slate-500">Facility: {systemSettings.facilityCode || 'KTS-MALIR-DEPOT-01'} • Government of Sindh Transit Partner</p>
                <p className="text-xs text-slate-500">Karachi Central Bus Depot, Malir Transit Hub</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-sky-800 tracking-wider">REQUISITION SLIP</span>
              <div className="mt-2 space-y-0.5 text-xs text-slate-600">
                <div>
                  <span className="font-semibold text-slate-800">PR Number: </span>
                  <span className="font-mono font-bold text-slate-900">{pr.prNumber}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Date Logged: </span>
                  <span>{pr.requestDate}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Required Target: </span>
                  <span className="font-medium text-sky-900">{pr.requiredDate}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Urgency: </span>
                  <span className="font-bold text-amber-700 uppercase">{pr.urgency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Department & Requester Grid */}
          <div className="grid grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Originating Department:</span>
              <div className="font-bold text-sm text-slate-900 mt-1">{pr.department}</div>
              <p className="text-slate-600 mt-1">Requested By: <span className="font-semibold text-slate-800">{pr.requestedBy}</span></p>
              <p className="text-slate-600 mt-1">Target Workshop: Fleet Maintenance Workshop Bay</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Requisition Approval:</span>
              <div className="font-bold text-sm text-slate-900 mt-1">
                {pr.status === 'approved' ? `Approved (${pr.approvedBy || 'Director Fleet Operations'})` : pr.status.toUpperCase()}
              </div>
              <p className="text-slate-600 mt-1">
                Approval Date: {pr.approvalDate || 'Pending Management Review'}
              </p>
              <p className="text-slate-600 mt-1">
                Procurement Pipeline: {pr.status === 'approved' ? 'Eligible for PO Conversion' : 'Awaiting Authorization'}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Spare Part Description & Specifications</th>
                  <th className="py-2.5 px-3 text-right">Requested Qty</th>
                  <th className="py-2.5 px-3 text-right">Est. Unit Cost</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pr.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-700">{item.sku}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{item.itemName}</td>
                    <td className="py-2.5 px-3 text-right font-semibold">{formatNumber(item.quantity)}</td>
                    <td className="py-2.5 px-3 text-right">{formatCurrency(item.estimatedCost)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(item.quantity * item.estimatedCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-200 font-bold text-slate-900">
                  <td colSpan={3} className="py-2.5 px-3 uppercase text-[10px] text-right">
                    Total Estimated Budget:
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    {formatNumber(pr.items.reduce((acc, i) => acc + i.quantity, 0))} Units
                  </td>
                  <td></td>
                  <td className="py-2.5 px-3 text-right font-bold text-sky-800 text-sm">
                    {formatCurrency(pr.totalEstimatedCost)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notes & Justification */}
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs">
            <span className="font-semibold text-amber-900">Departmental Justification: </span>
            <span className="text-amber-800">
              {pr.notes || 'Emergency replenishment required for routine preventive maintenance of KTS transit fleet.'}
            </span>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-xs">
            <div>
              <div className="border-b border-slate-400 w-44 mb-1"></div>
              <p className="font-bold text-slate-800">Requisitioner / Depot Engineer</p>
              <p className="text-slate-500 text-[10px]">{pr.requestedBy}</p>
            </div>
            <div className="text-right">
              <div className="border-b border-slate-400 w-44 ml-auto mb-1"></div>
              <p className="font-bold text-slate-800">Fleet Operations General Manager</p>
              <p className="text-slate-500 text-[10px]">{pr.approvedBy || 'Verification & Budgetary Approval'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
