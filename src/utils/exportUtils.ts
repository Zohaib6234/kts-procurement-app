import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { PurchaseOrder, PurchaseRequisition, InventoryItem, Vendor, GoodsReceiptNote, SecurityLog, StockIssuanceGatePass } from '../types';
import { formatCurrency, formatNumber } from './formatters';

// -------------------------------------------------------------
// GENERIC EXCEL (.XLSX) EXPORT
// -------------------------------------------------------------
export const exportToExcel = (
  filename: string,
  data: Record<string, any>[],
  sheetName: string = 'Data'
) => {
  if (!data || data.length === 0) return;
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

// -------------------------------------------------------------
// GENERIC PDF EXPORT WITH STRUCTURED TABLE LAYOUT
// -------------------------------------------------------------
export interface PDFExportOptions {
  filename: string;
  title: string;
  subtitle?: string;
  headers: string[];
  rows: (string | number)[][];
  columnWidths?: number[];
  summary?: { label: string; value: string }[];
}

export const exportTableToPDF = (options: PDFExportOptions) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const usableWidth = pageWidth - margin * 2;

  // Header Banner
  doc.setFillColor(9, 30, 58); // KTS deep navy #091e3a
  doc.rect(0, 0, pageWidth, 60, 'F');

  // Decorative brand accent line
  doc.setFillColor(2, 132, 199); // KTS transit cyan #0284c7
  doc.rect(0, 57, pageWidth, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('KARACHI TRANSPORT SERVICE (KTS)', margin, 27);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(186, 230, 253); // sky-200
  doc.text('PROCUREMENT & FLEET WAREHOUSE MANAGEMENT SYSTEM', margin, 42);

  const dateStr = new Date().toLocaleString();
  doc.text(`Generated: ${dateStr}`, pageWidth - margin, 44, { align: 'right' });

  // Document Title & Subtitle
  let y = 85;
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(options.title, margin, y);

  if (options.subtitle) {
    y += 14;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(options.subtitle, margin, y);
  }

  y += 20;

  // Calculate column widths
  const numCols = options.headers.length;
  const colWidth = usableWidth / numCols;

  // Table Header Row
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(margin, y, usableWidth, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');

  options.headers.forEach((header, index) => {
    const x = margin + index * colWidth + 5;
    doc.text(header.toUpperCase(), x, y + 14);
  });

  y += 22;

  // Table Data Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  options.rows.forEach((row, rowIndex) => {
    // Check page break
    if (y + 20 > pageHeight - 60) {
      doc.addPage();
      y = 40;
    }

    if (rowIndex % 2 === 0) {
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(margin, y, usableWidth, 18, 'F');
    }

    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(margin, y + 18, margin + usableWidth, y + 18);

    doc.setTextColor(51, 65, 85); // slate-700
    row.forEach((cell, colIndex) => {
      const x = margin + colIndex * colWidth + 5;
      const cellText = cell !== null && cell !== undefined ? String(cell) : '-';
      const truncated = cellText.length > 25 ? cellText.substring(0, 23) + '..' : cellText;
      doc.text(truncated, x, y + 12);
    });

    y += 18;
  });

  // Summary section
  if (options.summary && options.summary.length > 0) {
    y += 15;
    if (y + 50 > pageHeight - 40) {
      doc.addPage();
      y = 40;
    }

    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, usableWidth, 18 * options.summary.length + 8, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, y, usableWidth, 18 * options.summary.length + 8, 'S');

    let sumY = y + 14;
    options.summary.forEach(item => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(item.label, margin + 10, sumY);
      doc.setTextColor(79, 70, 229);
      doc.text(item.value, pageWidth - margin - 10, sumY, { align: 'right' });
      sumY += 18;
    });
  }

  // Footer page number
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Karachi Transport Service (KTS) • Fleet Procurement & Stores • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 15,
      { align: 'center' }
    );
  }

  doc.save(`${options.filename}.pdf`);
};

