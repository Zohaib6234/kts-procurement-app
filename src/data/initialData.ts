import {
  InventoryItem,
  Vendor,
  PurchaseRequisition,
  PurchaseOrder,
  GoodsReceiptNote,
  StockMovement,
  WarehouseZone,
  StockIssuanceGatePass
} from '../types';

export const INITIAL_ZONES: WarehouseZone[] = [
  { id: 'zone-1', code: 'Z-RAW', name: 'Raw Materials Bay', capacityUnits: 15000, usedUnits: 11450, type: 'raw_materials' },
  { id: 'zone-2', code: 'Z-PKG', name: 'Packaging & Corrugated', capacityUnits: 8000, usedUnits: 5200, type: 'packaging' },
  { id: 'zone-3', code: 'Z-SPR', name: 'Industrial Spares & Hardware', capacityUnits: 6000, usedUnits: 3100, type: 'spare_parts' },
  { id: 'zone-4', code: 'Z-FNG', name: 'Finished Goods Hub', capacityUnits: 20000, usedUnits: 14200, type: 'finished_goods' },
  { id: 'zone-5', code: 'Z-CHM', name: 'Controlled Chemical & Cold', capacityUnits: 4000, usedUnits: 1850, type: 'cold_storage', temperature: '4°C - 8°C' },
];

