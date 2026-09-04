// src/db/seed.ts
import { db } from './index.ts';
import {
  users,
  inventoryItems,
  vendors,
  purchaseRequisitions,
  purchaseOrders,
  goodsReceiptNotes,
  gatePasses,
  stockMovements,
  warehouseZones,
  systemSettings,
  securityLogs
} from './schema.ts';
import {
  INITIAL_ZONES,
  INITIAL_VENDORS,
  INITIAL_INVENTORY,
  INITIAL_PRS,
  INITIAL_POS,
  INITIAL_GRNS,
  INITIAL_MOVEMENTS,
  INITIAL_GATE_PASSES
} from '../data/initialData.ts';
import {
  INITIAL_USERS,
  INITIAL_SETTINGS,
  INITIAL_SECURITY_LOGS
} from '../data/authInitialData.ts';

export async function seedDatabaseIfEmpty() {
  try {
    const existingItems = await db.select().from(inventoryItems).limit(1);
    if (existingItems.length > 0) {
      console.log('Database already populated. Skipping initial seed.');
      return;
    }

    console.log('Seeding initial Karachi Transport Service (KTS) fleet data to Cloud SQL...');

    // 1. System Settings
    await db.insert(systemSettings).values({
      id: 'default',
      companyName: 'Karachi Transport Service (KTS)',
      facilityCode: 'KTS-MALIR-DEPOT-01',
      currencySymbol: 'Rs.',
      reorderAlertThreshold: 20,
      autoPRGeneration: true,
      strictQCMode: true,
      sessionTimeoutMinutes: 60,
      enforceTwoFactor: false,
      maintenanceMode: false
    }).onConflictDoNothing();

    // 2. Warehouse Zones
    if (INITIAL_ZONES.length > 0) {
      await db.insert(warehouseZones).values(INITIAL_ZONES).onConflictDoNothing();
    }

    // 3. Vendors
    if (INITIAL_VENDORS.length > 0) {
      await db.insert(vendors).values(INITIAL_VENDORS as any).onConflictDoNothing();
    }

    // 4. Inventory Items
    if (INITIAL_INVENTORY.length > 0) {
      await db.insert(inventoryItems).values(INITIAL_INVENTORY as any).onConflictDoNothing();
    }

    // 5. Purchase Requisitions
    if (INITIAL_PRS.length > 0) {
      await db.insert(purchaseRequisitions).values(INITIAL_PRS as any).onConflictDoNothing();
    }

    // 6. Purchase Orders
    if (INITIAL_POS.length > 0) {
      await db.insert(purchaseOrders).values(INITIAL_POS as any).onConflictDoNothing();
    }

    // 7. GRNs
    if (INITIAL_GRNS.length > 0) {
      await db.insert(goodsReceiptNotes).values(INITIAL_GRNS as any).onConflictDoNothing();
    }

    // 8. Gate Passes
    if (INITIAL_GATE_PASSES.length > 0) {
      await db.insert(gatePasses).values(INITIAL_GATE_PASSES as any).onConflictDoNothing();
    }

    // 9. Stock Movements
    if (INITIAL_MOVEMENTS.length > 0) {
      await db.insert(stockMovements).values(INITIAL_MOVEMENTS as any).onConflictDoNothing();
    }

    // 10. System Users
    for (const u of INITIAL_USERS) {
      await db.insert(users).values({
        id: u.id,
        uid: u.id,
        username: u.username,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department,
        avatar: u.avatar || '',
        status: u.status,
        assignedWarehouse: u.assignedWarehouse || 'KTS Central Fleet Depot, Malir',
        phone: u.phone,
        createdAt: new Date(u.createdAt)
      }).onConflictDoNothing();
    }

    // 11. Security Logs
    if (INITIAL_SECURITY_LOGS.length > 0) {
      await db.insert(securityLogs).values(INITIAL_SECURITY_LOGS as any).onConflictDoNothing();
    }

    console.log('Cloud SQL successfully seeded with KTS fleet records!');
  } catch (err) {
    console.error('Error during initial Cloud SQL database seed:', err);
  }
}