// -------------------------------------------------------------
// PURCHASE REQUISITION (PR) EXPORTS
// -------------------------------------------------------------
export const exportPRsToExcel = (prs: PurchaseRequisition[]) => {
  const data = prs.map(pr => ({
    'PR Number': pr.prNumber,
    'Department': pr.department,
    'Requested By': pr.requestedBy,
    'Request Date': pr.requestDate,
    'Required Date': pr.requiredDate,
    'Urgency': pr.urgency.toUpperCase(),
    'Status': pr.status.replace('_', ' ').toUpperCase(),
    'Items Count': pr.items.length,
    'Est. Total Cost (PKR)': pr.totalEstimatedCost,
    'Approved By': pr.approvedBy || 'N/A',
    'Approval Date': pr.approvalDate || 'N/A',
    'Notes': pr.notes || ''
  }));
  exportToExcel(`Purchase_Requisitions_${new Date().toISOString().split('T')[0]}`, data, 'Requisitions');
};

export const exportPRSlipPDF = (pr: PurchaseRequisition) => {
  const headers = ['Item SKU', 'Item Name & Specs', 'Requested Qty', 'Est. Unit Cost', 'Total Est. Cost'];
  const rows = pr.items.map(item => [
    item.sku,
    item.itemName,
    item.quantity,
    formatCurrency(item.estimatedCost),
    formatCurrency(item.quantity * item.estimatedCost)
  ]);

  exportTableToPDF({
    filename: `PR_Slip_${pr.prNumber}`,
    title: `PURCHASE REQUISITION: ${pr.prNumber}`,
    subtitle: `Department: ${pr.department} | Requester: ${pr.requestedBy} | Target: ${pr.requiredDate} | Status: ${pr.status.toUpperCase()}`,
    headers,
    rows,
    summary: [
      { label: 'Total Requisition Amount:', value: formatCurrency(pr.totalEstimatedCost) },
      { label: 'Authorization Status:', value: pr.status === 'approved' ? `Approved by ${pr.approvedBy || 'Manager'}` : pr.status.toUpperCase() },
      { label: 'Special Instructions:', value: pr.notes || 'Official KTS fleet maintenance & bus depot replenishment' }
    ]
  });
};

// -------------------------------------------------------------
// PURCHASE ORDER (PO) EXPORTS
// -------------------------------------------------------------
export const exportPOsToExcel = (pos: PurchaseOrder[]) => {
  const data = pos.map(po => ({
    'PO Number': po.poNumber,
    'Ref PR': po.prNumber || 'Direct PO',
    'Vendor Name': po.vendorName,
    'Order Date': po.orderDate,
    'Expected Delivery': po.expectedDeliveryDate,
    'Status': po.status.replace('_', ' ').toUpperCase(),
    'Subtotal (PKR)': po.subtotal,
    'Tax (GST 17%)': po.taxAmount,
    'Grand Total (PKR)': po.grandTotal,
    'Payment Terms': po.paymentTerms,
    'Shipping Terms': po.shippingTerms,
    'Delivery Address': po.deliveryAddress
  }));
  exportToExcel(`Purchase_Orders_${new Date().toISOString().split('T')[0]}`, data, 'PurchaseOrders');
};

export const exportPOSlipPDF = (po: PurchaseOrder) => {
  const headers = ['SKU', 'Item Description', 'Ordered Qty', 'Received Qty', 'Unit Price', 'Total'];
  const rows = po.items.map(item => [
    item.sku,
    item.itemName,
    item.orderedQty,
    item.receivedQty,
    formatCurrency(item.unitPrice),
    formatCurrency(item.total)
  ]);

  exportTableToPDF({
    filename: `Official_PO_${po.poNumber}`,
    title: `OFFICIAL PURCHASE ORDER: ${po.poNumber}`,
    subtitle: `Vendor: ${po.vendorName} | Order Date: ${po.orderDate} | Delivery Target: ${po.expectedDeliveryDate}`,
    headers,
    rows,
    summary: [
      { label: 'Subtotal Amount (Excl. Tax):', value: formatCurrency(po.subtotal) },
      { label: 'Sales Tax / GST (17%):', value: formatCurrency(po.taxAmount) },
      { label: 'Grand Total Payable (PKR):', value: formatCurrency(po.grandTotal) },
      { label: 'Payment Terms:', value: po.paymentTerms },
      { label: 'Shipping Terms:', value: po.shippingTerms },
      { label: 'Delivery Destination:', value: po.deliveryAddress }
    ]
  });
};

