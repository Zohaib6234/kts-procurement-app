import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { PurchaseOrder, PurchaseRequisition, InventoryItem, Vendor, GoodsReceiptNote, SecurityLog } from '../types';
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
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, pageWidth, 60, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PROWAREHOUSE ERP', margin, 28);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('INDUSTRIAL PROCUREMENT & WAREHOUSE INVENTORY SUITE', margin, 44);

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
      `ProWarehouse System • Confidential Enterprise Document • Page ${i} of ${totalPages}`,
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
      { label: 'Special Instructions:', value: pr.notes || 'Standard manufacturing replenishment' }
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
    subtitle: `Total Active SKUs: ${items.length} | Facility: WH-Central Islamabad`,
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