export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'ven-1',
    code: 'VND-001',
    name: 'Apex Industrial Steels Ltd',
    contactPerson: 'Tariq Mehmood',
    email: 'sales@apexsteels.com',
    phone: '+92 300 8492011',
    address: 'Plot 42, Industrial Area, Sector I-9, Islamabad',
    rating: 4.8,
    onTimeDeliveryRate: 97.5,
    qualityRating: 99.1,
    paymentTerms: 'Net 30',
    leadTimeDays: 7,
    categories: ['Raw Materials', 'Metals', 'Industrial Spares'],
    totalSpent: 4850000,
    status: 'active'
  },
  {
    id: 'ven-2',
    code: 'VND-002',
    name: 'PolyPack Packaging Solutions',
    contactPerson: 'Saima Farooq',
    email: 'orders@polypack.pk',
    phone: '+92 321 4458920',
    address: 'Building 18, Korangi Industrial Zone, Karachi',
    rating: 4.4,
    onTimeDeliveryRate: 91.0,
    qualityRating: 95.8,
    paymentTerms: 'Net 45',
    leadTimeDays: 5,
    categories: ['Packaging', 'Cartons', 'Poly Bags'],
    totalSpent: 1820000,
    status: 'active'
  },
  {
    id: 'ven-3',
    code: 'VND-003',
    name: 'Al-Hadeed Fasteners & Tools',
    contactPerson: 'Khurram Shehzad',
    email: 'khurram@alhadeedtools.com',
    phone: '+92 333 5129033',
    address: 'Shop 110, Nishtar Road Hardware Market, Lahore',
    rating: 4.6,
    onTimeDeliveryRate: 94.2,
    qualityRating: 98.0,
    paymentTerms: 'Net 15',
    leadTimeDays: 3,
    categories: ['Hardware', 'Industrial Spares', 'Safety Gear'],
    totalSpent: 920000,
    status: 'active'
  },
  {
    id: 'ven-4',
    code: 'VND-004',
    name: 'ChemiTech Polymers & Lubricants',
    contactPerson: 'Dr. Asim Qureshi',
    email: 'corporate@chemitech.net',
    phone: '+92 301 9988772',
    address: 'Sundar Industrial Estate, Raiwind Road, Lahore',
    rating: 3.9,
    onTimeDeliveryRate: 83.5,
    qualityRating: 92.0,
    paymentTerms: 'Advance 50% / Net 30',
    leadTimeDays: 12,
    categories: ['Chemicals', 'Lubricants', 'Raw Materials'],
    totalSpent: 2640000,
    status: 'under_review'
  },
  {
    id: 'ven-5',
    code: 'VND-005',
    name: 'ShieldPro Safety Equipments',
    contactPerson: 'Zubair Akhtar',
    email: 'support@shieldpro.com.pk',
    phone: '+92 345 7766554',
    address: 'Office 7, 3rd Floor, Business Center, Faisalabad',
    rating: 4.9,
    onTimeDeliveryRate: 99.0,
    qualityRating: 99.5,
    paymentTerms: 'Net 30',
    leadTimeDays: 4,
    categories: ['Safety Gear', 'PPE', 'Consumables'],
    totalSpent: 780000,
    status: 'active'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'item-1',
    sku: 'RAW-STL-304',
    name: 'Stainless Steel Sheet Grade 304 (2mm)',
    category: 'Raw Materials',
    unit: 'Sheets',
    quantityOnHand: 450,
    reservedQuantity: 60,
    reorderLevel: 200,
    safetyStock: 80,
    unitCost: 8500,
    warehouseZone: 'Z-RAW',
    aisle: 'A-01',
    shelf: 'S-03',
    bin: 'B-12',
    lastRestockedAt: '2026-08-22',
    status: 'in_stock',
    vendorId: 'ven-1',
    vendorName: 'Apex Industrial Steels Ltd'
  },
  {
    id: 'item-2',
    sku: 'RAW-ALM-6061',
    name: 'Aluminum Alloy Rods 6061-T6 (25mm x 3m)',
    category: 'Raw Materials',
    unit: 'Pieces',
    quantityOnHand: 95,
    reservedQuantity: 30,
    reorderLevel: 120,
    safetyStock: 50,
    unitCost: 3200,
    warehouseZone: 'Z-RAW',
    aisle: 'A-02',
    shelf: 'S-01',
    bin: 'B-04',
    lastRestockedAt: '2026-08-10',
    status: 'low_stock',
    vendorId: 'ven-1',
    vendorName: 'Apex Industrial Steels Ltd'
  },
  {
    id: 'item-3',
    sku: 'PKG-BOX-500',
    name: 'Heavy Duty 5-Ply Corrugated Shipping Box',
    category: 'Packaging',
    unit: 'Units',
    quantityOnHand: 3400,
    reservedQuantity: 400,
    reorderLevel: 1500,
    safetyStock: 500,
    unitCost: 140,
    warehouseZone: 'Z-PKG',
    aisle: 'P-01',
    shelf: 'S-04',
    bin: 'B-20',
    lastRestockedAt: '2026-08-28',
    status: 'in_stock',
    vendorId: 'ven-2',
    vendorName: 'PolyPack Packaging Solutions'
  },
  {
    id: 'item-4',
    sku: 'PKG-TPE-72M',
    name: 'Industrial BOPP Packaging Tape (72mm x 100m)',
    category: 'Packaging',
    unit: 'Rolls',
    quantityOnHand: 35,
    reservedQuantity: 10,
    reorderLevel: 150,
    safetyStock: 40,
    unitCost: 210,
    warehouseZone: 'Z-PKG',
    aisle: 'P-02',
    shelf: 'S-02',
    bin: 'B-08',
    lastRestockedAt: '2026-07-29',
    status: 'low_stock',
    vendorId: 'ven-2',
    vendorName: 'PolyPack Packaging Solutions'
  },
  {
    id: 'item-5',
    sku: 'SPR-BRG-6205',
    name: 'Deep Groove Ball Bearing 6205-2RS',
    category: 'Industrial Spares',
    unit: 'Pieces',
    quantityOnHand: 280,
    reservedQuantity: 25,
    reorderLevel: 100,
    safetyStock: 30,
    unitCost: 950,
    warehouseZone: 'Z-SPR',
    aisle: 'M-03',
    shelf: 'S-02',
    bin: 'B-15',
    lastRestockedAt: '2026-08-15',
    status: 'in_stock',
    vendorId: 'ven-3',
    vendorName: 'Al-Hadeed Fasteners & Tools'
  },
  {
    id: 'item-6',
    sku: 'SPR-BLT-M12',
    name: 'High Tensile Hex Bolt M12 x 50mm (Grade 8.8)',
    category: 'Hardware',
    unit: 'Kits (100pcs)',
    quantityOnHand: 65,
    reservedQuantity: 5,
    reorderLevel: 80,
    safetyStock: 20,
    unitCost: 1850,
    warehouseZone: 'Z-SPR',
    aisle: 'M-01',
    shelf: 'S-05',
    bin: 'B-02',
    lastRestockedAt: '2026-08-18',
    status: 'low_stock',
    vendorId: 'ven-3',
    vendorName: 'Al-Hadeed Fasteners & Tools'
  },
  {
    id: 'item-7',
    sku: 'CHM-HYD-46',
    name: 'ISO VG 46 Anti-Wear Hydraulic Oil (208L Drum)',
    category: 'Chemicals',
    unit: 'Drums',
    quantityOnHand: 14,
    reservedQuantity: 4,
    reorderLevel: 10,
    safetyStock: 5,
    unitCost: 68000,
    warehouseZone: 'Z-CHM',
    aisle: 'C-01',
    shelf: 'S-01',
    bin: 'B-01',
    lastRestockedAt: '2026-08-05',
    status: 'in_stock',
    vendorId: 'ven-4',
    vendorName: 'Indus Valves & Fluidics'
  },
  {
    id: 'item-8',
    sku: 'SFT-HLM-PRO',
    name: 'EN397 Industrial Safety Helmet with Ratchet',
    category: 'Safety Gear',
    unit: 'Pieces',
    quantityOnHand: 180,
    reservedQuantity: 20,
    reorderLevel: 50,
    safetyStock: 20,
    unitCost: 850,
    warehouseZone: 'Z-SPR',
    aisle: 'M-04',
    shelf: 'S-01',
    bin: 'B-07',
    lastRestockedAt: '2026-08-25',
    status: 'in_stock',
    vendorId: 'ven-5',
    vendorName: 'PakSafe Industrial Equipment'
  },
  {
    id: 'item-9',
    sku: 'SFT-GLV-NIT',
    name: 'Heavy Duty Nitrile Chemical Resistant Gloves',
    category: 'Safety Gear',
    unit: 'Pairs',
    quantityOnHand: 0,
    reservedQuantity: 0,
    reorderLevel: 250,
    safetyStock: 50,
    unitCost: 380,
    warehouseZone: 'Z-SPR',
    aisle: 'M-04',
    shelf: 'S-02',
    bin: 'B-09',
    lastRestockedAt: '2026-07-12',
    status: 'out_of_stock',
    vendorId: 'ven-5',
    vendorName: 'PakSafe Industrial Equipment'
  },
  {
    id: 'item-10',
    sku: 'RAW-COP-TUB',
    name: 'Refrigeration Grade Seamless Copper Tubing 1/2"',
    category: 'Raw Materials',
    unit: 'Coils (15m)',
    quantityOnHand: 42,
    reservedQuantity: 12,
    reorderLevel: 30,
    safetyStock: 10,
    unitCost: 14500,
    warehouseZone: 'Z-RAW',
    aisle: 'A-03',
    shelf: 'S-02',
    bin: 'B-10',
    lastRestockedAt: '2026-08-19',
    status: 'in_stock',
    vendorId: 'ven-1',
    vendorName: 'Apex Industrial Steels Ltd'
  }
];

