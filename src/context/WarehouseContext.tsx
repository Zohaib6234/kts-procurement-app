import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  InventoryItem,
  Vendor,
  PurchaseRequisition,
  PurchaseOrder,
  GoodsReceiptNote,
  StockMovement,
  WarehouseZone,
  PRStatus,
  POStatus,
  StockStatus,
  StockIssuanceGatePass,
  GatePassStatus
} from '../types';
import {
  INITIAL_INVENTORY,
  INITIAL_VENDORS,
  INITIAL_PRS,
  INITIAL_POS,
  INITIAL_GRNS,
  INITIAL_MOVEMENTS,
  INITIAL_ZONES,
  INITIAL_GATE_PASSES
} from '../data/initialData';
import { api } from '../services/api';

interface WarehouseContextType {
  items: InventoryItem[];
  vendors: Vendor[];
  purchaseRequisitions: PurchaseRequisition[];
  purchaseOrders: PurchaseOrder[];
  goodsReceiptNotes: GoodsReceiptNote[];
  movements: StockMovement[];
  zones: WarehouseZone[];
  // PR operations
  createPR: (pr: Omit<PurchaseRequisition, 'id' | 'prNumber' | 'status' | 'requestDate'>) => void;
  editPR: (id: string, updates: Partial<PurchaseRequisition>) => void;
  deletePR: (id: string) => void;
  updatePRStatus: (id: string, status: PRStatus, approverName?: string) => void;
  convertPRToPO: (
    prId: string,
    vendorId: string,
    extra: { paymentTerms: string; shippingTerms: string; expectedDeliveryDate: string; deliveryAddress: string }
  ) => void;
  // PO operations
  createPO: (po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'orderDate'>) => void;
  editPO: (id: string, updates: Partial<PurchaseOrder>) => void;
  deletePO: (id: string) => void;
  updatePOStatus: (id: string, status: POStatus) => void;
  // GRN & Receiving
  processGRN: (grn: Omit<GoodsReceiptNote, 'id' | 'grnNumber' | 'receivedDate'>) => void;
  // Stock operations
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'status' | 'lastRestockedAt'>) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  issueMaterial: (itemId: string, quantity: number, targetLocation: string, reason: string, user: string) => boolean;
  adjustStock: (itemId: string, newQuantity: number, reason: string, user: string) => void;
  // Gate Pass & Issuance operations
  gatePasses: StockIssuanceGatePass[];
  createGatePass: (data: Omit<StockIssuanceGatePass, 'id' | 'gatePassNumber' | 'issuanceNumber' | 'status'>) => StockIssuanceGatePass;
  updateGatePassStatus: (id: string, status: GatePassStatus, officerName?: string) => void;
  deleteGatePass: (id: string) => void;
  returnGatePassItems: (id: string, returnerName: string, notes?: string) => void;
  // Vendor operations
  addVendor: (vendor: Omit<Vendor, 'id' | 'code' | 'totalSpent'>) => void;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;
  // Reset
  resetToDemoData: () => void;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

function determineStockStatus(qty: number, reorder: number, safety: number): StockStatus {
  if (qty <= 0) return 'out_of_stock';
  if (qty <= reorder) return 'low_stock';
  if (qty > reorder * 4) return 'overstocked';
  return 'in_stock';
}

