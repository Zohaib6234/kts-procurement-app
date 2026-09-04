import React, { useState } from 'react';
import {
  FileText,
  Plus,
  CheckCircle,
  XCircle,
  ArrowRight,
  Printer,
  Search,
  Filter,
  Package,
  Calendar,
  DollarSign,
  AlertCircle,
  Pencil,
  Trash2,
  Download,
  FileSpreadsheet,
  Eye
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { PurchaseOrder, PurchaseRequisition, UrgencyLevel, PRItem } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { PODocumentModal } from './PODocumentModal';
import { PRDocumentModal } from './PRDocumentModal';
import { EditPRModal } from './EditPRModal';
import { EditPOModal } from './EditPOModal';
import {
  exportPRsToExcel,
  exportPRSlipPDF,
  exportPOsToExcel,
  exportPOSlipPDF
} from '../utils/exportUtils';
import { TabType } from './Navbar';

interface ProcurementViewProps {
  onNavigateToGRNWithPO?: (poId: string) => void;
}

export const ProcurementView: React.FC<ProcurementViewProps> = ({ onNavigateToGRNWithPO }) => {
  const {
    items,
    vendors,
    purchaseRequisitions,
    purchaseOrders,
    createPR,
    editPR,
    deletePR,
    updatePRStatus,
    convertPRToPO,
    createPO,
    editPO,
    deletePO
  } = useWarehouse();

  const [activeSubTab, setActiveSubTab] = useState<'pr' | 'po'>('pr');
  const [selectedPOForPreview, setSelectedPOForPreview] = useState<PurchaseOrder | null>(null);
  const [selectedPRForPreview, setSelectedPRForPreview] = useState<PurchaseRequisition | null>(null);

  // Modals state
  const [isPRModalOpen, setIsPRModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [selectedPRForConvert, setSelectedPRForConvert] = useState<PurchaseRequisition | null>(null);
  const [isDirectPOModalOpen, setIsDirectPOModalOpen] = useState(false);

  // Edit Modals state
  const [selectedPRForEdit, setSelectedPRForEdit] = useState<PurchaseRequisition | null>(null);
  const [isEditPRModalOpen, setIsEditPRModalOpen] = useState(false);
  const [selectedPOForEdit, setSelectedPOForEdit] = useState<PurchaseOrder | null>(null);
  const [isEditPOModalOpen, setIsEditPOModalOpen] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // New PR Form State
  const [prDept, setPrDept] = useState('Manufacturing Plant 1');
  const [prRequester, setPrRequester] = useState('Zahid Ali (Lead Technician)');
  const [prUrgency, setPrUrgency] = useState<UrgencyLevel>('medium');
  const [prRequiredDate, setPrRequiredDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [prNotes, setPrNotes] = useState('');
  const [prSelectedItems, setPrSelectedItems] = useState<PRItem[]>([
    {
      itemId: items[0]?.id || '',
      itemName: items[0]?.name || '',
      sku: items[0]?.sku || '',
      quantity: 50,
      estimatedCost: items[0]?.unitCost || 1000
    }
  ]);

  // Convert to PO State
  const [convertVendorId, setConvertVendorId] = useState(vendors[0]?.id || '');
  const [convertPaymentTerms, setConvertPaymentTerms] = useState('Net 30');
  const [convertShippingTerms, setConvertShippingTerms] = useState('FOB Destination - Warehouse Gate');
  const [convertDeliveryDate, setConvertDeliveryDate] = useState(
    new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [convertDeliveryAddress, setConvertDeliveryAddress] = useState(
    'KTS Central Bus Depot, Inward Receiving Bay 3, Malir Transit Hub, Karachi'
  );

  // Direct PO Form State
  const [directVendorId, setDirectVendorId] = useState(vendors[0]?.id || '');
  const [directDueDate, setDirectDueDate] = useState(
    new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [directItems, setDirectItems] = useState([
    {
      itemId: items[0]?.id || '',
      itemName: items[0]?.name || '',
      sku: items[0]?.sku || '',
      orderedQty: 100,
      unitPrice: items[0]?.unitCost || 1000
    }
  ]);

  // Handle Add Item to PR
  const handleAddPRItem = () => {
    const firstItem = items[0];
    if (!firstItem) return;
    setPrSelectedItems(prev => [
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

  const handleUpdatePRItem = (index: number, field: keyof PRItem, value: any) => {
    setPrSelectedItems(prev => {
      const copy = [...prev];
      if (field === 'itemId') {
        const found = items.find(i => i.id === value);
        if (found) {
          copy[index] = {
            ...copy[index],
            itemId: found.id,
            itemName: found.name,
            sku: found.sku,
            estimatedCost: found.unitCost
          };
        }
      } else {
        copy[index] = { ...copy[index], [field]: value };
      }
      return copy;
    });
  };

  const handleRemovePRItem = (index: number) => {
    if (prSelectedItems.length <= 1) return;
    setPrSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitPR = (e: React.FormEvent) => {
    e.preventDefault();
    const totalEstimatedCost = prSelectedItems.reduce((acc, curr) => acc + curr.quantity * curr.estimatedCost, 0);

    createPR({
      requestedBy: prRequester,
      department: prDept,
      requiredDate: prRequiredDate,
      urgency: prUrgency,
      items: prSelectedItems,
      totalEstimatedCost,
      notes: prNotes
    });

    setIsPRModalOpen(false);
  };

  const handleOpenConvertModal = (pr: PurchaseRequisition) => {
    setSelectedPRForConvert(pr);
    setIsConvertModalOpen(true);
  };

  const handleConfirmConvert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPRForConvert) return;

    convertPRToPO(selectedPRForConvert.id, convertVendorId, {
      paymentTerms: convertPaymentTerms,
      shippingTerms: convertShippingTerms,
      expectedDeliveryDate: convertDeliveryDate,
      deliveryAddress: convertDeliveryAddress
    });

    setIsConvertModalOpen(false);
    setSelectedPRForConvert(null);
    setActiveSubTab('po');
  };

  // Handle Direct PO Submit
  const handleSubmitDirectPO = (e: React.FormEvent) => {
    e.preventDefault();
    const vendor = vendors.find(v => v.id === directVendorId);
    if (!vendor) return;

    const poItems = directItems.map(item => ({
      itemId: item.itemId,
      itemName: item.itemName,
      sku: item.sku,
      orderedQty: Number(item.orderedQty),
      receivedQty: 0,
      unitPrice: Number(item.unitPrice),
      total: Number(item.orderedQty) * Number(item.unitPrice)
    }));

    const subtotal = poItems.reduce((acc, curr) => acc + curr.total, 0);
    const taxAmount = Math.round(subtotal * 0.17);
    const grandTotal = subtotal + taxAmount;

    createPO({
      vendorId: vendor.id,
      vendorName: vendor.name,
      expectedDeliveryDate: directDueDate,
      status: 'issued',
      items: poItems,
      subtotal,
      taxAmount,
      grandTotal,
      paymentTerms: vendor.paymentTerms || 'Net 30',
      shippingTerms: 'FOB Destination - KTS Depot Dock',
      deliveryAddress: 'KTS Central Bus Depot, Inward Receiving Bay 3, Malir Transit Hub, Karachi'
    });

    setIsDirectPOModalOpen(false);
    setActiveSubTab('po');
  };

  // Filtered PRs
  const filteredPRs = purchaseRequisitions.filter(pr => {
    const matchesSearch =
      pr.prNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pr.requestedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pr.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pr.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered POs
  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Procurement Department</h1>
          <p className="text-xs text-slate-400">
            End-to-end purchase requisitions, approval matrix, RFQ evaluation, and purchase orders.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {activeSubTab === 'pr' ? (
            <>
              <button
                onClick={() => exportPRsToExcel(purchaseRequisitions)}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-all cursor-pointer"
                title="Export all PRs to Excel spreadsheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Export Excel</span>
              </button>
              <button
                onClick={() => setIsPRModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New PR</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => exportPOsToExcel(purchaseOrders)}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-all cursor-pointer"
                title="Export all POs to Excel spreadsheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Export Excel</span>
              </button>
              <button
                onClick={() => setIsDirectPOModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Direct PO</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sub-tabs & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setActiveSubTab('pr');
              setStatusFilter('all');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'pr'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Purchase Requisitions (PR) ({purchaseRequisitions.length})
          </button>
          <button
            onClick={() => {
              setActiveSubTab('po');
              setStatusFilter('all');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'po'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Purchase Orders (PO) ({purchaseOrders.length})
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by code, name, vendor..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-800 text-xs bg-slate-900 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-56"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-800 text-xs bg-slate-900 text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            {activeSubTab === 'pr' ? (
              <>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="converted_to_po">Converted to PO</option>
                <option value="rejected">Rejected</option>
              </>
            ) : (
              <>
                <option value="issued">Issued / In-Transit</option>
                <option value="partially_received">Partially Received</option>
                <option value="completed">Completed</option>
                <option value="draft">Draft</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* SECTION 1: PURCHASE REQUISITIONS (PR) */}
      {activeSubTab === 'pr' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPRs.map(pr => {
              const urgencyColor =
                pr.urgency === 'urgent'
                  ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                  : pr.urgency === 'high'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                  : 'bg-slate-800 text-slate-300 border-slate-700';

              const statusColor =
                pr.status === 'approved'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                  : pr.status === 'pending'
                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/50'
                  : pr.status === 'converted_to_po'
                  ? 'bg-purple-950 text-purple-300 border border-purple-800/50'
                  : 'bg-rose-950 text-rose-300 border border-rose-800/50';

              return (
                <div
                  key={pr.id}
                  className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-slate-700 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white">{pr.prNumber}</span>
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${urgencyColor}`}>
                          {pr.urgency}
                        </span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${statusColor}`}>
                          {pr.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 text-xs font-medium text-white">{pr.department}</div>
                    <div className="text-[11px] text-slate-400">Requested by: {pr.requestedBy}</div>
                    <div className="text-[11px] text-slate-400">
                      Req Date: {pr.requestDate} • Target Due: {pr.requiredDate}
                    </div>

                    {/* Items preview */}
                    <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5">
                      <div className="text-[11px] font-semibold text-slate-300">Requested Items:</div>
                      {pr.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-slate-400">
                          <span className="truncate pr-2">{item.itemName}</span>
                          <span className="font-bold text-slate-200 shrink-0">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {pr.notes && (
                      <div className="mt-3 p-2 rounded-xl bg-slate-950 text-[11px] text-slate-400 border border-slate-800 italic">
                        "{pr.notes}"
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Est. Total Cost:</span>
                      <span className="font-bold text-white text-sm">{formatCurrency(pr.totalEstimatedCost)}</span>
                    </div>

                    {/* PR Operations Toolbar: View & Print Slip, Download PDF, Edit, Delete */}
                    <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-800/60">
                      <button
                        onClick={() => setSelectedPRForPreview(pr)}
                        className="flex-1 flex items-center justify-center space-x-1 py-1 px-2 rounded-lg bg-sky-900/60 hover:bg-sky-800/80 text-sky-200 hover:text-white text-[11px] font-semibold transition-colors cursor-pointer border border-sky-700/50"
                        title="Direct View & Print Purchase Requisition Voucher"
                      >
                        <Printer className="w-3 h-3 text-sky-400" />
                        <span>View & Print</span>
                      </button>

                      <button
                        onClick={() => exportPRSlipPDF(pr)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700/50"
                        title="Download official PR document as PDF"
                      >
                        <Download className="w-3.5 h-3.5 text-indigo-400" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedPRForEdit(pr);
                          setIsEditPRModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-200 transition-colors cursor-pointer border border-slate-700/50"
                        title="Edit PR specifications and quantities"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete Requisition ${pr.prNumber}? This cannot be undone.`)) {
                            deletePR(pr.id);
                          }
                        }}
                        className="p-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 transition-colors cursor-pointer border border-rose-800/40"
                        title="Delete Requisition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Action buttons based on status */}
                    <div className="flex space-x-2 pt-1">
                      {pr.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updatePRStatus(pr.id, 'approved')}
                            className="flex-1 flex items-center justify-center space-x-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer transition-colors shadow-sm"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Approve PR</span>
                          </button>
                          <button
                            onClick={() => updatePRStatus(pr.id, 'rejected')}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold cursor-pointer border border-rose-800/60 transition-colors"
                            title="Reject PR"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}

                      {pr.status === 'approved' && (
                        <button
                          onClick={() => handleOpenConvertModal(pr)}
                          className="w-full flex items-center justify-center space-x-1.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer transition-colors shadow-md shadow-indigo-600/25"
                        >
                          <span>Convert to Purchase Order</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {pr.status === 'converted_to_po' && (
                        <div className="w-full py-1 text-center text-xs font-medium text-purple-300 bg-purple-950/60 rounded-xl border border-purple-800/60">
                          Converted to Formal PO
                        </div>
                      )}

                      {pr.status === 'rejected' && (
                        <div className="w-full py-1 text-center text-xs font-medium text-rose-300 bg-rose-950/60 rounded-xl border border-rose-800/60">
                          Requisition Rejected
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: PURCHASE ORDERS (PO) */}
      {activeSubTab === 'po' && (
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">PO Number</th>
                    <th className="py-3 px-4">Vendor</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Expected Delivery</th>
                    <th className="py-3 px-4">Fulfillment Progress</th>
                    <th className="py-3 px-4 text-right">Grand Total</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredPOs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No purchase orders found matching current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredPOs.map(po => {
                      const totalOrdered = po.items.reduce((acc, i) => acc + i.orderedQty, 0);
                      const totalReceived = po.items.reduce((acc, i) => acc + i.receivedQty, 0);
                      const progressPct = totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 0;

                      const statusColor =
                        po.status === 'completed'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                          : po.status === 'partially_received'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                          : po.status === 'issued'
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'
                          : 'bg-slate-800 text-slate-300 border border-slate-700';

                      return (
                        <tr key={po.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                            <div>{po.poNumber}</div>
                            {po.prNumber && (
                              <div className="text-[10px] text-slate-400 font-normal">Ref: {po.prNumber}</div>
                            )}
                          </td>
                          <td className="py-3 px-4 font-medium text-white">{po.vendorName}</td>
                          <td className="py-3 px-4 text-slate-400">{po.orderDate}</td>
                          <td className="py-3 px-4 font-medium text-slate-300">{po.expectedDeliveryDate}</td>
                          <td className="py-3 px-4 w-44">
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="text-slate-400">
                                {formatNumber(totalReceived)} / {formatNumber(totalOrdered)} Units
                              </span>
                              <span className="font-bold text-slate-200">{progressPct}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${
                                  progressPct === 100
                                    ? 'bg-emerald-500'
                                    : progressPct > 0
                                    ? 'bg-amber-500'
                                    : 'bg-slate-600'
                                }`}
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-white">
                            {formatCurrency(po.grandTotal)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${statusColor}`}>
                              {po.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => exportPOSlipPDF(po)}
                              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 font-semibold text-xs inline-flex items-center cursor-pointer transition-colors border border-slate-700/50"
                              title="Download Purchase Order PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setSelectedPOForPreview(po)}
                              className="px-2 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs inline-flex items-center space-x-1 cursor-pointer transition-colors border border-slate-700/50"
                              title="Print / View Purchase Order Document"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">View</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedPOForEdit(po);
                                setIsEditPOModalOpen(true);
                              }}
                              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-xs inline-flex items-center cursor-pointer transition-colors border border-slate-700/50"
                              title="Edit Purchase Order terms & items"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete Purchase Order ${po.poNumber}? This cannot be undone.`)) {
                                  deletePO(po.id);
                                }
                              }}
                              className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 font-semibold text-xs inline-flex items-center cursor-pointer transition-colors border border-rose-800/40"
                              title="Delete Purchase Order"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            {(po.status === 'issued' || po.status === 'partially_received') && onNavigateToGRNWithPO && (
                              <button
                                onClick={() => onNavigateToGRNWithPO(po.id)}
                                className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs inline-flex items-center space-x-1 cursor-pointer transition-colors shadow-sm"
                                title="Process Inward Goods Receipt"
                              >
                                <Package className="w-3.5 h-3.5" />
                                <span>Receive</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE PURCHASE REQUISITION */}
      {isPRModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-800 text-slate-100 my-8">
            <h2 className="text-lg font-bold text-white mb-1">Create Purchase Requisition (PR)</h2>
            <p className="text-xs text-slate-400 mb-4">
              Submit material request for procurement review and managerial authorization.
            </p>

            <form onSubmit={handleSubmitPR} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Requesting Department</label>
                  <input
                    type="text"
                    required
                    value={prDept}
                    onChange={e => setPrDept(e.target.value)}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Requester Name & Title</label>
                  <input
                    type="text"
                    required
                    value={prRequester}
                    onChange={e => setPrRequester(e.target.value)}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Priority / Urgency</label>
                  <select
                    value={prUrgency}
                    onChange={e => setPrUrgency(e.target.value as UrgencyLevel)}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="low">Low - Routine Inventory</option>
                    <option value="medium">Medium - Standard Buffer</option>
                    <option value="high">High - Safety Stock Low</option>
                    <option value="urgent">Urgent - Line Stoppage Risk</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Required By Date</label>
                  <input
                    type="date"
                    required
                    value={prRequiredDate}
                    onChange={e => setPrRequiredDate(e.target.value)}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-slate-200">Required Line Items</span>
                  <button
                    type="button"
                    onClick={handleAddPRItem}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 mr-0.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {prSelectedItems.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <select
                        value={item.itemId}
                        onChange={e => handleUpdatePRItem(idx, 'itemId', e.target.value)}
                        className="flex-1 p-1.5 border border-slate-700 bg-slate-800 text-white rounded-lg text-xs"
                      >
                        {items.map(i => (
                          <option key={i.id} value={i.id}>
                            {i.sku} - {i.name}
                          </option>
                        ))}
                      </select>

                      <div className="w-20">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={e => handleUpdatePRItem(idx, 'quantity', Number(e.target.value))}
                          className="w-full p-1.5 border border-slate-700 bg-slate-800 text-white rounded-lg text-xs text-right"
                        />
                      </div>

                      <div className="w-24">
                        <input
                          type="number"
                          min="0"
                          placeholder="Unit Cost"
                          value={item.estimatedCost}
                          onChange={e => handleUpdatePRItem(idx, 'estimatedCost', Number(e.target.value))}
                          className="w-full p-1.5 border border-slate-700 bg-slate-800 text-white rounded-lg text-xs text-right"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemovePRItem(idx)}
                        disabled={prSelectedItems.length <= 1}
                        className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer disabled:opacity-30"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Justification & Operations Notes</label>
                <textarea
                  rows={2}
                  value={prNotes}
                  onChange={e => setPrNotes(e.target.value)}
                  placeholder="Explain why this material is needed..."
                  className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPRModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer shadow-md shadow-indigo-600/25"
                >
                  Submit Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONVERT PR TO PO WIZARD */}
      {isConvertModalOpen && selectedPRForConvert && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-800 text-slate-100 my-8">
            <h2 className="text-lg font-bold text-white mb-1">Issue Formal Purchase Order</h2>
            <p className="text-xs text-slate-400 mb-4">
              Converting Requisition <span className="font-mono font-bold text-indigo-400">{selectedPRForConvert.prNumber}</span> to Vendor Purchase Order.
            </p>

            <form onSubmit={handleConfirmConvert} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Awarded Vendor</label>
                <select
                  value={convertVendorId}
                  onChange={e => setConvertVendorId(e.target.value)}
                  className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs"
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} (★ {v.rating.toFixed(1)} • {v.paymentTerms})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={convertPaymentTerms}
                    onChange={e => setConvertPaymentTerms(e.target.value)}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    required
                    value={convertDeliveryDate}
                    onChange={e => setConvertDeliveryDate(e.target.value)}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Shipping & Inward Freight Terms</label>
                <input
                  type="text"
                  value={convertShippingTerms}
                  onChange={e => setConvertShippingTerms(e.target.value)}
                  className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Delivery Bay Address</label>
                <input
                  type="text"
                  value={convertDeliveryAddress}
                  onChange={e => setConvertDeliveryAddress(e.target.value)}
                  className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs"
                />
              </div>

              {/* Items summary */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="font-semibold text-slate-200 block mb-1">Included Items ({selectedPRForConvert.items.length}):</span>
                {selectedPRForConvert.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] text-slate-400">
                    <span>{i.itemName} (x{i.quantity})</span>
                    <span className="font-medium text-slate-200">{formatCurrency(i.quantity * i.estimatedCost)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsConvertModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer shadow-md shadow-indigo-600/25"
                >
                  Confirm & Dispatch PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DIRECT PO CREATION */}
      {isDirectPOModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-800 text-slate-100 my-8">
            <h2 className="text-lg font-bold text-white mb-1">Generate Direct Purchase Order</h2>
            <p className="text-xs text-slate-400 mb-4">
              Direct procurement order bypassing formal departmental PR.
            </p>

            <form onSubmit={handleSubmitDirectPO} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Vendor / Supplier</label>
                <select
                  value={directVendorId}
                  onChange={e => setDirectVendorId(e.target.value)}
                  className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs"
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} (★ {v.rating.toFixed(1)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Expected Delivery Date</label>
                <input
                  type="date"
                  required
                  value={directDueDate}
                  onChange={e => setDirectDueDate(e.target.value)}
                  className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs"
                />
              </div>

              {/* Items */}
              <div className="pt-2 border-t border-slate-800">
                <span className="font-semibold text-slate-200 block mb-2">Order Line Items</span>
                {directItems.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2 bg-slate-950 p-2 rounded-xl border border-slate-800 mb-2">
                    <select
                      value={item.itemId}
                      onChange={e => {
                        const found = items.find(i => i.id === e.target.value);
                        if (found) {
                          const copy = [...directItems];
                          copy[idx] = {
                            ...copy[idx],
                            itemId: found.id,
                            itemName: found.name,
                            sku: found.sku,
                            unitPrice: found.unitCost
                          };
                          setDirectItems(copy);
                        }
                      }}
                      className="flex-1 p-1.5 border border-slate-700 bg-slate-800 text-white rounded-lg text-xs"
                    >
                      {items.map(i => (
                        <option key={i.id} value={i.id}>
                          {i.sku} - {i.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.orderedQty}
                      onChange={e => {
                        const copy = [...directItems];
                        copy[idx].orderedQty = Number(e.target.value);
                        setDirectItems(copy);
                      }}
                      className="w-20 p-1.5 border border-slate-700 bg-slate-800 text-white rounded-lg text-xs text-right"
                    />

                    <input
                      type="number"
                      min="0"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={e => {
                        const copy = [...directItems];
                        copy[idx].unitPrice = Number(e.target.value);
                        setDirectItems(copy);
                      }}
                      className="w-24 p-1.5 border border-slate-700 bg-slate-800 text-white rounded-lg text-xs text-right"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDirectPOModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer shadow-md shadow-indigo-600/25"
                >
                  Issue Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW / PRINT PURCHASE ORDER */}
      {selectedPOForPreview && (
        <PODocumentModal po={selectedPOForPreview} onClose={() => setSelectedPOForPreview(null)} />
      )}

      {/* MODAL: VIEW / PRINT PURCHASE REQUISITION */}
      {selectedPRForPreview && (
        <PRDocumentModal pr={selectedPRForPreview} onClose={() => setSelectedPRForPreview(null)} />
      )}

      {/* MODAL: EDIT PURCHASE REQUISITION */}
      {isEditPRModalOpen && selectedPRForEdit && (
        <EditPRModal
          isOpen={isEditPRModalOpen}
          onClose={() => {
            setIsEditPRModalOpen(false);
            setSelectedPRForEdit(null);
          }}
          pr={selectedPRForEdit}
          availableItems={items}
          onSave={(id, updates) => editPR(id, updates)}
        />
      )}

      {/* MODAL: EDIT PURCHASE ORDER */}
      {isEditPOModalOpen && selectedPOForEdit && (
        <EditPOModal
          isOpen={isEditPOModalOpen}
          onClose={() => {
            setIsEditPOModalOpen(false);
            setSelectedPOForEdit(null);
          }}
          po={selectedPOForEdit}
          vendors={vendors}
          availableItems={items}
          onSave={(id, updates) => editPO(id, updates)}
        />
      )}
    </div>
  );
};