export const INITIAL_PRS: PurchaseRequisition[] = [
  {
    id: 'pr-1',
    prNumber: 'PR-2026-0041',
    requestedBy: 'Bilal Khan (Production Engineer)',
    department: 'Manufacturing Plant 2',
    requestDate: '2026-08-29',
    requiredDate: '2026-09-08',
    urgency: 'urgent',
    status: 'pending',
    items: [
      { itemId: 'item-9', itemName: 'Heavy Duty Nitrile Chemical Resistant Gloves', sku: 'SFT-GLV-NIT', quantity: 300, estimatedCost: 380 },
      { itemId: 'item-4', itemName: 'Industrial BOPP Packaging Tape (72mm x 100m)', sku: 'PKG-TPE-72M', quantity: 200, estimatedCost: 210 }
    ],
    totalEstimatedCost: 156000,
    notes: 'Urgent replenish needed for safety compliance in Acid Pickling area and upcoming dispatch batch.'
  },
  {
    id: 'pr-2',
    prNumber: 'PR-2026-0042',
    requestedBy: 'Farhan Malik (Warehouse Supervisor)',
    department: 'Logistics & Warehouse',
    requestDate: '2026-08-30',
    requiredDate: '2026-09-12',
    urgency: 'high',
    status: 'approved',
    approvedBy: 'Hassan Raza (Procurement Manager)',
    approvalDate: '2026-08-31',
    items: [
      { itemId: 'item-2', itemName: 'Aluminum Alloy Rods 6061-T6 (25mm x 3m)', sku: 'RAW-ALM-6061', quantity: 150, estimatedCost: 3200 },
      { itemId: 'item-6', itemName: 'High Tensile Hex Bolt M12 x 50mm (Grade 8.8)', sku: 'SPR-BLT-M12', quantity: 40, estimatedCost: 1850 }
    ],
    totalEstimatedCost: 554000,
    notes: 'Reorder buffer replenishment approved by plant head.'
  },
  {
    id: 'pr-3',
    prNumber: 'PR-2026-0039',
    requestedBy: 'Ali Raza (Maintenance Dept)',
    department: 'Facilities & Maintenance',
    requestDate: '2026-08-15',
    requiredDate: '2026-08-22',
    urgency: 'medium',
    status: 'converted_to_po',
    approvedBy: 'Hassan Raza (Procurement Manager)',
    approvalDate: '2026-08-16',
    items: [
      { itemId: 'item-7', itemName: 'ISO VG 46 Anti-Wear Hydraulic Oil (208L Drum)', sku: 'CHM-HYD-46', quantity: 10, estimatedCost: 68000 }
    ],
    totalEstimatedCost: 680000,
    notes: 'Quarterly preventative hydraulic maintenance cycle.'
  }
];

