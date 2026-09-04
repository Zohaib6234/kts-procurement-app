// src/services/api.ts
// Handles real-time synchronization between client UI and Cloud SQL backend

export const api = {
  // 1. Fetch full synchronized state
  async getSyncAll() {
    try {
      const res = await fetch('/api/sync/all');
      if (!res.ok) throw new Error(`Sync failed: ${res.statusText}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend sync unreachable, falling back to local state:', err);
      return null;
    }
  },

  // 2. Inventory Items
  async saveItem(item: any) {
    try {
      await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
    } catch (e) {
      console.warn('Offline: failed to save item to Cloud SQL', e);
    }
  },

  async deleteItem(id: string) {
    try {
      await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Offline: failed to delete item', e);
    }
  },

  // 3. Vendors
  async saveVendor(vendor: any) {
    try {
      await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendor),
      });
    } catch (e) {
      console.warn('Offline: failed to save vendor', e);
    }
  },

  // 4. Purchase Requisitions
  async savePR(pr: any) {
    try {
      await fetch('/api/requisitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pr),
      });
    } catch (e) {
      console.warn('Offline: failed to save PR', e);
    }
  },

  // 5. Purchase Orders
  async savePO(po: any) {
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(po),
      });
    } catch (e) {
      console.warn('Offline: failed to save PO', e);
    }
  },

  // 6. Goods Receipt Notes (GRN)
  async saveGRN(grn: any) {
    try {
      await fetch('/api/grns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(grn),
      });
    } catch (e) {
      console.warn('Offline: failed to save GRN', e);
    }
  },

  // 7. Gate Passes & Stock Issuance
  async saveGatePass(gp: any) {
    try {
      await fetch('/api/gatepasses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gp),
      });
    } catch (e) {
      console.warn('Offline: failed to save gate pass', e);
    }
  },

  // 8. Stock Movements
  async saveMovement(mv: any) {
    try {
      await fetch('/api/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mv),
      });
    } catch (e) {
      console.warn('Offline: failed to save movement', e);
    }
  },

  // 9. Security Logs
  async saveLog(log: any) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
      });
    } catch (e) {
      console.warn('Offline: failed to save log', e);
    }
  },

  // 10. System Settings
  async saveSettings(settings: any) {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
    } catch (e) {
      console.warn('Offline: failed to save settings', e);
    }
  },

  // 11. Reset Cloud SQL to KTS initial dataset
  async resetDatabase() {
    const res = await fetch('/api/reset-data', { method: 'POST' });
    return await res.json();
  }
};
