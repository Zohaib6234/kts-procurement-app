export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked';

export type PRStatus = 'pending' | 'approved' | 'rejected' | 'converted_to_po';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'urgent';

export type POStatus = 'draft' | 'issued' | 'partially_received' | 'completed' | 'cancelled';
export type InspectionStatus = 'passed' | 'partial' | 'rejected';

export type MovementType = 'receipt' | 'issue' | 'transfer' | 'adjustment' | 'scrap';
export type VendorStatus = 'active' | 'under_review' | 'inactive';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  quantityOnHand: number;
  reservedQuantity: number;
  reorderLevel: number;
  safetyStock: number;
  unitCost: number;
  warehouseZone: string;
  aisle: string;
  shelf: string;
  bin: string;
  lastRestockedAt: string;
  status: StockStatus;
}

export interface Vendor {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  rating: number; // 1 to 5
  onTimeDeliveryRate: number; // percentage e.g. 96
  qualityRating: number; // percentage e.g. 98
  paymentTerms: string;
  leadTimeDays: number;
  categories: string[];
  totalSpent: number;
  status: VendorStatus;
}

export interface PRItem {
  itemId: string;
  itemName: string;
  sku: string;
  quantity: number;
  estimatedCost: number;
}

export interface PurchaseRequisition {
  id: string;
  prNumber: string;
  requestedBy: string;
  department: string;
  requestDate: string;
  requiredDate: string;
  urgency: UrgencyLevel;
  status: PRStatus;
  items: PRItem[];
  totalEstimatedCost: number;
  notes: string;
  approvedBy?: string;
  approvalDate?: string;
}

export interface POItem {
  itemId: string;
  itemName: string;
  sku: string;
  orderedQty: number;
  receivedQty: number;
  unitPrice: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  prId?: string;
  prNumber?: string;
  vendorId: string;
  vendorName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  status: POStatus;
  items: POItem[];
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  paymentTerms: string;
  shippingTerms: string;
  deliveryAddress: string;
  notes?: string;
}

export interface GRNItem {
  itemId: string;
  itemName: string;
  sku: string;
  orderedQty: number;
  deliveredQty: number;
  acceptedQty: number;
  rejectedQty: number;
  rejectReason?: string;
  targetZone: string;
  targetBin: string;
  batchNumber?: string;
}

export interface GoodsReceiptNote {
  id: string;
  grnNumber: string;
  poId: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  receivedDate: string;
  receivedBy: string;
  invoiceNumber: string;
  vehicleNumber?: string;
  inspectionStatus: InspectionStatus;
  items: GRNItem[];
  remarks?: string;
}

export interface StockMovement {
  id: string;
  movementType: MovementType;
  itemId: string;
  itemName: string;
  sku: string;
  quantity: number;
  fromLocation?: string;
  toLocation?: string;
  referenceNumber: string; // e.g. PO-2026-001 or GRN-2026-004 or ISS-1002
  date: string;
  performedBy: string;
  reason: string;
}

export interface WarehouseZone {
  id: string;
  code: string;
  name: string;
  capacityUnits: number;
  usedUnits: number;
  type: 'raw_materials' | 'finished_goods' | 'spare_parts' | 'packaging' | 'cold_storage';
  temperature?: string;
}

export type UserRole = 'admin' | 'procurement_manager' | 'warehouse_supervisor' | 'qc_officer' | 'auditor';

export interface SystemUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  status: 'active' | 'suspended';
  lastLogin?: string;
  createdAt: string;
  assignedWarehouse: string;
  phone?: string;
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  userId?: string;
  userEmail: string;
  userName: string;
  action: 'login' | 'logout' | 'failed_login' | 'user_created' | 'user_updated' | 'user_deleted' | 'password_reset' | 'settings_updated' | 'database_reset';
  status: 'success' | 'warning' | 'error';
  ipAddress: string;
  details: string;
}

export interface SystemSettings {
  companyName: string;
  facilityCode: string;
  currencySymbol: string;
  reorderAlertThreshold: number;
  autoPRGeneration: boolean;
  strictQCMode: boolean;
  sessionTimeoutMinutes: number;
  enforceTwoFactor: boolean;
  maintenanceMode: boolean;
}