export const INITIAL_POS: PurchaseOrder[] = [
  {
    id: 'po-1',
    poNumber: 'PO-2026-089',
    prNumber: 'PR-2026-0039',
    vendorId: 'ven-4',
    vendorName: 'ChemiTech Polymers & Lubricants',
    orderDate: '2026-08-17',
    expectedDeliveryDate: '2026-09-04',
    status: 'issued',
    items: [
      { itemId: 'item-7', itemName: 'ISO VG 46 Anti-Wear Hydraulic Oil (208L Drum)', sku: 'CHM-HYD-46', orderedQty: 10, receivedQty: 0, unitPrice: 68000, total: 680000 }
    ],
    subtotal: 680000,
    taxAmount: 115600, // 17% sales tax
    grandTotal: 795600,
    paymentTerms: 'Advance 50% / Net 30',
    shippingTerms: 'FOB Destination - Warehouse Gate 3',
    deliveryAddress: 'Main Warehouse Central Bay, Gate 3, Industrial Estate Islamabad',
    notes: 'Ensure MSDS safety certificate & batch analysis report is attached with consignment.'
  },
  {
    id: 'po-2',
    poNumber: 'PO-2026-088',
    vendorId: 'ven-1',
    vendorName: 'Apex Industrial Steels Ltd',
    orderDate: '2026-08-14',
    expectedDeliveryDate: '2026-08-28',
    status: 'partially_received',
    items: [
      { itemId: 'item-1', itemName: 'Stainless Steel Sheet Grade 304 (2mm)', sku: 'RAW-STL-304', orderedQty: 300, receivedQty: 180, unitPrice: 8500, total: 2550000 }
    ],
    subtotal: 2550000,
    taxAmount: 433500,
    grandTotal: 2983500,
    paymentTerms: 'Net 30',
    shippingTerms: 'Delivered by Vendor Crane Truck',
    deliveryAddress: 'Raw Materials Yard, Zone Z-RAW, Main Warehouse',
    notes: 'Mill test certificate required upon each dispatch.'
  },
  {
    id: 'po-3',
    poNumber: 'PO-2026-087',
    vendorId: 'ven-2',
    vendorName: 'PolyPack Packaging Solutions',
    orderDate: '2026-08-10',
    expectedDeliveryDate: '2026-08-20',
    status: 'completed',
    items: [
      { itemId: 'item-3', itemName: 'Heavy Duty 5-Ply Corrugated Shipping Box', sku: 'PKG-BOX-500', orderedQty: 2000, receivedQty: 2000, unitPrice: 140, total: 280000 }
    ],
    subtotal: 280000,
    taxAmount: 47600,
    grandTotal: 327600,
    paymentTerms: 'Net 45',
    shippingTerms: 'Free Delivery at Warehouse Door',
    deliveryAddress: 'Packaging Store, Zone Z-PKG, Main Warehouse'
  }
];

