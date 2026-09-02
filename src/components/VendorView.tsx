import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Star,
  Clock,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Briefcase,
  AlertCircle,
  Pencil,
  Trash2,
  Package,
  FileSpreadsheet,
  FileText,
  Download,
  X,
  Boxes
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { Vendor, VendorStatus, InventoryItem } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { EditVendorModal } from './EditVendorModal';
import { EditItemModal } from './EditItemModal';
import { exportVendorsToExcel, exportVendorsToPDF, exportInventoryToExcel } from '../utils/exportUtils';

export const VendorView: React.FC = () => {
  const {
    vendors,
    purchaseOrders,
    items,
    zones,
    addVendor,
    updateVendor,
    deleteVendor,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem
  } = useWarehouse();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);
  const [selectedVendorForDetail, setSelectedVendorForDetail] = useState<Vendor | null>(null);
  const [detailTab, setDetailTab] = useState<'items' | 'orders'>('items');

  // Edit Vendor State
  const [selectedVendorForEdit, setSelectedVendorForEdit] = useState<Vendor | null>(null);
  const [isEditVendorModalOpen, setIsEditVendorModalOpen] = useState(false);

  // Edit Item State
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<InventoryItem | null>(null);
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);

  // Quick Add Item for Selected Vendor
  const [isAddItemForVendorOpen, setIsAddItemForVendorOpen] = useState(false);
  const [vItemSku, setVItemSku] = useState('');
  const [vItemName, setVItemName] = useState('');
  const [vItemCategory, setVItemCategory] = useState('Raw Materials');
  const [vItemUnit, setVItemUnit] = useState('Pieces');
  const [vItemQty, setVItemQty] = useState(100);
  const [vItemReorder, setVItemReorder] = useState(50);
  const [vItemCost, setVItemCost] = useState(1200);

  // New Vendor Form State
  const [vendorName, setVendorName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [leadTimeDays, setLeadTimeDays] = useState(7);
  const [categoriesText, setCategoriesText] = useState('Raw Materials, Spares');

  const filteredVendors = vendors.filter(v => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.categories.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || v.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    const categoriesArray = categoriesText
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    addVendor({
      name: vendorName,
      contactPerson,
      email,
      phone,
      address,
      rating: 4.5,
      onTimeDeliveryRate: 95.0,
      qualityRating: 98.0,
      paymentTerms,
      leadTimeDays: Number(leadTimeDays),
      categories: categoriesArray,
      status: 'active'
    });

    setIsAddVendorModalOpen(false);
    setVendorName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setAddress('');
  };

  const handleCreateItemForVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorForDetail) return;
    if (!vItemSku || !vItemName) {
      alert('Please provide SKU and item name.');
      return;
    }

    addInventoryItem({
      sku: vItemSku.toUpperCase(),
      name: vItemName,
      category: vItemCategory,
      unit: vItemUnit,
      vendorId: selectedVendorForDetail.id,
      vendorName: selectedVendorForDetail.name,
      quantityOnHand: Number(vItemQty) || 0,
      reservedQuantity: 0,
      reorderLevel: Number(vItemReorder) || 0,
      safetyStock: Math.round((Number(vItemReorder) || 0) * 0.4),
      unitCost: Number(vItemCost) || 0,
      warehouseZone: 'Z-RAW',
      aisle: 'A-01',
      shelf: 'S-01',
      bin: 'B-01'
    });

    setIsAddItemForVendorOpen(false);
    setVItemSku('');
    setVItemName('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Vendor & Supplier Management</h1>
          <p className="text-xs text-slate-400">
            Approved vendor directory, vendor-wise item catalog, OTD scorecards, and commercial spend.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportVendorsToExcel(vendors)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-all cursor-pointer"
            title="Export Vendor Directory to Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
          <button
            onClick={() => exportVendorsToPDF(vendors)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-all cursor-pointer"
            title="Export Vendor Directory to PDF"
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
          <button
            onClick={() => setIsAddVendorModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard New Vendor</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search vendors by code, name, category..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-800 text-xs bg-slate-800/70 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-800 text-xs bg-slate-800/70 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Vendors</option>
            <option value="active">Active Approved</option>
            <option value="under_review">Under Review</option>
            <option value="blacklisted">Blacklisted</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Showing <span className="font-bold text-white">{filteredVendors.length}</span> Vendors
        </span>
      </div>

      {/* Vendors Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVendors.map(vendor => {
          const vendorPOs = purchaseOrders.filter(po => po.vendorId === vendor.id);
          const vendorItems = items.filter(i => i.vendorId === vendor.id);

          const statusColor =
            vendor.status === 'active'
              ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
              : vendor.status === 'under_review'
              ? 'bg-amber-950 text-amber-300 border-amber-800/60'
              : 'bg-rose-950 text-rose-300 border-rose-800/60';

          return (
            <div
              key={vendor.id}
              className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-indigo-400">{vendor.code}</span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${statusColor}`}>
                        {vendor.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1">{vendor.name}</h3>
                  </div>

                  <div className="flex items-center space-x-1 bg-amber-950/40 border border-amber-800/50 px-2 py-1 rounded-xl">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-amber-300">{vendor.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Scorecards */}
                <div className="grid grid-cols-3 gap-2 mt-4 p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-center">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-medium">On-Time (OTD)</div>
                    <div className="text-xs font-bold text-white mt-0.5">{vendor.onTimeDeliveryRate}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-medium">Quality Rate</div>
                    <div className="text-xs font-bold text-emerald-400 mt-0.5">{vendor.qualityRating}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-medium">Avg Lead Time</div>
                    <div className="text-xs font-bold text-indigo-400 mt-0.5">{vendor.leadTimeDays}d</div>
                  </div>
                </div>

                {/* Contact details */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="font-medium text-slate-200">{vendor.contactPerson}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{vendor.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{vendor.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{vendor.address}</span>
                  </div>
                </div>

                {/* Categories */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {vendor.categories.map((cat, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/60"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Vendor Actions Toolbar: Edit, Delete, Details */}
              <div className="mt-5 pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">Spend: </span>
                    <span className="font-bold text-white">{formatCurrency(vendor.totalSpent)}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => {
                        setSelectedVendorForEdit(vendor);
                        setIsEditVendorModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer border border-slate-700/50"
                      title="Edit Vendor Credentials & Details"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Are you sure you want to remove vendor "${vendor.name}"? This action will unbind linked records.`
                          )
                        ) {
                          deleteVendor(vendor.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 transition-colors cursor-pointer border border-rose-800/40"
                      title="Delete Vendor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Primary Button to inspect Vendor-wise Items & Orders */}
                <button
                  onClick={() => {
                    setSelectedVendorForDetail(vendor);
                    setDetailTab('items');
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-indigo-300 hover:text-white text-xs font-semibold border border-slate-700/60 transition-colors cursor-pointer"
                >
                  <Boxes className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    Manage Items ({vendorItems.length}) & Orders ({vendorPOs.length})
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: ONBOARD NEW VENDOR */}
      {isAddVendorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-800 text-slate-100 my-8">
            <h2 className="text-lg font-bold text-white mb-1">Onboard New Supplier / Vendor</h2>
            <p className="text-xs text-slate-400 mb-4">
              Register commercial supplier profile, payment terms, and supply capability.
            </p>

            <form onSubmit={handleCreateVendor} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company / Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Universal Alloys Ltd"
                  value={vendorName}
                  onChange={e => setVendorName(e.target.value)}
                  className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asif Raza (Director)"
                    value={contactPerson}
                    onChange={e => setContactPerson(e.target.value)}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +92 300 1234567"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="sales@supplier.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Standard Payment Terms</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Net 30, Advance 50%"
                    value={paymentTerms}
                    onChange={e => setPaymentTerms(e.target.value)}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Average Lead Time (Days)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={leadTimeDays}
                    onChange={e => setLeadTimeDays(Number(e.target.value))}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Supplied Categories (comma separated)
                  </label>
                  <input
                    type="text"
                    required
                    value={categoriesText}
                    onChange={e => setCategoriesText(e.target.value)}
                    className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Registered Address</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Plot/Street address and city..."
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full p-2 border border-slate-700 bg-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddVendorModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer shadow-md shadow-indigo-600/25"
                >
                  Register Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VENDOR DETAILS & VENDOR-WISE ITEMS */}
      {selectedVendorForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full p-6 border border-slate-800 text-slate-100 my-8">
            <div className="flex justify-between items-start mb-4 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs text-indigo-400 font-bold">
                    {selectedVendorForDetail.code}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">
                    {selectedVendorForDetail.status}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">{selectedVendorForDetail.name}</h2>
                <p className="text-xs text-slate-400">
                  Contact: {selectedVendorForDetail.contactPerson} • {selectedVendorForDetail.phone} •{' '}
                  {selectedVendorForDetail.email}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedVendorForDetail(null);
                  setIsAddItemForVendorOpen(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs: Vendor-wise Items vs Order History */}
            <div className="flex items-center justify-between border-b border-slate-800 mb-4 pb-2">
              <div className="flex space-x-2">
                <button
                  onClick={() => setDetailTab('items')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                    detailTab === 'items'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Supplied Items ({items.filter(i => i.vendorId === selectedVendorForDetail.id).length})
                </button>
                <button
                  onClick={() => setDetailTab('orders')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                    detailTab === 'orders'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Purchase Orders ({purchaseOrders.filter(po => po.vendorId === selectedVendorForDetail.id).length})
                </button>
              </div>

              {detailTab === 'items' && (
                <button
                  onClick={() => setIsAddItemForVendorOpen(!isAddItemForVendorOpen)}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item for this Vendor</span>
                </button>
              )}
            </div>

            {/* TAB 1: VENDOR-WISE ITEMS */}
            {detailTab === 'items' && (
              <div className="space-y-4">
                {/* Form to add item directly under this vendor */}
                {isAddItemForVendorOpen && (
                  <form
                    onSubmit={handleCreateItemForVendor}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in"
                  >
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Register New Catalog Item for {selectedVendorForDetail.name}</span>
                      <button
                        type="button"
                        onClick={() => setIsAddItemForVendorOpen(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">SKU *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. RAW-MET-09"
                          value={vItemSku}
                          onChange={e => setVItemSku(e.target.value)}
                          className="w-full px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900 text-white text-xs uppercase font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-slate-400 mb-1">Item Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Zinc Coated Steel Sheets 3mm"
                          value={vItemName}
                          onChange={e => setVItemName(e.target.value)}
                          className="w-full px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Category</label>
                        <select
                          value={vItemCategory}
                          onChange={e => setVItemCategory(e.target.value)}
                          className="w-full px-2 py-1 rounded-lg border border-slate-800 bg-slate-900 text-white text-xs"
                        >
                          <option value="Raw Materials">Raw Materials</option>
                          <option value="Packaging">Packaging</option>
                          <option value="Consumables">Consumables</option>
                          <option value="Spare Parts">Spare Parts</option>
                          <option value="Electronics">Electronics</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Unit</label>
                        <input
                          type="text"
                          required
                          value={vItemUnit}
                          onChange={e => setVItemUnit(e.target.value)}
                          className="w-full px-2 py-1 rounded-lg border border-slate-800 bg-slate-900 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Unit Cost (PKR)</label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={vItemCost}
                          onChange={e => setVItemCost(Number(e.target.value))}
                          className="w-full px-2 py-1 rounded-lg border border-slate-800 bg-slate-900 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Opening Stock</label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={vItemQty}
                          onChange={e => setVItemQty(Number(e.target.value))}
                          className="w-full px-2 py-1 rounded-lg border border-slate-800 bg-slate-900 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                      >
                        Save Item for {selectedVendorForDetail.name}
                      </button>
                    </div>
                  </form>
                )}

                {/* Table of items */}
                {items.filter(i => i.vendorId === selectedVendorForDetail.id).length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
                    No items mapped to this vendor yet. Click "Add Item for this Vendor" above to register materials.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-800 rounded-xl max-h-72">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-semibold sticky top-0 border-b border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3">SKU & Item Name</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3 text-right">In Stock</th>
                          <th className="py-2.5 px-3 text-right">Unit Price</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                        {items
                          .filter(i => i.vendorId === selectedVendorForDetail.id)
                          .map(item => (
                            <tr key={item.id} className="hover:bg-slate-800/40">
                              <td className="py-2.5 px-3">
                                <div className="font-mono font-bold text-indigo-400">{item.sku}</div>
                                <div className="text-slate-200">{item.name}</div>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                                  {item.category}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-white">
                                {formatNumber(item.quantityOnHand)} {item.unit}
                              </td>
                              <td className="py-2.5 px-3 text-right font-semibold text-emerald-400">
                                {formatCurrency(item.unitCost)}
                              </td>
                              <td className="py-2.5 px-3 text-right space-x-1">
                                <button
                                  onClick={() => {
                                    setSelectedItemForEdit(item);
                                    setIsEditItemModalOpen(true);
                                  }}
                                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 cursor-pointer"
                                  title="Edit Item"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Delete inventory item "${item.name}" (${item.sku})?`)) {
                                      deleteInventoryItem(item.id);
                                    }
                                  }}
                                  className="p-1 rounded bg-rose-950/50 hover:bg-rose-900/60 text-rose-400 cursor-pointer"
                                  title="Delete Item"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PURCHASE ORDERS */}
            {detailTab === 'orders' && (
              <div className="space-y-3">
                {purchaseOrders.filter(po => po.vendorId === selectedVendorForDetail.id).length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
                    No orders generated for this vendor yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {purchaseOrders
                      .filter(po => po.vendorId === selectedVendorForDetail.id)
                      .map(po => (
                        <div
                          key={po.id}
                          className="p-3 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-mono font-bold text-indigo-400">{po.poNumber}</span>
                            <div className="text-[11px] text-slate-400">
                              Issued: {po.orderDate} • Due: {po.expectedDeliveryDate}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-white">{formatCurrency(po.grandTotal)}</div>
                            <span className="text-[10px] uppercase font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                              {po.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT VENDOR MODAL */}
      {isEditVendorModalOpen && selectedVendorForEdit && (
        <EditVendorModal
          isOpen={isEditVendorModalOpen}
          onClose={() => {
            setIsEditVendorModalOpen(false);
            setSelectedVendorForEdit(null);
          }}
          vendor={selectedVendorForEdit}
          onSave={(id, updates) => updateVendor(id, updates)}
        />
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