export const WarehouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('pms_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem('pms_vendors');
    return saved ? JSON.parse(saved) : INITIAL_VENDORS;
  });

  const [purchaseRequisitions, setPurchaseRequisitions] = useState<PurchaseRequisition[]>(() => {
    const saved = localStorage.getItem('pms_prs');
    return saved ? JSON.parse(saved) : INITIAL_PRS;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('pms_pos');
    if (!saved) return INITIAL_POS;
    try {
      const parsed: PurchaseOrder[] = JSON.parse(saved);
      return parsed.map(po => ({
        ...po,
        deliveryAddress: po.deliveryAddress && po.deliveryAddress.includes('Islamabad')
          ? 'KTS Central Bus Depot, Gate 3, Malir Transit Hub, Karachi'
          : po.deliveryAddress || 'KTS Central Bus Depot, Malir Transit Hub, Karachi'
      }));
    } catch {
      return INITIAL_POS;
    }
  });

  const [goodsReceiptNotes, setGoodsReceiptNotes] = useState<GoodsReceiptNote[]>(() => {
    const saved = localStorage.getItem('pms_grns');
    return saved ? JSON.parse(saved) : INITIAL_GRNS;
  });

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem('pms_movements');
    return saved ? JSON.parse(saved) : INITIAL_MOVEMENTS;
  });

  const [gatePasses, setGatePasses] = useState<StockIssuanceGatePass[]>(() => {
    const saved = localStorage.getItem('pms_gatepasses');
    return saved ? JSON.parse(saved) : INITIAL_GATE_PASSES;
  });

  const [zones] = useState<WarehouseZone[]>(INITIAL_ZONES);

  // Sync to localStorage and Cloud SQL
  useEffect(() => {
    localStorage.setItem('pms_inventory', JSON.stringify(items));
  }, [items]);

  // Load from Cloud SQL on initial mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const syncData = await api.getSyncAll();
        if (syncData && isMounted) {
          if (syncData.items && syncData.items.length > 0) setItems(syncData.items);
          if (syncData.vendors && syncData.vendors.length > 0) setVendors(syncData.vendors);
          if (syncData.requisitions && syncData.requisitions.length > 0) setPurchaseRequisitions(syncData.requisitions);
          if (syncData.orders && syncData.orders.length > 0) setPurchaseOrders(syncData.orders);
          if (syncData.grns && syncData.grns.length > 0) setGoodsReceiptNotes(syncData.grns);
          if (syncData.gatePasses && syncData.gatePasses.length > 0) setGatePasses(syncData.gatePasses);
          if (syncData.movements && syncData.movements.length > 0) setMovements(syncData.movements);
        }
      } catch (e) {
        console.warn('Initial Cloud SQL sync error:', e);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('pms_vendors', JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem('pms_prs', JSON.stringify(purchaseRequisitions));
  }, [purchaseRequisitions]);

  useEffect(() => {
    localStorage.setItem('pms_pos', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem('pms_grns', JSON.stringify(goodsReceiptNotes));
  }, [goodsReceiptNotes]);

  useEffect(() => {
    localStorage.setItem('pms_movements', JSON.stringify(movements));
  }, [movements]);

  useEffect(() => {
    localStorage.setItem('pms_gatepasses', JSON.stringify(gatePasses));
  }, [gatePasses]);

  // Create PR
  const createPR = (prData: Omit<PurchaseRequisition, 'id' | 'prNumber' | 'status' | 'requestDate'>) => {
    const newPrNumber = `PR-${new Date().getFullYear()}-${String(purchaseRequisitions.length + 42).padStart(4, '0')}`;
    const today = new Date().toISOString().split('T')[0];
    const newPr: PurchaseRequisition = {
      ...prData,
      id: `pr-${Date.now()}`,
      prNumber: newPrNumber,
      requestDate: today,
      status: 'pending'
    };
    setPurchaseRequisitions(prev => [newPr, ...prev]);
    api.savePR(newPr);
  };

  // Edit PR
  const editPR = (id: string, updates: Partial<PurchaseRequisition>) => {
    setPurchaseRequisitions(prev =>
      prev.map(pr => {
        if (pr.id === id) {
          const updated = { ...pr, ...updates };
          if (updates.items) {
            updated.totalEstimatedCost = updates.items.reduce(
              (acc, item) => acc + item.quantity * item.estimatedCost,
              0
            );
          }
          return updated;
        }
        return pr;
      })
    );
  };

  // Delete PR
  const deletePR = (id: string) => {
    setPurchaseRequisitions(prev => prev.filter(pr => pr.id !== id));
  };

  // Update PR Status
  const updatePRStatus = (id: string, status: PRStatus, approverName: string = 'Hassan Raza (Procurement Manager)') => {
    const today = new Date().toISOString().split('T')[0];
    setPurchaseRequisitions(prev =>
      prev.map(pr => {
        if (pr.id === id) {
          return {
            ...pr,
            status,
            approvedBy: status === 'approved' ? approverName : pr.approvedBy,
            approvalDate: status === 'approved' ? today : pr.approvalDate
          };
        }
        return pr;
      })
    );
  };

  // Convert approved PR to PO
  const convertPRToPO = (
    prId: string,
    vendorId: string,
    extra: { paymentTerms: string; shippingTerms: string; expectedDeliveryDate: string; deliveryAddress: string }
  ) => {
    const pr = purchaseRequisitions.find(p => p.id === prId);
    const vendor = vendors.find(v => v.id === vendorId);
    if (!pr || !vendor) return;

    const poNumber = `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 90).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const poItems = pr.items.map(item => ({
      itemId: item.itemId,
      itemName: item.itemName,
      sku: item.sku,
      orderedQty: item.quantity,
      receivedQty: 0,
      unitPrice: item.estimatedCost,
      total: item.quantity * item.estimatedCost
    }));

    const subtotal = poItems.reduce((acc, curr) => acc + curr.total, 0);
    const taxAmount = Math.round(subtotal * 0.17); // 17% Standard GST/Sales Tax
    const grandTotal = subtotal + taxAmount;

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber,
      prId: pr.id,
      prNumber: pr.prNumber,
      vendorId: vendor.id,
      vendorName: vendor.name,
      orderDate: today,
      expectedDeliveryDate: extra.expectedDeliveryDate,
      status: 'issued',
      items: poItems,
      subtotal,
      taxAmount,
      grandTotal,
      paymentTerms: extra.paymentTerms,
      shippingTerms: extra.shippingTerms,
      deliveryAddress: extra.deliveryAddress,
      notes: `Generated from Approved Requisition ${pr.prNumber}. ${pr.notes || ''}`
    };

    setPurchaseOrders(prev => [newPO, ...prev]);

    // Mark PR as converted_to_po
    setPurchaseRequisitions(prev =>
      prev.map(p => (p.id === prId ? { ...p, status: 'converted_to_po' } : p))
    );

    // Update vendor active orders
    setVendors(prev =>
      prev.map(v => (v.id === vendorId ? { ...v, totalSpent: v.totalSpent + grandTotal } : v))
    );
  };

  // Create standalone PO
  const createPO = (poData: Omit<PurchaseOrder, 'id' | 'poNumber' | 'orderDate'>) => {
    const poNumber = `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 90).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];
    const newPO: PurchaseOrder = {
      ...poData,
      id: `po-${Date.now()}`,
      poNumber,
      orderDate: today
    };

    setPurchaseOrders(prev => [newPO, ...prev]);

    setVendors(prev =>
      prev.map(v => (v.id === poData.vendorId ? { ...v, totalSpent: v.totalSpent + poData.grandTotal } : v))
    );
  };

  const editPO = (id: string, updates: Partial<PurchaseOrder>) => {
    setPurchaseOrders(prev =>
      prev.map(po => {
        if (po.id === id) {
          const updated = { ...po, ...updates };
          if (updates.items) {
            const subtotal = updates.items.reduce((acc, item) => acc + item.total, 0);
            const taxAmount = Math.round(subtotal * 0.17);
            updated.subtotal = subtotal;
            updated.taxAmount = taxAmount;
            updated.grandTotal = subtotal + taxAmount;
          }
          return updated;
        }
        return po;
      })
    );
  };

  const deletePO = (id: string) => {
    setPurchaseOrders(prev => prev.filter(po => po.id !== id));
  };

  const updatePOStatus = (id: string, status: POStatus) => {
    setPurchaseOrders(prev => prev.map(po => (po.id === id ? { ...po, status } : po)));
  };

  // Process Goods Receipt Note (GRN) with Inspection
  const processGRN = (grnData: Omit<GoodsReceiptNote, 'id' | 'grnNumber' | 'receivedDate'>) => {
    const grnNumber = `GRN-${new Date().getFullYear()}-${String(goodsReceiptNotes.length + 113).padStart(4, '0')}`;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);
    const fullDateStr = `${dateStr} ${timeStr}`;

    const newGRN: GoodsReceiptNote = {
      ...grnData,
      id: `grn-${Date.now()}`,
      grnNumber,
      receivedDate: dateStr
    };

    setGoodsReceiptNotes(prev => [newGRN, ...prev]);

    // 1. Update Inventory stock on hand & location for accepted quantities
    setItems(prevItems => {
      return prevItems.map(item => {
        const receivedItem = grnData.items.find(gi => gi.itemId === item.id || gi.sku === item.sku);
        if (receivedItem && receivedItem.acceptedQty > 0) {
          const newQty = item.quantityOnHand + receivedItem.acceptedQty;
          return {
            ...item,
            quantityOnHand: newQty,
            warehouseZone: receivedItem.targetZone || item.warehouseZone,
            bin: receivedItem.targetBin || item.bin,
            lastRestockedAt: dateStr,
            status: determineStockStatus(newQty, item.reorderLevel, item.safetyStock)
          };
        }
        return item;
      });
    });

    // 2. Generate stock movement audit records
    const newMovements: StockMovement[] = grnData.items
      .filter(gi => gi.acceptedQty > 0)
      .map(gi => ({
        id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        movementType: 'receipt',
        itemId: gi.itemId,
        itemName: gi.itemName,
        sku: gi.sku,
        quantity: gi.acceptedQty,
        toLocation: `${gi.targetZone} / ${gi.targetBin}`,
        referenceNumber: grnNumber,
        date: fullDateStr,
        performedBy: grnData.receivedBy,
        reason: `Goods Receipt against PO ${grnData.poNumber} (Vendor: ${grnData.vendorName})`
      }));

    if (newMovements.length > 0) {
      setMovements(prev => [...newMovements, ...prev]);
    }

    // 3. Update Purchase Order received quantities & check completion
    setPurchaseOrders(prevPOs => {
      return prevPOs.map(po => {
        if (po.id === grnData.poId || po.poNumber === grnData.poNumber) {
          const updatedItems = po.items.map(poItem => {
            const grnItem = grnData.items.find(gi => gi.itemId === poItem.itemId || gi.sku === poItem.sku);
            if (grnItem) {
              return {
                ...poItem,
                receivedQty: poItem.receivedQty + grnItem.acceptedQty
              };
            }
            return poItem;
          });

          // Check if all items fully delivered
          const allCompleted = updatedItems.every(item => item.receivedQty >= item.orderedQty);
          const partiallyReceived = updatedItems.some(item => item.receivedQty > 0);

          return {
            ...po,
            items: updatedItems,
            status: allCompleted ? 'completed' : partiallyReceived ? 'partially_received' : po.status
          };
        }
        return po;
      });
    });
  };

  // Add Inventory Item
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'status' | 'lastRestockedAt'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newItem: InventoryItem = {
      ...itemData,
      id: `item-${Date.now()}`,
      status: determineStockStatus(itemData.quantityOnHand, itemData.reorderLevel, itemData.safetyStock),
      lastRestockedAt: today
    };

    setItems(prev => [newItem, ...prev]);

    // Log initial stock creation movement
    if (newItem.quantityOnHand > 0) {
      const now = new Date();
      const movement: StockMovement = {
        id: `mov-${Date.now()}`,
        movementType: 'adjustment',
        itemId: newItem.id,
        itemName: newItem.name,
        sku: newItem.sku,
        quantity: newItem.quantityOnHand,
        toLocation: `${newItem.warehouseZone} / ${newItem.aisle} / ${newItem.bin}`,
        referenceNumber: 'INIT-STOCK',
        date: `${today} ${now.toTimeString().slice(0, 5)}`,
        performedBy: 'System Administrator',
        reason: 'Initial item master onboarding'
      };
      setMovements(prev => [movement, ...prev]);
    }
  };

  // Update Inventory Item
  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          updated.status = determineStockStatus(updated.quantityOnHand, updated.reorderLevel, updated.safetyStock);
          return updated;
        }
        return item;
      })
    );
  };

  // Delete Inventory Item
  const deleteInventoryItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Material Issue / Dispatch to Department or Production
  const issueMaterial = (itemId: string, quantity: number, targetLocation: string, reason: string, user: string): boolean => {
    const targetItem = items.find(i => i.id === itemId);
    if (!targetItem || targetItem.quantityOnHand < quantity) {
      return false; // Insufficient stock
    }

    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().slice(0, 5);
    const issNumber = `ISS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Decrement stock
    setItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          const newQty = item.quantityOnHand - quantity;
          return {
            ...item,
            quantityOnHand: newQty,
            status: determineStockStatus(newQty, item.reorderLevel, item.safetyStock)
          };
        }
        return item;
      })
    );

    // Add movement
    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      movementType: 'issue',
      itemId: targetItem.id,
      itemName: targetItem.name,
      sku: targetItem.sku,
      quantity: -quantity,
      fromLocation: `${targetItem.warehouseZone} / ${targetItem.aisle} / ${targetItem.bin}`,
      toLocation: targetLocation,
      referenceNumber: issNumber,
      date: `${today} ${time}`,
      performedBy: user,
      reason: reason || 'Material issue for department operations'
    };

    setMovements(prev => [movement, ...prev]);
    return true;
  };

  // Stock physical audit adjustment
  const adjustStock = (itemId: string, newQuantity: number, reason: string, user: string) => {
    const targetItem = items.find(i => i.id === itemId);
    if (!targetItem) return;

    const delta = newQuantity - targetItem.quantityOnHand;
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().slice(0, 5);
    const adjNumber = `ADJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    setItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            quantityOnHand: newQuantity,
            status: determineStockStatus(newQuantity, item.reorderLevel, item.safetyStock)
          };
        }
        return item;
      })
    );

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      movementType: 'adjustment',
      itemId: targetItem.id,
      itemName: targetItem.name,
      sku: targetItem.sku,
      quantity: delta,
      fromLocation: `${targetItem.warehouseZone} / ${targetItem.aisle} / ${targetItem.bin}`,
      referenceNumber: adjNumber,
      date: `${today} ${time}`,
      performedBy: user,
      reason: reason || 'Physical inventory cycle reconciliation'
    };

    setMovements(prev => [movement, ...prev]);
  };

  // Vendor operations
  const addVendor = (vendorData: Omit<Vendor, 'id' | 'code' | 'totalSpent'>) => {
    const code = `VND-${String(vendors.length + 1).padStart(3, '0')}`;
    const newVendor: Vendor = {
      ...vendorData,
      id: `ven-${Date.now()}`,
      code,
      totalSpent: 0
    };
    setVendors(prev => [newVendor, ...prev]);
  };

  const updateVendor = (id: string, updates: Partial<Vendor>) => {
    setVendors(prev => prev.map(v => (v.id === id ? { ...v, ...updates } : v)));
  };

  const deleteVendor = (id: string) => {
    setVendors(prev => prev.filter(v => v.id !== id));
  };

  // Gate Pass & Stock Issuance Operations
  const createGatePass = (data: Omit<StockIssuanceGatePass, 'id' | 'gatePassNumber' | 'issuanceNumber' | 'status'>): StockIssuanceGatePass => {
    const year = new Date().getFullYear();
    const count = gatePasses.length + 41;
    const gatePassNumber = `GP-${year}-${String(count).padStart(4, '0')}`;
    const issuanceNumber = `ISS-${year}-${String(count + 380).padStart(4, '0')}`;
    const id = `gp-${Date.now()}`;

    const newPass: StockIssuanceGatePass = {
      ...data,
      id,
      gatePassNumber,
      issuanceNumber,
      status: 'issued'
    };

    setGatePasses(prev => [newPass, ...prev]);

    // 1. Deduct stock for all issued items
    setItems(prevItems => {
      return prevItems.map(item => {
        const passItem = data.items.find(pi => pi.itemId === item.id || pi.sku === item.sku);
        if (passItem && passItem.quantity > 0) {
          const newQty = Math.max(0, item.quantityOnHand - passItem.quantity);
          return {
            ...item,
            quantityOnHand: newQty,
            status: determineStockStatus(newQty, item.reorderLevel, item.safetyStock)
          };
        }
        return item;
      });
    });

    // 2. Record Stock Movements for each item
    const nowStr = data.issueDate || new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newMovements: StockMovement[] = data.items.map(pi => {
      const inv = items.find(i => i.id === pi.itemId || i.sku === pi.sku);
      return {
        id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        movementType: 'issue',
        itemId: pi.itemId,
        itemName: pi.itemName,
        sku: pi.sku,
        quantity: -pi.quantity,
        fromLocation: inv ? `${inv.warehouseZone} / ${inv.aisle} / ${inv.bin}` : 'Main Warehouse',
        toLocation: `${data.department} (${data.issuedTo})`,
        referenceNumber: gatePassNumber,
        date: nowStr,
        performedBy: data.issuedBy,
        reason: `${data.passType === 'returnable' ? '[RGP-Returnable]' : '[NRGP-NonReturnable]'} ${data.purpose || 'Store stock dispatch'}`
      };
    });

    if (newMovements.length > 0) {
      setMovements(prev => [...newMovements, ...prev]);
      newMovements.forEach(m => api.saveMovement(m));
    }

    api.saveGatePass(newPass);

    return newPass;
  };

  const updateGatePassStatus = (id: string, status: GatePassStatus, officerName?: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setGatePasses(prev =>
      prev.map(gp => {
        if (gp.id === id) {
          const updated = { ...gp, status };
          if (status === 'cleared_at_gate') {
            updated.gateOutTimestamp = timestamp;
            if (officerName) updated.securityOfficer = officerName;
          } else if (status === 'returned') {
            updated.gateInTimestamp = timestamp;
          }
          api.saveGatePass(updated);
          return updated;
        }
        return gp;
      })
    );
  };

  const deleteGatePass = (id: string) => {
    setGatePasses(prev => prev.filter(gp => gp.id !== id));
  };

  const returnGatePassItems = (id: string, returnerName: string, notes?: string) => {
    const pass = gatePasses.find(gp => gp.id === id);
    if (!pass) return;

    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);

    // Restock items back into warehouse
    setItems(prevItems => {
      return prevItems.map(item => {
        const passItem = pass.items.find(pi => pi.itemId === item.id || pi.sku === item.sku);
        if (passItem && passItem.quantity > 0) {
          const newQty = item.quantityOnHand + passItem.quantity;
          return {
            ...item,
            quantityOnHand: newQty,
            status: determineStockStatus(newQty, item.reorderLevel, item.safetyStock)
          };
        }
        return item;
      });
    });

    // Record return stock movements
    const returnMovements: StockMovement[] = pass.items.map(pi => {
      const inv = items.find(i => i.id === pi.itemId || i.sku === pi.sku);
      return {
        id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        movementType: 'receipt',
        itemId: pi.itemId,
        itemName: pi.itemName,
        sku: pi.sku,
        quantity: pi.quantity,
        fromLocation: `${pass.department} (${returnerName})`,
        toLocation: inv ? `${inv.warehouseZone} / ${inv.aisle} / ${inv.bin}` : 'Main Warehouse Return Bay',
        referenceNumber: `RET-${pass.gatePassNumber}`,
        date: timestamp,
        performedBy: returnerName,
        reason: `RGP Return: ${pass.gatePassNumber} - ${notes || 'Materials returned after service/use'}`
      };
    });

    setMovements(prev => [...returnMovements, ...prev]);

    // Update Gate Pass status
    setGatePasses(prev =>
      prev.map(gp => {
        if (gp.id === id) {
          return {
            ...gp,
            status: 'returned',
            gateInTimestamp: timestamp,
            remarks: notes ? `${gp.remarks || ''} [Returned on ${timestamp}: ${notes}]` : gp.remarks
          };
        }
        return gp;
      })
    );
  };

  // Reset to initial demo data
  const resetToDemoData = () => {
    setItems(INITIAL_INVENTORY);
    setVendors(INITIAL_VENDORS);
    setPurchaseRequisitions(INITIAL_PRS);
    setPurchaseOrders(INITIAL_POS);
    setGoodsReceiptNotes(INITIAL_GRNS);
    setMovements(INITIAL_MOVEMENTS);
    setGatePasses(INITIAL_GATE_PASSES);
    localStorage.removeItem('pms_inventory');
    localStorage.removeItem('pms_vendors');
    localStorage.removeItem('pms_prs');
    localStorage.removeItem('pms_pos');
    localStorage.removeItem('pms_grns');
    localStorage.removeItem('pms_movements');
    localStorage.removeItem('pms_gatepasses');
  };

  return (
    <WarehouseContext.Provider
      value={{
        items,
        vendors,
        purchaseRequisitions,
        purchaseOrders,
        goodsReceiptNotes,
        movements,
        zones,
        gatePasses,
        createGatePass,
        updateGatePassStatus,
        deleteGatePass,
        returnGatePassItems,
        createPR,
        editPR,
        deletePR,
        updatePRStatus,
        convertPRToPO,
        createPO,
        editPO,
        deletePO,
        updatePOStatus,
        processGRN,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        issueMaterial,
        adjustStock,
        addVendor,
        updateVendor,
        deleteVendor,
        resetToDemoData
      }}
    >
      {children}
    </WarehouseContext.Provider>
  );
};

export const useWarehouse = () => {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error('useWarehouse must be used within a WarehouseProvider');
  }
  return context;
};
