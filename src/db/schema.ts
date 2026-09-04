// src/db/schema.ts
import { pgTable, text, timestamp, integer, boolean, real, jsonb } from 'drizzle-orm/pg-core';

// Users table (links Firebase Auth or System Users)
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  username: text('username').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  role: text('role').notNull(),
  department: text('department').notNull(),
  avatar: text('avatar'),
  status: text('status').default('active').notNull(),
  assignedWarehouse: text('assigned_warehouse').default('Central Depot - KTS Malir'),
  phone: text('phone'),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Inventory Items table
export const inventoryItems = pgTable('inventory_items', {
  id: text('id').primaryKey(),
  sku: text('sku').notNull().unique(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  unit: text('unit').notNull(),
  quantityOnHand: real('quantity_on_hand').notNull(),
  reservedQuantity: real('reserved_quantity').default(0).notNull(),
  reorderLevel: real('reorder_level').notNull(),
  safetyStock: real('safety_stock').notNull(),
  unitCost: real('unit_cost').notNull(),
  warehouseZone: text('warehouse_zone').notNull(),
  aisle: text('aisle').notNull(),
  shelf: text('shelf').notNull(),
  bin: text('bin').notNull(),
  lastRestockedAt: text('last_restocked_at').notNull(),
  status: text('status').notNull(),
  vendorId: text('vendor_id'),
  vendorName: text('vendor_name'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Vendors table
export const vendors = pgTable('vendors', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  contactPerson: text('contact_person').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  address: text('address').notNull(),
  rating: real('rating').default(5).notNull(),
  onTimeDeliveryRate: real('on_time_delivery_rate').default(95).notNull(),
  qualityRating: real('quality_rating').default(95).notNull(),
  paymentTerms: text('payment_terms').notNull(),
  leadTimeDays: integer('lead_time_days').notNull(),
  categories: jsonb('categories').notNull(),
  totalSpent: real('total_spent').default(0).notNull(),
  status: text('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Purchase Requisitions table
export const purchaseRequisitions = pgTable('purchase_requisitions', {
  id: text('id').primaryKey(),
  prNumber: text('pr_number').notNull().unique(),
  requestedBy: text('requested_by').notNull(),
  department: text('department').notNull(),
  requestDate: text('request_date').notNull(),
  requiredDate: text('required_date').notNull(),
  urgency: text('urgency').notNull(),
  status: text('status').notNull(),
  items: jsonb('items').notNull(),
  totalEstimatedCost: real('total_estimated_cost').notNull(),
  notes: text('notes').default(''),
  approvedBy: text('approved_by'),
  approvalDate: text('approval_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Purchase Orders table
export const purchaseOrders = pgTable('purchase_orders', {
  id: text('id').primaryKey(),
  poNumber: text('po_number').notNull().unique(),
  prId: text('pr_id'),
  prNumber: text('pr_number'),
  vendorId: text('vendor_id').notNull(),
  vendorName: text('vendor_name').notNull(),
  orderDate: text('order_date').notNull(),
  expectedDeliveryDate: text('expected_delivery_date').notNull(),
  status: text('status').notNull(),
  items: jsonb('items').notNull(),
  subtotal: real('subtotal').notNull(),
  taxAmount: real('tax_amount').notNull(),
  grandTotal: real('grand_total').notNull(),
  paymentTerms: text('payment_terms').notNull(),
  shippingTerms: text('shipping_terms').notNull(),
  deliveryAddress: text('delivery_address').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Goods Receipt Notes (GRN) table
export const goodsReceiptNotes = pgTable('goods_receipt_notes', {
  id: text('id').primaryKey(),
  grnNumber: text('grn_number').notNull().unique(),
  poId: text('po_id').notNull(),
  poNumber: text('po_number').notNull(),
  vendorId: text('vendor_id').notNull(),
  vendorName: text('vendor_name').notNull(),
  receivedDate: text('received_date').notNull(),
  receivedBy: text('received_by').notNull(),
  invoiceNumber: text('invoice_number').notNull(),
  vehicleNumber: text('vehicle_number'),
  inspectionStatus: text('inspection_status').notNull(),
  items: jsonb('items').notNull(),
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Stock Issuance & Gate Passes table
export const gatePasses = pgTable('gate_passes', {
  id: text('id').primaryKey(),
  gatePassNumber: text('gate_pass_number').notNull().unique(),
  issuanceNumber: text('issuance_number').notNull(),
  passType: text('pass_type').notNull(), // 'returnable' | 'non_returnable'
  status: text('status').notNull(), // 'issued' | 'cleared_at_gate' | 'returned' | 'cancelled'
  issueDate: text('issue_date').notNull(),
  expectedReturnDate: text('expected_return_date'),
  department: text('department').notNull(),
  issuedTo: text('issued_to').notNull(),
  carrierName: text('carrier_name'),
  carrierCnic: text('carrier_cnic'),
  vehicleNumber: text('vehicle_number'),
  purpose: text('purpose').notNull(),
  warehouseZone: text('warehouse_zone'),
  issuedBy: text('issued_by').notNull(),
  authorizedBy: text('authorized_by').notNull(),
  securityOfficer: text('security_officer'),
  gateOutTimestamp: text('gate_out_timestamp'),
  gateInTimestamp: text('gate_in_timestamp'),
  items: jsonb('items').notNull(),
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Stock Movements ledger table
export const stockMovements = pgTable('stock_movements', {
  id: text('id').primaryKey(),
  movementType: text('movement_type').notNull(),
  itemId: text('item_id').notNull(),
  itemName: text('item_name').notNull(),
  sku: text('sku').notNull(),
  quantity: real('quantity').notNull(),
  fromLocation: text('from_location'),
  toLocation: text('to_location'),
  referenceNumber: text('reference_number').notNull(),
  date: text('date').notNull(),
  performedBy: text('performed_by').notNull(),
  reason: text('reason').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Warehouse Zones table
export const warehouseZones = pgTable('warehouse_zones', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  capacityUnits: integer('capacity_units').notNull(),
  usedUnits: integer('used_units').notNull(),
  type: text('type').notNull(),
  temperature: text('temperature'),
});

// System Settings table (singleton key)
export const systemSettings = pgTable('system_settings', {
  id: text('id').primaryKey().default('default'),
  companyName: text('company_name').notNull(),
  facilityCode: text('facility_code').notNull(),
  currencySymbol: text('currency_symbol').notNull(),
  reorderAlertThreshold: integer('reorder_alert_threshold').notNull(),
  autoPRGeneration: boolean('auto_pr_generation').notNull(),
  strictQCMode: boolean('strict_qc_mode').notNull(),
  sessionTimeoutMinutes: integer('session_timeout_minutes').notNull(),
  enforceTwoFactor: boolean('enforce_two_factor').notNull(),
  maintenanceMode: boolean('maintenance_mode').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Security & Audit Logs table
export const securityLogs = pgTable('security_logs', {
  id: text('id').primaryKey(),
  timestamp: text('timestamp').notNull(),
  userId: text('user_id'),
  userEmail: text('user_email').notNull(),
  userName: text('user_name').notNull(),
  action: text('action').notNull(),
  status: text('status').notNull(),
  ipAddress: text('ip_address').notNull(),
  details: text('details').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
