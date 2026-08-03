const DEFAULT_DATABASE_NAME = 'saju_app';
const DEFAULT_DATABASE_VERSION = 1;
const RECORDS_STORE = 'records';
const OUTBOX_STORE = 'submissionOutbox';

function requestValue(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB request failed'));
  });
}

function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error('IndexedDB transaction failed'));
    transaction.onabort = () => reject(transaction.error || new Error('IndexedDB transaction aborted'));
  });
}

export function createAnnualStorage({
  indexedDB = globalThis.indexedDB,
  databaseName = DEFAULT_DATABASE_NAME,
  databaseVersion = DEFAULT_DATABASE_VERSION,
  outboxBinding = 'purpose-receipt-bound',
} = {}) {
  if (!indexedDB || typeof indexedDB.open !== 'function') throw new Error('IndexedDB unavailable');

  async function open() {
    const request = indexedDB.open(databaseName, databaseVersion);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(RECORDS_STORE)) db.createObjectStore(RECORDS_STORE, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(OUTBOX_STORE)) db.createObjectStore(OUTBOX_STORE, { keyPath: 'id' });
    };
    return requestValue(request);
  }

  async function get(storeName, id) {
    if (!id) return null;
    const db = await open();
    try {
      return (await requestValue(db.transaction(storeName, 'readonly').objectStore(storeName).get(id))) || null;
    } finally {
      db.close();
    }
  }

  async function write(storeNames, operation) {
    const db = await open();
    try {
      const transaction = db.transaction(storeNames, 'readwrite');
      operation(transaction);
      await transactionDone(transaction);
    } finally {
      db.close();
    }
  }

  return Object.freeze({
    getRecord(id) {
      return get(RECORDS_STORE, id);
    },
    getOutboxEntry(id) {
      return get(OUTBOX_STORE, id);
    },
    async putRecord(record) {
      if (!record?.id) throw new Error('record.id is required');
      await write(RECORDS_STORE, (transaction) => transaction.objectStore(RECORDS_STORE).put(record));
      return record;
    },
    async putPendingRecord(record, payload) {
      if (!record?.id) throw new Error('record.id is required');
      const entry = {
        id: record.id,
        record,
        payload,
        purpose: record.training ? 'service_storage+model_training' : 'service_storage',
        binding: outboxBinding,
        status: 'pending-sync',
        updatedAt: record.updatedAt,
      };
      await write([RECORDS_STORE, OUTBOX_STORE], (transaction) => {
        transaction.objectStore(RECORDS_STORE).put(record);
        transaction.objectStore(OUTBOX_STORE).put(entry);
      });
      return entry;
    },
    async updateOutboxRecord(record, purposeReceipts = record?.purposeReceipts) {
      if (!record?.id) throw new Error('record.id is required');
      const existing = await get(OUTBOX_STORE, record.id);
      if (!existing) return null;
      const updated = {
        ...existing,
        record,
        payload: { ...existing.payload, purposeReceipts },
        purpose: record.training ? 'service_storage+model_training' : 'service_storage',
        updatedAt: record.updatedAt,
      };
      await write(OUTBOX_STORE, (transaction) => transaction.objectStore(OUTBOX_STORE).put(updated));
      return updated;
    },
    async clearOutbox(id) {
      if (!id) return false;
      await write(OUTBOX_STORE, (transaction) => transaction.objectStore(OUTBOX_STORE).delete(id));
      return true;
    },
    async deleteRecord(id) {
      if (!id) return false;
      await write([RECORDS_STORE, OUTBOX_STORE], (transaction) => {
        transaction.objectStore(RECORDS_STORE).delete(id);
        transaction.objectStore(OUTBOX_STORE).delete(id);
      });
      return true;
    },
    async listRecords() {
      const db = await open();
      try {
        const records = await requestValue(db.transaction(RECORDS_STORE, 'readonly').objectStore(RECORDS_STORE).getAll());
        return records.sort((left, right) => String(right.createdAt || right.updatedAt || '').localeCompare(String(left.createdAt || left.updatedAt || '')));
      } finally {
        db.close();
      }
    },
    async clearAll() {
      await write([RECORDS_STORE, OUTBOX_STORE], (transaction) => {
        transaction.objectStore(RECORDS_STORE).clear();
        transaction.objectStore(OUTBOX_STORE).clear();
      });
    },
  });
}
