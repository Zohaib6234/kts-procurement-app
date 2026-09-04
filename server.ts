// server.ts
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index.ts';
import {
  inventoryItems,
  vendors,
  purchaseRequisitions,
  purchaseOrders,
  goodsReceiptNotes,
  gatePasses,
  stockMovements,
  warehouseZones,
  systemSettings,
  securityLogs,
  users
} from './src/db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import { seedDatabaseIfEmpty } from './src/db/seed.ts';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Karachi Transport Service (KTS) ERP Backend',
    database: 'Google Cloud SQL (PostgreSQL)',
    timestamp: new Date().toISOString(),
  });
});

// Seed DB on start lazily
seedDatabaseIfEmpty().catch(err => {
  console.error('Seed error:', err);
});

// 1. Inventory Items
app.get('/api/inventory', async (req, res) => {
  try {
    const data = await db.select().from(inventoryItems);
    res.json(data);
  } catch (err: any) {
    console.error('Failed to get inventory:', err);
    res.status(500).json({ error: 'Failed to retrieve inventory items' });
  }
});

app.post('/api/inventory', async (req, res) => {
  try {
    const item = req.body;
    await db.insert(inventoryItems).values(item).onConflictDoUpdate({
      target: inventoryItems.id,
      set: {
        ...item,
        updatedAt: new Date(),
      }
    });
    res.json({ success: true, item });
  } catch (err: any) {
    console.error('Failed to save item:', err);
    res.status(500).json({ error: 'Failed to save inventory item' });
  }
});

app.delete('/api/inventory/:id', async (req, res) => {
  try {
    await db.delete(inventoryItems).where(eq(inventoryItems.id, req.params.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
});

// 2. Vendors
app.get('/api/vendors', async (req, res) => {
  try {
    const data = await db.select().from(vendors);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve vendors' });
  }
});

app.post('/api/vendors', async (req, res) => {
  try {
    const vendor = req.body;
    await db.insert(vendors).values(vendor).onConflictDoUpdate({
      target: vendors.id,
      set: vendor
    });
    res.json({ success: true, vendor });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save vendor' });
  }
});

// 3. Purchase Requisitions
app.get('/api/requisitions', async (req, res) => {
  try {
    const data = await db.select().from(purchaseRequisitions);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve requisitions' });
  }
});

app.post('/api/requisitions', async (req, res) => {
  try {
    const pr = req.body;
    await db.insert(purchaseRequisitions).values(pr).onConflictDoUpdate({
      target: purchaseRequisitions.id,
      set: pr
    });
    res.json({ success: true, pr });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save requisition' });
  }
});

// 4. Purchase Orders
app.get('/api/orders', async (req, res) => {
  try {
    const data = await db.select().from(purchaseOrders);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const po = req.body;
    await db.insert(purchaseOrders).values(po).onConflictDoUpdate({
      target: purchaseOrders.id,
      set: po
    });
    res.json({ success: true, po });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save order' });
  }
});

// 5. Goods Receipt Notes (GRN)
app.get('/api/grns', async (req, res) => {
  try {
    const data = await db.select().from(goodsReceiptNotes);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve GRNs' });
  }
});

app.post('/api/grns', async (req, res) => {
  try {
    const grn = req.body;
    await db.insert(goodsReceiptNotes).values(grn).onConflictDoUpdate({
      target: goodsReceiptNotes.id,
      set: grn
    });
    res.json({ success: true, grn });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save GRN' });
  }
});

// 6. Gate Passes & Stock Issuance
app.get('/api/gatepasses', async (req, res) => {
  try {
    const data = await db.select().from(gatePasses);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve gate passes' });
  }
});

app.post('/api/gatepasses', async (req, res) => {
  try {
    const gp = req.body;
    await db.insert(gatePasses).values(gp).onConflictDoUpdate({
      target: gatePasses.id,
      set: gp
    });
    res.json({ success: true, gp });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save gate pass' });
  }
});

// 7. Stock Movements
app.get('/api/movements', async (req, res) => {
  try {
    const data = await db.select().from(stockMovements).orderBy(desc(stockMovements.date)).limit(200);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve stock movements' });
  }
});

app.post('/api/movements', async (req, res) => {
  try {
    const mv = req.body;
    await db.insert(stockMovements).values(mv).onConflictDoNothing();
    res.json({ success: true, mv });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record movement' });
  }
});

// 8. Warehouse Zones
app.get('/api/zones', async (req, res) => {
  try {
    const data = await db.select().from(warehouseZones);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve zones' });
  }
});

// 9. Security Logs
app.get('/api/logs', async (req, res) => {
  try {
    const data = await db.select().from(securityLogs).orderBy(desc(securityLogs.timestamp)).limit(200);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve logs' });
  }
});

app.post('/api/logs', async (req, res) => {
  try {
    const log = req.body;
    await db.insert(securityLogs).values(log).onConflictDoNothing();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record security log' });
  }
});

// 10. System Settings
app.get('/api/settings', async (req, res) => {
  try {
    const data = await db.select().from(systemSettings).where(eq(systemSettings.id, 'default'));
    res.json(data[0] || null);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve settings' });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const settings = req.body;
    await db.insert(systemSettings).values({
      ...settings,
      id: 'default',
    }).onConflictDoUpdate({
      target: systemSettings.id,
      set: {
        ...settings,
        updatedAt: new Date()
      }
    });
    res.json({ success: true, settings });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// 11. Users
app.get('/api/users', async (req, res) => {
  try {
    const data = await db.select().from(users);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// 12. Full Database State Sync
app.get('/api/sync/all', async (req, res) => {
  try {
    const [
      itemList,
      vendorList,
      prList,
      poList,
      grnList,
      gpList,
      mvList,
      zoneList,
      settingItem,
      userList
    ] = await Promise.all([
      db.select().from(inventoryItems),
      db.select().from(vendors),
      db.select().from(purchaseRequisitions),
      db.select().from(purchaseOrders),
      db.select().from(goodsReceiptNotes),
      db.select().from(gatePasses),
      db.select().from(stockMovements).orderBy(desc(stockMovements.date)),
      db.select().from(warehouseZones),
      db.select().from(systemSettings).where(eq(systemSettings.id, 'default')),
      db.select().from(users),
    ]);

    res.json({
      items: itemList,
      vendors: vendorList,
      requisitions: prList,
      orders: poList,
      grns: grnList,
      gatePasses: gpList,
      movements: mvList,
      zones: zoneList,
      settings: settingItem[0] || null,
      users: userList,
      connectedToCloudSQL: true
    });
  } catch (err: any) {
    console.error('Failed to fetch synced data from Cloud SQL:', err);
    res.status(500).json({ error: 'Cloud SQL fetch error', details: err.message });
  }
});

// Reset to KTS fleet data in Cloud SQL
app.post('/api/reset-data', async (req, res) => {
  try {
    await db.delete(stockMovements);
    await db.delete(gatePasses);
    await db.delete(goodsReceiptNotes);
    await db.delete(purchaseOrders);
    await db.delete(purchaseRequisitions);
    await db.delete(inventoryItems);
    await db.delete(vendors);
    await db.delete(warehouseZones);

    await seedDatabaseIfEmpty();
    res.json({ success: true, message: 'Cloud SQL reset to Karachi Transport Service data' });
  } catch (err: any) {
    console.error('Failed to reset Cloud SQL data:', err);
    res.status(500).json({ error: 'Failed to reset data' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Karachi Transport Service ERP running on http://0.0.0.0:${PORT} with Cloud SQL`);
  });
}

startServer();
