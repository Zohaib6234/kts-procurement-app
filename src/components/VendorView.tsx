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
  AlertCircle
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { Vendor, VendorStatus } from '../types';
import { formatCurrency } from '../utils/formatters';

export const VendorView: React.FC = () => {
  const { vendors, purchaseOrders, addVendor, updateVendor } = useWarehouse();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);
  const [selectedVendorForDetail, setSelectedVendorForDetail] = useState<Vendor | null>(null);

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
    const categoriesArray = categoriesText.split(',').map(c => c.trim()).filter(Boolean);

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
    // Reset
    setVendorName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setAddress('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Vendor & Supplier Management</h1>
          <p className="text-xs text-slate-400">
            Approved vendor directory, on-time delivery (OTD) scorecards, quality compliance, and procurement spend.
          </p>
        </div>
        <div>
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
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Showing <span className="font-bold text-white">{filteredVendors.length}</span> Vendors
        </span>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVendors.map(vendor => {
          const vendorPOs = purchaseOrders.filter(po => po.vendorId === vendor.id);

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
                    <span key={idx} className="text-[10px] font-medium bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/60">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Cumulative Spend: </span>
                  <span className="font-bold text-white">{formatCurrency(vendor.totalSpent)}</span>
                </div>
                <button
                  onClick={() => setSelectedVendorForDetail(vendor)}
                  className="font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors"
                >
                  Order History ({vendorPOs.length})
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
                <label className="block text-slate-300 font-semibold mb-1">Company / Business Name</label>
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
                  <label className="block text-slate-300 font-semibold mb-1">Contact Person</label>
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
                  <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
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
                  <label className="block text-slate-300 font-semibold mb-1">Supplied Categories (comma separated)</label>
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

      {/* MODAL: VENDOR ORDER HISTORY */}
      {selectedVendorForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-800 text-slate-100 my-8">
            <div className="flex justify-between items-start mb-4 border-b border-slate-800 pb-3">
              <div>
                <span className="font-mono text-xs text-indigo-400 font-bold">{selectedVendorForDetail.code}</span>
                <h2 className="text-lg font-bold text-white">{selectedVendorForDetail.name}</h2>
                <p className="text-xs text-slate-400">
                  {selectedVendorForDetail.contactPerson} • {selectedVendorForDetail.phone}
                </p>
              </div>
              <button
                onClick={() => setSelectedVendorForDetail(null)}
                className="text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-200">Associated Purchase Orders</span>
              {purchaseOrders.filter(po => po.vendorId === selectedVendorForDetail.id).length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
                  No orders generated for this vendor yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
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
          </div>
        </div>
      )}
    </div>
  );
};