export const INITIAL_GRNS: GoodsReceiptNote[] = [
  {
    id: 'grn-1',
    grnNumber: 'GRN-2026-0112',
    poId: 'po-2',
    poNumber: 'PO-2026-088',
    vendorId: 'ven-1',
    vendorName: 'Apex Industrial Steels Ltd',
    receivedDate: '2026-08-22',
    receivedBy: 'Imran Ashraf (Inward QC Officer)',
    invoiceNumber: 'INV-APX-9821',
    vehicleNumber: 'LES-9142 (Bed Truck)',
    inspectionStatus: 'passed',
    items: [
      {
        itemId: 'item-1',
        itemName: 'Stainless Steel Sheet Grade 304 (2mm)',
        sku: 'RAW-STL-304',
        orderedQty: 300,
        deliveredQty: 180,
        acceptedQty: 180,
        rejectedQty: 0,
        targetZone: 'Z-RAW',
        targetBin: 'B-12',
        batchNumber: 'LOT-SS-2026-08'
      }
    ],
    remarks: 'Visual and thickness caliper inspection passed. Remaining 120 sheets in next shipment.'
  },
  {
    id: 'grn-2',
    grnNumber: 'GRN-2026-0111',
    poId: 'po-3',
    poNumber: 'PO-2026-087',
    vendorId: 'ven-2',
    vendorName: 'PolyPack Packaging Solutions',
    receivedDate: '2026-08-19',
    receivedBy: 'Imran Ashraf (Inward QC Officer)',
    invoiceNumber: 'INV-PLP-3024',
    vehicleNumber: 'KHI-6631',
    inspectionStatus: 'passed',
    items: [
      {
        itemId: 'item-3',
        itemName: 'Heavy Duty 5-Ply Corrugated Shipping Box',
        sku: 'PKG-BOX-500',
        orderedQty: 2000,
        deliveredQty: 2000,
        acceptedQty: 2000,
        rejectedQty: 0,
        targetZone: 'Z-PKG',
        targetBin: 'B-20',
        batchNumber: 'PKG-BX-AUG'
      }
    ],
    remarks: 'Bursting strength verified at 14 kg/cm2. Full batch accepted and slotted into pallets.'
  }
];

export const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: 'mov-1',
    movementType: 'receipt',
    itemId: 'item-1',
    itemName: 'Stainless Steel Sheet Grade 304 (2mm)',
    sku: 'RAW-STL-304',
    quantity: 180,
    toLocation: 'Z-RAW / A-01 / B-12',
    referenceNumber: 'GRN-2026-0112',
    date: '2026-08-22 14:30',
    performedBy: 'Imran Ashraf',
    reason: 'Goods Receipt Note against PO-2026-088'
  },
  {
    id: 'mov-2',
    movementType: 'issue',
    itemId: 'item-1',
    itemName: 'Stainless Steel Sheet Grade 304 (2mm)',
    sku: 'RAW-STL-304',
    quantity: -50,
    fromLocation: 'Z-RAW / A-01 / B-12',
    toLocation: 'Plant 1 Fabrication Bay',
    referenceNumber: 'ISS-2026-0419',
    date: '2026-08-24 09:15',
    performedBy: 'Kashif Mehmood',
    reason: 'Issued for Project Chassis Production Order #902'
  },
  {
    id: 'mov-3',
    movementType: 'issue',
    itemId: 'item-3',
    itemName: 'Heavy Duty 5-Ply Corrugated Shipping Box',
    sku: 'PKG-BOX-500',
    quantity: -400,
    fromLocation: 'Z-PKG / P-01 / B-20',
    toLocation: 'Export Packaging Station',
    referenceNumber: 'ISS-2026-0422',
    date: '2026-08-26 11:00',
    performedBy: 'Kashif Mehmood',
    reason: 'Dispatched for overseas export consignment packaging'
  },
  {
    id: 'mov-4',
    movementType: 'transfer',
    itemId: 'item-5',
    itemName: 'Deep Groove Ball Bearing 6205-2RS',
    sku: 'SPR-BRG-6205',
    quantity: 50,
    fromLocation: 'Z-SPR / M-03 / B-10',
    toLocation: 'Z-SPR / M-03 / B-15',
    referenceNumber: 'TRF-2026-0081',
    date: '2026-08-27 16:45',
    performedBy: 'Farhan Malik',
    reason: 'Rack reorganization for high-frequency access'
  },
  {
    id: 'mov-5',
    movementType: 'adjustment',
    itemId: 'item-4',
    itemName: 'Industrial BOPP Packaging Tape (72mm x 100m)',
    sku: 'PKG-TPE-72M',
    quantity: -15,
    fromLocation: 'Z-PKG / P-02 / B-08',
    referenceNumber: 'ADJ-2026-0012',
    date: '2026-08-29 10:20',
    performedBy: 'Audit Team (Zahid & Bilal)',
    reason: 'Physical cycle count variance: 15 damaged rolls written off'
  }
];