// -------------------------------------------------------------
// INVENTORY ITEMS EXPORTS (VENDOR-WISE SUPPORTED)
// -------------------------------------------------------------
export const exportInventoryToExcel = (items: InventoryItem[], vendorFilterName?: string) => {
  const data = items.map(item => ({
    'SKU': item.sku,
    'Item Name': item.name,
    'Primary Vendor': item.vendorName || 'Unassigned',
    'Category': item.category,
    'Unit': item.unit,
    'Quantity On Hand': item.quantityOnHand,
    'Reserved Qty': item.reservedQuantity,
    'Reorder Level': item.reorderLevel,
    'Safety Stock': item.safetyStock,
    'Unit Cost (PKR)': item.unitCost,
    'Total Valuation (PKR)': item.quantityOnHand * item.unitCost,
    'Warehouse Bay': item.warehouseZone,
    'Bin Slot': `${item.aisle}-${item.shelf}-${item.bin}`,
    'Stock Status': item.status.replace('_', ' ').toUpperCase(),
    'Last Restocked': item.lastRestockedAt
  }));

  const filenameSuffix = vendorFilterName ? `_${vendorFilterName.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
  exportToExcel(`Inventory_Stock_Report${filenameSuffix}_${new Date().toISOString().split('T')[0]}`, data, 'Inventory');
};

export const exportInventoryToPDF = (items: InventoryItem[], vendorFilterName?: string) => {
  const headers = ['SKU', 'Item Name', 'Vendor', 'Qty', 'Unit', 'Unit Cost', 'Valuation', 'Zone/Bin', 'Status'];
  const rows = items.map(item => [
    item.sku,
    item.name,
    item.vendorName || 'General',
    item.quantityOnHand,
    item.unit,
    formatCurrency(item.unitCost),
    formatCurrency(item.quantityOnHand * item.unitCost),
    `${item.warehouseZone}/${item.bin}`,
    item.status.replace('_', ' ')
  ]);

  const totalQty = items.reduce((acc, i) => acc + i.quantityOnHand, 0);
  const totalVal = items.reduce((acc, i) => acc + i.quantityOnHand * i.unitCost, 0);

  exportTableToPDF({
    filename: `Inventory_Report_${new Date().toISOString().split('T')[0]}`,
    title: vendorFilterName ? `INVENTORY LEDGER: SUPPLIER ${vendorFilterName.toUpperCase()}` : 'WAREHOUSE INVENTORY MASTER REGISTER',
    subtitle: `Total Active SKUs: ${items.length} | Facility: KTS-MALIR-DEPOT-01 (Karachi)`,
    headers,
    rows,
    summary: [
      { label: 'Total Units in Inventory:', value: `${formatNumber(totalQty)} Units` },
      { label: 'Gross Inventory Valuation:', value: formatCurrency(totalVal) }
    ]
  });
};

// -------------------------------------------------------------
// VENDORS DIRECTORY EXPORTS
// -------------------------------------------------------------
export const exportVendorsToExcel = (vendors: Vendor[]) => {
  const data = vendors.map(v => ({
    'Vendor Code': v.code,
    'Vendor Name': v.name,
    'Contact Person': v.contactPerson,
    'Email': v.email,
    'Phone': v.phone,
    'Address': v.address,
    'Rating (Out of 5)': v.rating,
    'On-Time Delivery (%)': v.onTimeDeliveryRate,
    'Quality Score (%)': v.qualityRating,
    'Lead Time (Days)': v.leadTimeDays,
    'Payment Terms': v.paymentTerms,
    'Categories': v.categories.join(', '),
    'Cumulative Spend (PKR)': v.totalSpent,
    'Status': v.status.toUpperCase()
  }));

  exportToExcel(`Vendor_Directory_${new Date().toISOString().split('T')[0]}`, data, 'Vendors');
};

export const exportVendorsToPDF = (vendors: Vendor[]) => {
  const headers = ['Code', 'Company Name', 'Contact', 'Phone', 'Rating', 'OTD %', 'Lead Time', 'Spend', 'Status'];
  const rows = vendors.map(v => [
    v.code,
    v.name,
    v.contactPerson,
    v.phone,
    `${v.rating.toFixed(1)}/5`,
    `${v.onTimeDeliveryRate}%`,
    `${v.leadTimeDays}d`,
    formatCurrency(v.totalSpent),
    v.status.toUpperCase()
  ]);

  const totalSpend = vendors.reduce((acc, v) => acc + v.totalSpent, 0);

  exportTableToPDF({
    filename: `Vendor_Directory_${new Date().toISOString().split('T')[0]}`,
    title: 'OFFICIAL APPROVED VENDOR DIRECTORY',
    subtitle: `Active Commercial Suppliers: ${vendors.length} | Quality & Procurement Performance`,
    headers,
    rows,
    summary: [
      { label: 'Total Vendors Registered:', value: `${vendors.length} Vendors` },
      { label: 'Total Procurement Spend Disbursed:', value: formatCurrency(totalSpend) }
    ]
  });
};

// -------------------------------------------------------------
// AUDIT & SECURITY LOGS EXPORTS
// -------------------------------------------------------------
export const exportAuditLogsToExcel = (logs: SecurityLog[]) => {
  const data = logs.map(l => ({
    'Log ID': l.id,
    'Timestamp': l.timestamp,
    'Actor Name': l.userName,
    'Actor Email': l.userEmail,
    'Action Type': l.action,
    'IP Address': l.ipAddress,
    'Status': l.status.toUpperCase(),
    'Event Description': l.details
  }));

  exportToExcel(`Security_Audit_Trail_${new Date().toISOString().split('T')[0]}`, data, 'AuditLogs');
};

export const exportAuditLogsToPDF = (logs: SecurityLog[]) => {
  const headers = ['Timestamp', 'Actor', 'Action', 'IP Host', 'Status', 'Event Description'];
  const rows = logs.map(l => [
    l.timestamp,
    `${l.userName} (${l.userEmail})`,
    l.action,
    l.ipAddress,
    l.status.toUpperCase(),
    l.details
  ]);

  exportTableToPDF({
    filename: `Security_Audit_Trail_${new Date().toISOString().split('T')[0]}`,
    title: 'ERP SECURITY & GOVERNANCE AUDIT TRAIL',
    subtitle: `Total Captured Audit Records: ${logs.length} | Regulatory & Compliance Log`,
    headers,
    rows,
    summary: [
      { label: 'Total Audit Records:', value: `${logs.length} events` },
      { label: 'Integrity Check:', value: 'Verified & Timestamped' }
    ]
  });
};

// -------------------------------------------------------------
// GATE PASS & STOCK ISSUANCE EXPORTS
// -------------------------------------------------------------
export const exportGatePassPDF = (
  gp: StockIssuanceGatePass,
  companyName: string = 'KARACHI TRANSPORT SERVICE (KTS)'
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const usableWidth = pageWidth - margin * 2;
  const isReturnable = gp.passType === 'returnable';

  // Header Banner
  doc.setFillColor(isReturnable ? 15 : 9, isReturnable ? 23 : 30, isReturnable ? 42 : 58); // deep navy #091e3a
  doc.rect(0, 0, pageWidth, 68, 'F');

  // Decorative accent line
  doc.setFillColor(isReturnable ? 245 : 2, isReturnable ? 158 : 132, isReturnable ? 11 : 199); // amber for RGP, cyan #0284c7 for NRGP
  doc.rect(0, 65, pageWidth, 3, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  const orgName = (companyName || 'KARACHI TRANSPORT SERVICE (KTS)').toUpperCase();
  doc.text(orgName, margin, 28);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(186, 230, 253);
  doc.text('CENTRAL BUS DEPOT & FLEET MATERIAL MANAGEMENT • OFFICIAL OUTWARD PASS', margin, 44);

  // Pass Type Badge in top right
  const badgeText = isReturnable ? 'RETURNABLE GATE PASS (RGP)' : 'NON-RETURNABLE GATE PASS (NRGP)';
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isReturnable ? 251 : 199, isReturnable ? 191 : 210, isReturnable ? 36 : 254);
  doc.text(badgeText, pageWidth - margin, 32, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Status: ${gp.status.toUpperCase().replace(/_/g, ' ')}`, pageWidth - margin, 46, { align: 'right' });

  let y = 84;

  // Key Identifiers Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, usableWidth, 80, 4, 4, 'FD');

  // Left Column
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('GATE PASS NUMBER:', margin + 12, y + 18);
  doc.text('ISSUANCE REF #:', margin + 12, y + 33);
  doc.text('ISSUE DATE & TIME:', margin + 12, y + 48);
  doc.text('RECIPIENT / DEPT:', margin + 12, y + 63);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(gp.gatePassNumber, margin + 120, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(gp.issuanceNumber, margin + 120, y + 33);
  doc.text(gp.issueDate, margin + 120, y + 48);
  doc.text(`${gp.department} (${gp.issuedTo})`, margin + 120, y + 63);

  // Right Column
  const midX = margin + usableWidth / 2 + 10;
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('VEHICLE REG #:', midX, y + 18);
  doc.text('CARRIER / DRIVER:', midX, y + 33);
  doc.text('DRIVER CNIC / ID:', midX, y + 48);
  doc.text(isReturnable ? 'EXPECTED RETURN:' : 'PASS CATEGORY:', midX, y + 63);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(gp.vehicleNumber || 'Internal Hand Carry', midX + 98, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(gp.carrierName || 'Store Porter', midX + 98, y + 33);
  doc.text(gp.carrierCnic || 'Verified On-Site', midX + 98, y + 48);
  doc.setFont('helvetica', isReturnable ? 'bold' : 'normal');
  if (isReturnable) {
    doc.setTextColor(180, 83, 9); // dark amber
    doc.text(gp.expectedReturnDate || 'Within 7 Days', midX + 98, y + 63);
  } else {
    doc.text('Non-Returnable (Outward Consumption)', midX + 98, y + 63);
  }

  y += 94;

  // Purpose / Scope
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('PURPOSE / DISPATCH REASON:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(gp.purpose || 'Material issuance for operational consumption', margin + 140, y);

  y += 16;

  // Table of Items
  const headers = ['S#', 'SKU Code', 'Description / Item Specifications', 'UOM', 'Qty Issued', 'Remarks / Batch'];
  const colWidths = [28, 90, 210, 50, 60, 85]; // Sums to 523 (matches usableWidth ~ 523pt)

  // Header row
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, usableWidth, 20, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);

  let currentX = margin + 6;
  headers.forEach((h, i) => {
    doc.text(h, currentX, y + 13);
    currentX += colWidths[i];
  });

  y += 20;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  let totalQuantity = 0;
  gp.items.forEach((item, idx) => {
    totalQuantity += item.quantity;
    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.rect(margin, y, usableWidth, 22, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + 22, margin + usableWidth, y + 22);

    let x = margin + 6;
    // S#
    doc.text(String(idx + 1), x, y + 14);
    x += colWidths[0];
    // SKU
    doc.setFont('helvetica', 'bold');
    doc.text(item.sku, x, y + 14);
    doc.setFont('helvetica', 'normal');
    x += colWidths[1];
    // Name (truncate if long)
    const nameStr = item.itemName.length > 40 ? item.itemName.slice(0, 38) + '..' : item.itemName;
    doc.text(nameStr, x, y + 14);
    x += colWidths[2];
    // UOM
    doc.text(item.unit || 'Units', x, y + 14);
    x += colWidths[3];
    // Qty
    doc.setFont('helvetica', 'bold');
    doc.text(String(item.quantity), x, y + 14);
    doc.setFont('helvetica', 'normal');
    x += colWidths[4];
    // Remarks
    doc.text(item.remarks || 'Standard Issue', x, y + 14);

    y += 22;
  });

  // Table Total Row
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, usableWidth, 20, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL ITEMS DISPATCHED:', margin + 6, y + 14);
  doc.text(`${gp.items.length} Line(s)  •  ${totalQuantity} Total Units`, margin + usableWidth - 140, y + 14, { align: 'right' });

  y += 35;

  // Regulatory Declaration Box
  doc.setFillColor(254, 252, 232); // light amber
  doc.setDrawColor(254, 240, 138);
  doc.roundedRect(margin, y, usableWidth, 38, 3, 3, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(133, 77, 14);
  doc.text('SECURITY & COMPLIANCE DIRECTIVE:', margin + 8, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(113, 63, 18);
  doc.text(
    isReturnable
      ? '1. Goods listed above remain property of the company and must be returned on/before the due date in intact condition.\n2. Security Checkpoint must stamp Gate-Out time and record Inward verification upon return.'
      : '1. No material shall leave the premises without physical inspection by the Main Gate Security Supervisor.\n2. Carrier must preserve this official slip for destination acknowledgment and return one stamped copy to Store Control.',
    margin + 8,
    y + 23
  );

  y += 55;

  // 4 Signature / Stamp Blocks
  const boxWidth = (usableWidth - 24) / 4;
  const boxHeight = 70;

  const signBoxes = [
    { title: 'PREPARED / ISSUED BY', name: gp.issuedBy, role: 'Store Officer' },
    { title: 'AUTHORIZED BY', name: gp.authorizedBy, role: 'Department Head / Mgr' },
    { title: 'CARRIER / BEARER', name: gp.carrierName || gp.issuedTo, role: 'Received Goods' },
    { title: 'GATE SECURITY OFFICER', name: gp.securityOfficer || 'Main Gate Checkpoint', role: gp.gateOutTimestamp ? `Out: ${gp.gateOutTimestamp}` : 'Verified & Inspected' }
  ];

  signBoxes.forEach((box, i) => {
    const boxX = margin + i * (boxWidth + 8);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(boxX, y, boxWidth, boxHeight, 3, 3, 'D');

    // Header label
    doc.setFillColor(241, 245, 249);
    doc.rect(boxX, y, boxWidth, 16, 'F');
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(box.title, boxX + boxWidth / 2, y + 11, { align: 'center' });

    // Signature line
    doc.setDrawColor(203, 213, 225);
    doc.line(boxX + 8, y + 46, boxX + boxWidth - 8, y + 46);

    // Name & Role
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(box.name, boxX + boxWidth / 2, y + 56, { align: 'center' });

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(box.role, boxX + boxWidth / 2, y + 65, { align: 'center' });
  });

  // Footer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Karachi Transport Service (KTS) • Gate Pass Generated: ${new Date().toLocaleString()} • Ref: ${gp.gatePassNumber}`,
    pageWidth / 2,
    pageHeight - 16,
    { align: 'center' }
  );

  doc.save(`${gp.gatePassNumber}_Official_Gate_Pass.pdf`);
};

export const exportGatePassRegisterToExcel = (passes: StockIssuanceGatePass[]) => {
  const data = passes.map(gp => ({
    'Gate Pass #': gp.gatePassNumber,
    'Issuance Ref #': gp.issuanceNumber,
    'Pass Type': gp.passType === 'returnable' ? 'Returnable (RGP)' : 'Non-Returnable (NRGP)',
    'Status': gp.status.toUpperCase().replace(/_/g, ' '),
    'Issue Date': gp.issueDate,
    'Expected Return': gp.expectedReturnDate || 'N/A',
    'Recipient / Dept': gp.department,
    'Issued To': gp.issuedTo,
    'Carrier / Driver': gp.carrierName || 'Store Porter',
    'Carrier CNIC': gp.carrierCnic || 'N/A',
    'Vehicle #': gp.vehicleNumber || 'Hand Carry',
    'Total Items Count': gp.items.length,
    'Total Units Qty': gp.items.reduce((acc, i) => acc + i.quantity, 0),
    'Items Summary': gp.items.map(i => `${i.sku} (${i.quantity} ${i.unit})`).join(', '),
    'Purpose': gp.purpose,
    'Issued By': gp.issuedBy,
    'Authorized By': gp.authorizedBy,
    'Gate Officer': gp.securityOfficer || 'Pending Gate Clearance',
    'Gate Out Timestamp': gp.gateOutTimestamp || 'Pending Outward',
    'Gate In Timestamp': gp.gateInTimestamp || 'N/A',
    'Remarks': gp.remarks || ''
  }));

  exportToExcel(`Gate_Pass_Register_${new Date().toISOString().split('T')[0]}`, data, 'GatePassRegister');
};

export const exportGatePassRegisterToPDF = (passes: StockIssuanceGatePass[]) => {
  const headers = ['Gate Pass #', 'Type', 'Date', 'Recipient / Destination', 'Vehicle #', 'Items Count', 'Status'];
  const rows = passes.map(gp => [
    gp.gatePassNumber,
    gp.passType === 'returnable' ? 'RGP' : 'NRGP',
    gp.issueDate.split(' ')[0],
    gp.department.length > 25 ? gp.department.slice(0, 23) + '..' : gp.department,
    gp.vehicleNumber || 'Hand Carry',
    `${gp.items.reduce((acc, i) => acc + i.quantity, 0)} Units (${gp.items.length} items)`,
    gp.status.toUpperCase().replace(/_/g, ' ')
  ]);

  exportTableToPDF({
    filename: `Gate_Pass_Register_${new Date().toISOString().split('T')[0]}`,
    title: 'OFFICIAL GATE PASS & WAREHOUSE ISSUANCE REGISTER',
    subtitle: `Total Gate Passes: ${passes.length} | Returnable (RGP) & Non-Returnable (NRGP) Dispatches`,
    headers,
    rows,
    summary: [
      { label: 'Total Issued Passes:', value: `${passes.length} passes` },
      { label: 'Returnable (RGP):', value: `${passes.filter(p => p.passType === 'returnable').length} active` },
      { label: 'Cleared Out at Gate:', value: `${passes.filter(p => p.status === 'cleared_at_gate').length} vehicles/bearers` }
    ]
  });
};

// -------------------------------------------------------------
// GOODS RECEIPT NOTE (GRN) PDF EXPORT
// -------------------------------------------------------------
export const exportGRNSlipPDF = (grn: GoodsReceiptNote) => {
  const headers = ['SKU', 'Item Name', 'Delivered', 'Accepted', 'Rejected', 'Location'];
  const rows = grn.items.map(item => [
    item.sku,
    item.itemName,
    formatNumber(item.deliveredQty),
    formatNumber(item.acceptedQty),
    formatNumber(item.rejectedQty),
    `${item.targetZone} / ${item.targetBin}`
  ]);

  const totalDelivered = grn.items.reduce((acc, i) => acc + i.deliveredQty, 0);
  const totalAccepted = grn.items.reduce((acc, i) => acc + i.acceptedQty, 0);
  const totalRejected = grn.items.reduce((acc, i) => acc + i.rejectedQty, 0);

  exportTableToPDF({
    filename: `GRN_Slip_${grn.grnNumber}`,
    title: `GOODS RECEIPT NOTE: ${grn.grnNumber}`,
    subtitle: `PO Ref: ${grn.poNumber} | Vendor: ${grn.vendorName} | Inward Date: ${grn.receivedDate} | QC Officer: ${grn.receivedBy}`,
    headers,
    rows,
    summary: [
      { label: 'Inspection Result:', value: grn.inspectionStatus.toUpperCase() },
      { label: 'Total Units Inspected:', value: `${formatNumber(totalDelivered)} Delivered (${formatNumber(totalAccepted)} Accepted, ${formatNumber(totalRejected)} Rejected)` },
      { label: 'Invoice / Delivery Ref:', value: `Invoice #${grn.invoiceNumber || 'N/A'} • Vehicle #${grn.vehicleNumber || 'N/A'}` },
      { label: 'Remarks / Comments:', value: grn.remarks || 'Sound inward condition. Accepted parts added to stock.' }
    ]
  });
};


