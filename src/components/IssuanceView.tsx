import React, { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  Download,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
  Trash2,
  X,
  AlertTriangle,
  Building2,
  Truck,
  UserCheck,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  FileSpreadsheet,
  Package,
  Layers
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { useAuth } from '../context/AuthContext';
import { StockIssuanceGatePass, GatePassType, GatePassStatus, GatePassItem } from '../types';
import {
  exportGatePassPDF,
  exportGatePassRegisterToExcel,
  exportGatePassRegisterToPDF
} from '../utils/exportUtils';
import { formatNumber } from '../utils/formatters';
import { triggerDirectPrint } from '../utils/printHelper';

export const IssuanceView: React.FC<{ preSelectedItemId?: string | null }> = ({ preSelectedItemId }) => {
  const {
    items,
    zones,
    gatePasses,
    createGatePass,
    updateGatePassStatus,
    deleteGatePass,
    returnGatePassItems
  } = useWarehouse();
  const { currentUser, systemSettings, logAction } = useAuth();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'non_returnable' | 'returnable'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPassForPrint, setSelectedPassForPrint] = useState<StockIssuanceGatePass | null>(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [passToReturn, setPassToReturn] = useState<StockIssuanceGatePass | null>(null);
  const [returnNotes, setReturnNotes] = useState('');

  // Create Form State
  const [passType, setPassType] = useState<GatePassType>('non_returnable');
  const [department, setDepartment] = useState('');
  const [issuedTo, setIssuedTo] = useState('');
  const [carrierName, setCarrierName] = useState('');
  const [carrierCnic, setCarrierCnic] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [purpose, setPurpose] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [warehouseZone, setWarehouseZone] = useState('Z-RAW');
  const [issuedBy, setIssuedBy] = useState(currentUser?.name || 'Warehouse Supervisor');
  const [authorizedBy, setAuthorizedBy] = useState('Tahir Abbas (Plant Manager)');
  const [remarks, setRemarks] = useState('');

  // Items to Issue State
  const [formItems, setFormItems] = useState<
    Array<{
      itemId: string;
      quantity: number;
      remarks: string;
    }>
  >([
    {
      itemId: preSelectedItemId || (items[0] ? items[0].id : ''),
      quantity: 1,
      remarks: ''
    }
  ]);

  const [formError, setFormError] = useState('');

  // Initialize with preselected item if opened with one
  React.useEffect(() => {
    if (preSelectedItemId) {
      const itm = items.find(i => i.id === preSelectedItemId);
      if (itm) {
        setFormItems([{ itemId: itm.id, quantity: 1, remarks: '' }]);
        setIsCreateModalOpen(true);
      }
    }
  }, [preSelectedItemId, items]);

  // Filtered Passes
  const filteredPasses = useMemo(() => {
    return gatePasses.filter(gp => {
      // Type filter
      if (filterType !== 'all' && gp.passType !== filterType) return false;

      // Status filter
      if (filterStatus !== 'all' && gp.status !== filterStatus) return false;

      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesNumber = gp.gatePassNumber.toLowerCase().includes(query) || gp.issuanceNumber.toLowerCase().includes(query);
        const matchesDept = gp.department.toLowerCase().includes(query) || gp.issuedTo.toLowerCase().includes(query);
        const matchesCarrier = (gp.carrierName || '').toLowerCase().includes(query) || (gp.vehicleNumber || '').toLowerCase().includes(query);
        const matchesItem = gp.items.some(i => i.itemName.toLowerCase().includes(query) || i.sku.toLowerCase().includes(query));
        return matchesNumber || matchesDept || matchesCarrier || matchesItem;
      }

      return true;
    });
  }, [gatePasses, filterType, filterStatus, searchTerm]);

  // Statistics
  const totalCount = gatePasses.length;
  const nrgpCount = gatePasses.filter(p => p.passType === 'non_returnable').length;
  const rgpActiveCount = gatePasses.filter(p => p.passType === 'returnable' && p.status !== 'returned').length;
  const clearedGateCount = gatePasses.filter(p => p.status === 'cleared_at_gate').length;

  // Add Item Line in Form
  const handleAddFormItem = () => {
    const available = items.find(i => !formItems.some(fi => fi.itemId === i.id) && i.quantityOnHand > 0);
    const fallbackId = available ? available.id : items[0]?.id || '';
    setFormItems(prev => [...prev, { itemId: fallbackId, quantity: 1, remarks: '' }]);
  };

  // Remove Item Line
  const handleRemoveFormItem = (index: number) => {
    if (formItems.length <= 1) return;
    setFormItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Update Item in Form
  const handleUpdateFormItem = (index: number, field: string, value: any) => {
    setFormItems(prev =>
      prev.map((item, idx) => {
        if (idx === index) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  // Handle Form Submission
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!department.trim() || !issuedTo.trim() || !purpose.trim()) {
      setFormError('Please fill in required fields: Recipient Department, Person Issued To, and Purpose.');
      return;
    }

    if (passType === 'returnable' && !expectedReturnDate) {
      setFormError('Please set an Expected Return Date for Returnable Gate Pass (RGP).');
      return;
    }

    // Validate quantities against stock on hand
    const builtItems: GatePassItem[] = [];
    for (const fi of formItems) {
      if (!fi.itemId) {
        setFormError('Please select a valid item for all line entries.');
        return;
      }
      const invItem = items.find(i => i.id === fi.itemId);
      if (!invItem) {
        setFormError('Selected item not found in warehouse master.');
        return;
      }
      if (fi.quantity <= 0) {
        setFormError(`Quantity for ${invItem.name} must be at least 1.`);
        return;
      }
      if (fi.quantity > invItem.quantityOnHand) {
        setFormError(
          `Insufficient stock for "${invItem.name}" (${invItem.sku}). Requested: ${fi.quantity} ${invItem.unit}, Available in Warehouse: ${invItem.quantityOnHand} ${invItem.unit}.`
        );
        return;
      }

      builtItems.push({
        itemId: invItem.id,
        itemName: invItem.name,
        sku: invItem.sku,
        quantity: fi.quantity,
        unit: invItem.unit,
        unitCost: invItem.unitCost,
        remarks: fi.remarks.trim() || `${passType === 'returnable' ? 'RGP' : 'NRGP'} Issue`
      });
    }

    if (builtItems.length === 0) {
      setFormError('At least one item must be included.');
      return;
    }

    const newPass = createGatePass({
      passType,
      issueDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      expectedReturnDate: passType === 'returnable' ? expectedReturnDate : undefined,
      department: department.trim(),
      issuedTo: issuedTo.trim(),
      carrierName: carrierName.trim() || 'Store Porter',
      carrierCnic: carrierCnic.trim() || undefined,
      vehicleNumber: vehicleNumber.trim() || 'Internal Transfer / Hand Carry',
      purpose: purpose.trim(),
      warehouseZone,
      issuedBy: issuedBy.trim(),
      authorizedBy: authorizedBy.trim(),
      items: builtItems,
      remarks: remarks.trim() || undefined
    });

    logAction(
      'gatepass_created',
      `Issued ${newPass.passType.toUpperCase()} Gate Pass ${newPass.gatePassNumber} (${builtItems.length} items to ${department})`
    );

    // Reset Form
    setIsCreateModalOpen(false);
    setDepartment('');
    setIssuedTo('');
    setCarrierName('');
    setCarrierCnic('');
    setVehicleNumber('');
    setPurpose('');
    setExpectedReturnDate('');
    setRemarks('');
    setFormItems([{ itemId: items[0]?.id || '', quantity: 1, remarks: '' }]);

    // Automatically open the print voucher preview for the newly generated Gate Pass!
    setSelectedPassForPrint(newPass);
  };

  // Gate Security Clearance Handler
  const handleClearAtGate = (gp: StockIssuanceGatePass) => {
    const officer = currentUser?.name || 'Sub. Rtd. Ghulam Haider (Main Gate)';
    updateGatePassStatus(gp.id, 'cleared_at_gate', officer);
    logAction('gatepass_cleared', `Main Gate security cleared outward pass ${gp.gatePassNumber} (${gp.vehicleNumber})`);
  };

  // Return RGP Handler
  const handleOpenReturnModal = (gp: StockIssuanceGatePass) => {
    setPassToReturn(gp);
    setReturnNotes('');
    setIsReturnModalOpen(true);
  };

  const handleConfirmReturn = () => {
    if (!passToReturn) return;
    const returner = currentUser?.name || 'Store Receiving Officer';
    returnGatePassItems(passToReturn.id, returner, returnNotes);
    logAction('gatepass_returned', `Received returned materials for RGP ${passToReturn.gatePassNumber}`);
    setIsReturnModalOpen(false);
    setPassToReturn(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Stock Issuance & Gate Pass Portal
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  RGP & NRGP
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Issue materials from warehouse, deduct stock, and print official security-cleared Gate Passes.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportGatePassRegisterToExcel(gatePasses)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold cursor-pointer transition shadow-xs"
            title="Export all gate passes to Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Excel Register</span>
          </button>

          <button
            onClick={() => exportGatePassRegisterToPDF(gatePasses)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold cursor-pointer transition shadow-xs"
            title="Export gate pass summary to PDF"
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            <span>PDF Register</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer transition shadow-md shadow-indigo-600/25"
          >
            <Plus className="w-4 h-4" />
            <span>New Stock Issue & Gate Pass</span>
          </button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">{formatNumber(totalCount)}</div>
            <div className="text-xs text-slate-400 font-medium">Total Passes Issued</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">{formatNumber(nrgpCount)}</div>
            <div className="text-xs text-slate-400 font-medium">Non-Returnable (NRGP)</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-400 font-mono">{formatNumber(rgpActiveCount)}</div>
            <div className="text-xs text-slate-400 font-medium">Active Returnable (RGP)</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">{formatNumber(clearedGateCount)}</div>
            <div className="text-xs text-slate-400 font-medium">Cleared at Security Gate</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Gate Pass #, vehicle, dept, SKU..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Type Filter Buttons */}
          <div className="flex p-1 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                filterType === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setFilterType('non_returnable')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                filterType === 'non_returnable' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              NRGP (Outward)
            </button>
            <button
              onClick={() => setFilterType('returnable')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                filterType === 'returnable' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              RGP (Returnable)
            </button>
          </div>

          {/* Status Dropdown */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Gate Statuses</option>
            <option value="issued">Issued / Ready</option>
            <option value="cleared_at_gate">Cleared at Gate</option>
            <option value="returned">Returned (RGP Closed)</option>
          </select>
        </div>
      </div>

      {/* Gate Pass Register Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-300">
            Showing <span className="text-white font-bold">{filteredPasses.length}</span> recorded Gate Passes
          </div>
          <span className="text-[11px] text-slate-400">
            Official legal documentation for factory gatehouse & security
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Gate Pass #</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Consignee / Recipient</th>
                <th className="py-3 px-4">Carrier / Vehicle</th>
                <th className="py-3 px-4">Items Summary</th>
                <th className="py-3 px-4">Gate Status</th>
                <th className="py-3 px-4 text-right">Actions & Print</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPasses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Truck className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No Gate Passes match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredPasses.map(gp => {
                  const isRGP = gp.passType === 'returnable';
                  const totalUnits = gp.items.reduce((acc, i) => acc + i.quantity, 0);

                  return (
                    <tr key={gp.id} className="hover:bg-slate-800/40 transition">
                      {/* Gate Pass Number & Ref */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-white flex items-center gap-1.5">
                          {gp.gatePassNumber}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{gp.issuanceNumber}</div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isRGP ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/60 inline-flex items-center gap-1">
                            <RotateCcw className="w-3 h-3" />
                            Returnable (RGP)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 inline-flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" />
                            Non-Returnable (NRGP)
                          </span>
                        )}
                        {isRGP && gp.expectedReturnDate && (
                          <div className="text-[10px] text-amber-400/80 mt-0.5">
                            Due: {gp.expectedReturnDate}
                          </div>
                        )}
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-300 font-mono text-[11px]">
                        {gp.issueDate}
                      </td>

                      {/* Consignee */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-100">{gp.department}</div>
                        <div className="text-[10px] text-slate-400">{gp.issuedTo}</div>
                      </td>

                      {/* Carrier / Vehicle */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-200">{gp.vehicleNumber || 'Hand Carry'}</div>
                        <div className="text-[10px] text-slate-400">{gp.carrierName || 'Store Porter'}</div>
                      </td>

                      {/* Items */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">
                          {totalUnits} Units ({gp.items.length} line{gp.items.length > 1 ? 's' : ''})
                        </div>
                        <div className="text-[10px] text-slate-400 max-w-xs truncate" title={gp.items.map(i => `${i.sku} (${i.quantity} ${i.unit})`).join(', ')}>
                          {gp.items.map(i => `${i.sku} (${i.quantity})`).join(', ')}
                        </div>
                      </td>

                      {/* Gate Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {gp.status === 'cleared_at_gate' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Gate Cleared
                          </span>
                        )}
                        {gp.status === 'issued' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-950/80 text-blue-300 border border-blue-800/60 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Issued / At Store
                          </span>
                        )}
                        {gp.status === 'returned' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-950/80 text-purple-300 border border-purple-800/60 inline-flex items-center gap-1">
                            <RotateCcw className="w-3 h-3" />
                            Stock Returned
                          </span>
                        )}
                        {gp.gateOutTimestamp && (
                          <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                            Out: {gp.gateOutTimestamp}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 whitespace-nowrap text-right space-x-1.5">
                        {/* PRINT VOUCHER MODAL */}
                        <button
                          onClick={() => setSelectedPassForPrint(gp)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-medium cursor-pointer transition inline-flex items-center gap-1 shadow-xs"
                          title="View & Print Official Gate Pass Voucher"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Pass</span>
                        </button>

                        {/* DIRECT PDF DOWNLOAD */}
                        <button
                          onClick={() => exportGatePassPDF(gp, systemSettings.companyName)}
                          className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition inline-block align-middle"
                          title="Download Gate Pass PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {/* GATE CLEARANCE BUTTON (For Security / Storekeeper) */}
                        {gp.status === 'issued' && (
                          <button
                            onClick={() => handleClearAtGate(gp)}
                            className="px-2 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[11px] font-semibold cursor-pointer transition inline-flex items-center gap-1"
                            title="Stamp Outward Clearance by Gate Security"
                          >
                            <ShieldAlert className="w-3 h-3" />
                            <span>Gate Out</span>
                          </button>
                        )}

                        {/* RGP RETURN BUTTON (If returnable and not yet returned) */}
                        {isRGP && gp.status !== 'returned' && (
                          <button
                            onClick={() => handleOpenReturnModal(gp)}
                            className="px-2 py-1 rounded-lg bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 text-[11px] font-semibold cursor-pointer transition inline-flex items-center gap-1"
                            title="Restock returned materials back into inventory"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Return Stock</span>
                          </button>
                        )}

                        {/* DELETE / VOID */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to void/delete Gate Pass ${gp.gatePassNumber}?`)) {
                              deleteGatePass(gp.id);
                              logAction('user_updated', `Deleted Gate Pass voucher ${gp.gatePassNumber}`, 'warning');
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 cursor-pointer transition inline-block align-middle"
                          title="Void Gate Pass"
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

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW STOCK ISSUE & GATE PASS */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-800 text-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-indigo-400" />
                  New Warehouse Stock Issue & Gate Pass
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Authorize material issuance, update warehouse inventory count, and generate gate pass.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              {/* Gate Pass Type Selector */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <label className="block text-slate-300 font-semibold mb-2">Gate Pass Classification</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                      passType === 'non_returnable'
                        ? 'bg-indigo-950/60 border-indigo-600 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="passType"
                      checked={passType === 'non_returnable'}
                      onChange={() => setPassType('non_returnable')}
                      className="mt-0.5 text-indigo-600 focus:ring-0"
                    />
                    <div>
                      <div className="font-bold text-slate-100">Non-Returnable (NRGP)</div>
                      <div className="text-[11px] text-slate-400">
                        For production consumption, scrap dispatch, or permanent shipment.
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                      passType === 'returnable'
                        ? 'bg-amber-950/60 border-amber-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="passType"
                      checked={passType === 'returnable'}
                      onChange={() => setPassType('returnable')}
                      className="mt-0.5 text-amber-500 focus:ring-0"
                    />
                    <div>
                      <div className="font-bold text-slate-100">Returnable (RGP)</div>
                      <div className="text-[11px] text-slate-400">
                        For outside maintenance, testing, vendor repairs, or sample evaluation.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Destination & Consignee */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Destination / Recipient Department *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Plant 1 Fabrication, Maintenance Bay, Apex Engineering"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Recipient Person Name / Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engr. Kamran Siddiqui (Plant Lead)"
                    value={issuedTo}
                    onChange={e => setIssuedTo(e.target.value)}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Transport & Carrier Details */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-indigo-400" />
                  <span>Carrier & Logistics Information</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Carrier / Driver Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Muhammad Rasheed"
                      value={carrierName}
                      onChange={e => setCarrierName(e.target.value)}
                      className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Driver CNIC / National ID</label>
                    <input
                      type="text"
                      placeholder="e.g. 37405-8291043-1"
                      value={carrierCnic}
                      onChange={e => setCarrierCnic(e.target.value)}
                      className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Vehicle Registration #</label>
                    <input
                      type="text"
                      placeholder="e.g. Truck LEA-8840 / Hand Carry"
                      value={vehicleNumber}
                      onChange={e => setVehicleNumber(e.target.value)}
                      className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {passType === 'returnable' && (
                  <div>
                    <label className="block text-amber-300 font-semibold text-[11px] mb-1">
                      Expected Return Date (Required for RGP) *
                    </label>
                    <input
                      type="date"
                      required
                      value={expectedReturnDate}
                      onChange={e => setExpectedReturnDate(e.target.value)}
                      className="w-full p-2 border border-amber-700/60 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-indigo-400" />
                    <span>Warehouse Items to Issue (Stock Will Be Deducted)</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleAddFormItem}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold cursor-pointer transition flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {formItems.map((fi, idx) => {
                    const currentInvItem = items.find(i => i.id === fi.itemId);
                    const isOverStock = currentInvItem && fi.quantity > currentInvItem.quantityOnHand;

                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border ${
                          isOverStock ? 'border-rose-700 bg-rose-950/20' : 'border-slate-800 bg-slate-900'
                        } flex flex-col md:flex-row gap-2 items-start md:items-center`}
                      >
                        {/* Select Item */}
                        <div className="flex-1 w-full">
                          <label className="block text-[10px] text-slate-400 mb-0.5">Item Master SKU & Name</label>
                          <select
                            value={fi.itemId}
                            onChange={e => handleUpdateFormItem(idx, 'itemId', e.target.value)}
                            className="w-full p-1.5 border border-slate-700 bg-slate-800 text-white rounded-lg text-xs"
                          >
                            {items.map(it => (
                              <option key={it.id} value={it.id}>
                                {it.sku} - {it.name} (Stock: {it.quantityOnHand} {it.unit})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity */}
                        <div className="w-full md:w-32">
                          <div className="flex justify-between items-center text-[10px] text-slate-400 mb-0.5">
                            <span>Qty</span>
                            {currentInvItem && (
                              <span className="text-indigo-400 font-mono">
                                Max: {currentInvItem.quantityOnHand}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="1"
                              max={currentInvItem?.quantityOnHand || 9999}
                              value={fi.quantity}
                              onChange={e => handleUpdateFormItem(idx, 'quantity', Number(e.target.value))}
                              className="w-full p-1.5 border border-slate-700 bg-slate-800 text-white rounded-lg text-xs font-mono font-bold"
                            />
                            <span className="text-[10px] text-slate-400 font-medium shrink-0">
                              {currentInvItem?.unit || 'Units'}
                            </span>
                          </div>
                        </div>

                        {/* Line Remarks */}
                        <div className="w-full md:w-44">
                          <label className="block text-[10px] text-slate-400 mb-0.5">Remarks / Batch #</label>
                          <input
                            type="text"
                            placeholder="Optional batch note"
                            value={fi.remarks}
                            onChange={e => handleUpdateFormItem(idx, 'remarks', e.target.value)}
                            className="w-full p-1.5 border border-slate-700 bg-slate-800 text-white rounded-lg text-xs"
                          />
                        </div>

                        {/* Remove Button */}
                        {formItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFormItem(idx)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 cursor-pointer self-end md:self-center mt-2 md:mt-4"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Purpose & Authorizations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Purpose of Issuance *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Issued for Chassis Line Order #902 or Spindle Calibration"
                    value={purpose}
                    onChange={e => setPurpose(e.target.value)}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Additional Security Remarks</label>
                  <textarea
                    rows={2}
                    placeholder="Special transit precautions or gatehouse verification instructions"
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                  />
                </div>
              </div>

              {/* Signoff Names */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Issued By (Store Officer)</label>
                  <input
                    type="text"
                    required
                    value={issuedBy}
                    onChange={e => setIssuedBy(e.target.value)}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Authorized By (Manager)</label>
                  <input
                    type="text"
                    required
                    value={authorizedBy}
                    onChange={e => setAuthorizedBy(e.target.value)}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Dispatch & Print Gate Pass</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: OFFICIAL PRINTABLE GATE PASS VOUCHER (PRINT & PREVIEW) */}
      {/* ========================================================================= */}
      {selectedPassForPrint && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-800 text-slate-100 my-6 overflow-hidden">
            {/* Top Toolbar (Non-printable) */}
            <div className="no-print p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Printer className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-white">Official Gate Pass Print Preview</span>
                <span className="text-xs text-slate-400">
                  ({selectedPassForPrint.passType === 'returnable' ? 'Returnable - RGP' : 'Non-Returnable - NRGP'})
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {/* Print button using triggerDirectPrint */}
                <button
                  onClick={() => {
                    const el = document.getElementById(`gatepass-print-${selectedPassForPrint.id}`);
                    if (el) {
                      triggerDirectPrint(el.innerHTML, `KTS_Gate_Pass_${selectedPassForPrint.gatePassNumber}`);
                    } else {
                      window.print();
                    }
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer shadow-md shadow-sky-600/25 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Direct Print</span>
                </button>

                {/* PDF Download Button */}
                <button
                  onClick={() => exportGatePassPDF(selectedPassForPrint, systemSettings.companyName)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>

                <button
                  onClick={() => setSelectedPassForPrint(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Paper Document Container */}
            <div className="p-6 md:p-8 bg-slate-900 overflow-y-auto max-h-[80vh] flex justify-center">
              <div
                id={`gatepass-print-${selectedPassForPrint.id}`}
                className="printable-gatepass bg-white text-slate-900 w-full max-w-2xl p-8 rounded-lg shadow-xl border border-slate-300 font-sans"
              >
                {/* Document Header */}
                <div className="border-b-2 border-slate-900 pb-4 mb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-lg bg-white border border-slate-300 p-1 flex items-center justify-center shrink-0">
                        <img
                          src="/kts-logo.png"
                          alt="KTS Logo"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = '<span class="font-black text-xs text-blue-900">KTS</span>';
                          }}
                        />
                      </div>
                      <div>
                        <h1 className="text-xl font-black tracking-tight text-slate-950 uppercase">
                          {systemSettings.companyName || 'KARACHI TRANSPORT SERVICE (KTS)'}
                        </h1>
                        <div className="text-xs font-semibold text-slate-700">
                          PROCUREMENT & CENTRAL FLEET WAREHOUSE • OFFICIAL MATERIAL GATE PASS
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Facility: {systemSettings.facilityCode || 'KTS-MALIR-DEPOT-01'} • Government of Sindh Transit Partner
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-black rounded uppercase border ${
                          selectedPassForPrint.passType === 'returnable'
                            ? 'bg-amber-100 text-amber-900 border-amber-400'
                            : 'bg-slate-900 text-white border-slate-900'
                        }`}
                      >
                        {selectedPassForPrint.passType === 'returnable'
                          ? 'RETURNABLE GATE PASS (RGP)'
                          : 'NON-RETURNABLE GATE PASS (NRGP)'}
                      </span>
                      <div className="text-xs font-mono font-bold text-slate-800 mt-1">
                        {selectedPassForPrint.gatePassNumber}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Ref: {selectedPassForPrint.issuanceNumber}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dispatch Details Grid */}
                <div className="bg-slate-50 border border-slate-300 rounded p-3 mb-4 text-xs">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    <div>
                      <span className="font-bold text-slate-600 uppercase text-[10px] block">Consignee / Department:</span>
                      <span className="font-bold text-slate-950">{selectedPassForPrint.department}</span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-600 uppercase text-[10px] block">Vehicle Registration #:</span>
                      <span className="font-bold text-slate-950">{selectedPassForPrint.vehicleNumber || 'Hand Carry'}</span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-600 uppercase text-[10px] block">Person In Charge / Recipient:</span>
                      <span className="font-semibold text-slate-800">{selectedPassForPrint.issuedTo}</span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-600 uppercase text-[10px] block">Carrier / Driver:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedPassForPrint.carrierName || 'Store Porter'}
                        {selectedPassForPrint.carrierCnic && ` (CNIC: ${selectedPassForPrint.carrierCnic})`}
                      </span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-600 uppercase text-[10px] block">Issue Date & Time:</span>
                      <span className="font-mono text-slate-800">{selectedPassForPrint.issueDate}</span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-600 uppercase text-[10px] block">
                        {selectedPassForPrint.passType === 'returnable' ? 'Expected Return Date:' : 'Category:'}
                      </span>
                      <span
                        className={`font-semibold ${
                          selectedPassForPrint.passType === 'returnable' ? 'text-amber-800 font-bold' : 'text-slate-800'
                        }`}
                      >
                        {selectedPassForPrint.passType === 'returnable'
                          ? selectedPassForPrint.expectedReturnDate || 'Within 7 Days'
                          : 'Permanent Outward Dispatch'}
                      </span>
                    </div>

                    <div className="col-span-2 pt-1 border-t border-slate-200">
                      <span className="font-bold text-slate-600 uppercase text-[10px]">Purpose / Reason: </span>
                      <span className="text-slate-800">{selectedPassForPrint.purpose}</span>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="mb-4">
                  <table className="w-full text-left border border-slate-300 text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
                        <th className="py-2 px-2.5 w-8">S#</th>
                        <th className="py-2 px-2.5 w-28">Item Code / SKU</th>
                        <th className="py-2 px-2.5">Item Description & Specifications</th>
                        <th className="py-2 px-2.5 w-16 text-center">UOM</th>
                        <th className="py-2 px-2.5 w-20 text-right">Qty Issued</th>
                        <th className="py-2 px-2.5 w-32">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedPassForPrint.items.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2 px-2.5 text-slate-600">{i + 1}</td>
                          <td className="py-2 px-2.5 font-mono font-bold text-slate-900">{item.sku}</td>
                          <td className="py-2 px-2.5 font-medium text-slate-800">{item.itemName}</td>
                          <td className="py-2 px-2.5 text-center text-slate-600">{item.unit || 'Units'}</td>
                          <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-950">
                            {item.quantity}
                          </td>
                          <td className="py-2 px-2.5 text-slate-600 text-[11px]">{item.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900">
                        <td colSpan={4} className="py-2 px-2.5 text-right uppercase text-[10px]">
                          Total Units Issued:
                        </td>
                        <td className="py-2 px-2.5 text-right font-mono text-sm">
                          {selectedPassForPrint.items.reduce((acc, i) => acc + i.quantity, 0)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Security Declaration */}
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-[10px] text-amber-950 mb-6">
                  <div className="font-bold uppercase mb-0.5">Security Gatehouse Directive:</div>
                  <div>
                    {selectedPassForPrint.passType === 'returnable'
                      ? '1. Goods remain property of the company and must be returned intact by the stipulated date. Security must log inward verification upon return.'
                      : '1. No item shall leave factory gates without physical inspection against this slip. One copy must be retained by Main Security.'}
                  </div>
                </div>

                {/* 4 Official Signature Blocks */}
                <div className="grid grid-cols-4 gap-3 pt-2">
                  <div className="border border-slate-300 rounded p-2 text-center flex flex-col justify-between h-24">
                    <div className="text-[9px] font-bold text-slate-500 uppercase">Prepared / Issued By</div>
                    <div className="border-b border-dashed border-slate-400 my-auto"></div>
                    <div>
                      <div className="font-bold text-[11px] text-slate-900">{selectedPassForPrint.issuedBy}</div>
                      <div className="text-[9px] text-slate-500">Warehouse Officer</div>
                    </div>
                  </div>

                  <div className="border border-slate-300 rounded p-2 text-center flex flex-col justify-between h-24">
                    <div className="text-[9px] font-bold text-slate-500 uppercase">Authorized By</div>
                    <div className="border-b border-dashed border-slate-400 my-auto"></div>
                    <div>
                      <div className="font-bold text-[11px] text-slate-900">{selectedPassForPrint.authorizedBy}</div>
                      <div className="text-[9px] text-slate-500">Department Head</div>
                    </div>
                  </div>

                  <div className="border border-slate-300 rounded p-2 text-center flex flex-col justify-between h-24">
                    <div className="text-[9px] font-bold text-slate-500 uppercase">Carrier / Received By</div>
                    <div className="border-b border-dashed border-slate-400 my-auto"></div>
                    <div>
                      <div className="font-bold text-[11px] text-slate-900">
                        {selectedPassForPrint.carrierName || selectedPassForPrint.issuedTo}
                      </div>
                      <div className="text-[9px] text-slate-500">Transporter / Bearer</div>
                    </div>
                  </div>

                  <div className="border border-slate-300 rounded p-2 text-center flex flex-col justify-between h-24 bg-slate-50">
                    <div className="text-[9px] font-bold text-slate-500 uppercase">Main Gate Checkpoint</div>
                    <div className="border-b border-dashed border-slate-400 my-auto"></div>
                    <div>
                      <div className="font-bold text-[11px] text-slate-900">
                        {selectedPassForPrint.securityOfficer || 'Gate Officer Stamp'}
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono">
                        {selectedPassForPrint.gateOutTimestamp
                          ? `Out: ${selectedPassForPrint.gateOutTimestamp}`
                          : 'Physically Inspected'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Barcode Simulation */}
                <div className="mt-6 pt-3 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>PROWAREHOUSE ERP • GATE SYSTEM</span>
                  <span className="font-bold text-slate-600 tracking-widest uppercase">
                    * {selectedPassForPrint.gatePassNumber} *
                  </span>
                  <span>Printed: {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RETURN RGP MATERIAL */}
      {/* ========================================================================= */}
      {isReturnModalOpen && passToReturn && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-800 text-slate-100">
            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-400" />
              Receive Returned Materials (RGP)
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Restock returnable items back into warehouse inventory and close Gate Pass {passToReturn.gatePassNumber}.
            </p>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 mb-4 text-xs space-y-1">
              <div className="font-mono font-bold text-amber-400">{passToReturn.gatePassNumber}</div>
              <div className="text-slate-300">Department: {passToReturn.department}</div>
              <div className="text-slate-400 text-[11px]">
                Items: {passToReturn.items.map(i => `${i.quantity}x ${i.itemName}`).join(', ')}
              </div>
            </div>

            <div className="space-y-3 text-xs mb-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Return Inspection Notes</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Items returned intact after workshop repair. QC verified."
                  value={returnNotes}
                  onChange={e => setReturnNotes(e.target.value)}
                  className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-amber-500 placeholder-slate-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsReturnModalOpen(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReturn}
                className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer shadow-md shadow-amber-600/25"
              >
                Restock & Close RGP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
