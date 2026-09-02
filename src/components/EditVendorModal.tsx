import React, { useState, useEffect } from 'react';
import { X, Save, Building2, Star, Clock, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import { Vendor, VendorStatus } from '../types';

interface EditVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor | null;
  onSave: (id: string, updates: Partial<Vendor>) => void;
}

export const EditVendorModal: React.FC<EditVendorModalProps> = ({
  isOpen,
  onClose,
  vendor,
  onSave
}) => {
  if (!isOpen || !vendor) return null;

  const [name, setName] = useState(vendor.name);
  const [contactPerson, setContactPerson] = useState(vendor.contactPerson);
  const [email, setEmail] = useState(vendor.email);
  const [phone, setPhone] = useState(vendor.phone);
  const [address, setAddress] = useState(vendor.address);
  const [paymentTerms, setPaymentTerms] = useState(vendor.paymentTerms);
  const [leadTimeDays, setLeadTimeDays] = useState(vendor.leadTimeDays);
  const [categoriesText, setCategoriesText] = useState(vendor.categories.join(', '));
  const [status, setStatus] = useState<VendorStatus>(vendor.status);
  const [rating, setRating] = useState(vendor.rating);
  const [onTimeDeliveryRate, setOnTimeDeliveryRate] = useState(vendor.onTimeDeliveryRate);
  const [qualityRating, setQualityRating] = useState(vendor.qualityRating);

  useEffect(() => {
    if (vendor) {
      setName(vendor.name);
      setContactPerson(vendor.contactPerson);
      setEmail(vendor.email);
      setPhone(vendor.phone);
      setAddress(vendor.address);
      setPaymentTerms(vendor.paymentTerms);
      setLeadTimeDays(vendor.leadTimeDays);
      setCategoriesText(vendor.categories.join(', '));
      setStatus(vendor.status);
      setRating(vendor.rating);
      setOnTimeDeliveryRate(vendor.onTimeDeliveryRate);
      setQualityRating(vendor.qualityRating);
    }
  }, [vendor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contactPerson || !email) {
      alert('Please fill in required fields (Name, Contact Person, Email).');
      return;
    }

    const categories = categoriesText
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    onSave(vendor.id, {
      name,
      contactPerson,
      email,
      phone,
      address,
      paymentTerms,
      leadTimeDays: Number(leadTimeDays) || 7,
      categories,
      status,
      rating: Number(rating) || 4.5,
      onTimeDeliveryRate: Number(onTimeDeliveryRate) || 95,
      qualityRating: Number(qualityRating) || 98
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800/60">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <span>Edit Vendor / Supplier</span>
                <span className="font-mono text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded text-xs border border-indigo-800/50">
                  {vendor.code}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Update company credentials, payment terms, or compliance rating</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Company / Supplier Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Key Contact Person *
              </label>
              <input
                type="text"
                required
                value={contactPerson}
                onChange={e => setContactPerson(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Official Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Physical / Registered Address
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Commercial Payment Terms
              </label>
              <input
                type="text"
                value={paymentTerms}
                onChange={e => setPaymentTerms(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Average Lead Time (Days)
              </label>
              <input
                type="number"
                min="1"
                value={leadTimeDays}
                onChange={e => setLeadTimeDays(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Vendor Compliance Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as VendorStatus)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="active">Active (Approved)</option>
                <option value="under_review">Under Review</option>
                <option value="blacklisted">Blacklisted / Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Supply Categories (Comma Separated)
            </label>
            <input
              type="text"
              value={categoriesText}
              onChange={e => setCategoriesText(e.target.value)}
              placeholder="e.g. Raw Materials, Packaging, Fasteners"
              className="w-full px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Performance KPIs */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
            <span className="block text-[11px] font-semibold text-slate-200 mb-2">
              Performance Scorecard Metrics
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Vendor Rating (1-5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={rating}
                  onChange={e => setRating(parseFloat(e.target.value) || 4.5)}
                  className="w-full px-2 py-1 rounded-lg border border-slate-800 bg-slate-900 text-amber-400 font-bold text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">OTD Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={onTimeDeliveryRate}
                  onChange={e => setOnTimeDeliveryRate(parseFloat(e.target.value) || 95)}
                  className="w-full px-2 py-1 rounded-lg border border-slate-800 bg-slate-900 text-white font-bold text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Quality Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={qualityRating}
                  onChange={e => setQualityRating(parseFloat(e.target.value) || 98)}
                  className="w-full px-2 py-1 rounded-lg border border-slate-800 bg-slate-900 text-emerald-400 font-bold text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end space-x-2.5 border-t border-slate-800">
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
              <span>Update Vendor Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