export const INITIAL_GATE_PASSES: StockIssuanceGatePass[] = [
  {
    id: 'gp-1001',
    gatePassNumber: 'GP-2026-0038',
    issuanceNumber: 'ISS-2026-0419',
    passType: 'non_returnable',
    status: 'cleared_at_gate',
    issueDate: '2026-08-24 09:15',
    department: 'Plant 1 Fabrication Bay',
    issuedTo: 'Engr. Kamran Siddiqui (Plant Lead)',
    carrierName: 'Muhammad Rasheed (Store Porter)',
    carrierCnic: '37405-8291043-1',
    vehicleNumber: 'Internal Forklift FL-02',
    purpose: 'Issued for Project Chassis Production Order #902',
    warehouseZone: 'Z-RAW',
    issuedBy: 'Kashif Mehmood',
    authorizedBy: 'Tahir Abbas (Plant Manager)',
    securityOfficer: 'Sub. Rtd. Ghulam Haider',
    gateOutTimestamp: '2026-08-24 09:35',
    items: [
      {
        itemId: 'item-1',
        itemName: 'Stainless Steel Sheet Grade 304 (2mm)',
        sku: 'RAW-STL-304',
        quantity: 50,
        unit: 'Sheets',
        unitCost: 18500,
        remarks: 'Batch #ST-2026-A1 for Chassis Line'
      }
    ],
    remarks: 'Approved under annual fabrication material quota.'
  },
  {
    id: 'gp-1002',
    gatePassNumber: 'GP-2026-0039',
    issuanceNumber: 'ISS-2026-0422',
    passType: 'non_returnable',
    status: 'cleared_at_gate',
    issueDate: '2026-08-26 11:00',
    department: 'Export Packaging Station',
    issuedTo: 'Sajid Iqbal (Export Supervisor)',
    carrierName: 'Anwar Khan',
    carrierCnic: '42201-9923841-7',
    vehicleNumber: 'Truck LEA-8840',
    purpose: 'Dispatched for overseas export consignment packaging',
    warehouseZone: 'Z-PKG',
    issuedBy: 'Kashif Mehmood',
    authorizedBy: 'Hassan Raza (Procurement Manager)',
    securityOfficer: 'Muhammad Akram (Gate #2)',
    gateOutTimestamp: '2026-08-26 11:45',
    items: [
      {
        itemId: 'item-3',
        itemName: 'Heavy Duty 5-Ply Corrugated Shipping Box',
        sku: 'PKG-BOX-500',
        quantity: 400,
        unit: 'Cartons',
        unitCost: 280,
        remarks: 'Palletized bundles'
      }
    ],
    remarks: 'Pre-inspected by QC team prior to dispatch.'
  },
  {
    id: 'gp-1003',
    gatePassNumber: 'GP-2026-0040',
    issuanceNumber: 'ISS-2026-0430',
    passType: 'returnable',
    status: 'issued',
    issueDate: '2026-09-01 14:30',
    expectedReturnDate: '2026-09-08',
    department: 'Apex Engineering Works (Vendor Workshop)',
    issuedTo: 'Tariq Mehmood (Apex Steels)',
    carrierName: 'Shahid Nadeem',
    carrierCnic: '35202-4410293-5',
    vehicleNumber: 'Van LZ-4190',
    purpose: 'External dynamic precision balancing & spindle calibration',
    warehouseZone: 'Z-SPR',
    issuedBy: 'Kashif Mehmood',
    authorizedBy: 'Tahir Abbas (Plant Manager)',
    securityOfficer: 'Sub. Rtd. Ghulam Haider',
    items: [
      {
        itemId: 'item-5',
        itemName: 'Deep Groove Ball Bearing 6205-2RS',
        sku: 'SPR-BRG-6205',
        quantity: 10,
        unit: 'Pieces',
        unitCost: 1250,
        remarks: 'To be reconditioned and tested under vendor warranty'
      }
    ],
    remarks: 'Returnable within 7 business days with QA test certificate.'
  }
];

