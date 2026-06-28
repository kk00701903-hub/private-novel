import { downloadTextFile } from '@/lib/fileDownload';

const HANDLE_DB = 'novel-md-storage';
const HANDLE_STORE = 'handles';
const HANDLE_KEY = 'export-dir';

type FileSystemDirectoryHandle = globalThis.FileSystemDirectoryHandle;

function openHandleDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(HANDLE_DB, 1);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(HANDLE_STORE);
    };
  });
}

async function persistDirHandle(handle: FileSystemDirectoryHandle) {
  const db = await openHandleDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(HANDLE_STORE, 'readwrite');
    tx.objectStore(HANDLE_STORE).put(handle, HANDLE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function loadDirHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openHandleDb();
    const handle = await new Promise<FileSystemDirectoryHandle | undefined>((resolve, reject) => {
      const tx = db.transaction(HANDLE_STORE, 'readonly');
      const req = tx.objectStore(HANDLE_STORE).get(HANDLE_KEY);
      req.onsuccess = () => resolve(req.result as FileSystemDirectoryHandle | undefined);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return handle ?? null;
  } catch {
    return null;
  }
}

let cachedDirHandle: FileSystemDirectoryHandle | null = null;
let handleLoaded = false;

export function supportsMdFolderPicker(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

export async function initMdStorage(): Promise<void> {
  if (handleLoaded) return;
  handleLoaded = true;
  cachedDirHandle = await loadDirHandle();
  if (cachedDirHandle) {
    const perm = await cachedDirHandle.queryPermission({ mode: 'readwrite' });
    if (perm !== 'granted') {
      cachedDirHandle = null;
    }
  }
}

export async function pickMdSaveFolder(): Promise<string | null> {
  if (!supportsMdFolderPicker()) return null;
  try {
    const handle = await window.showDirectoryPicker({
      id: 'novel-md-export',
      mode: 'readwrite',
      startIn: 'documents',
    });
    cachedDirHandle = handle;
    await persistDirHandle(handle);
    return handle.name;
  } catch {
    return null;
  }
}

export function getMdSaveFolderName(): string | null {
  return cachedDirHandle?.name ?? null;
}

export async function clearMdSaveFolder(): Promise<void> {
  cachedDirHandle = null;
  try {
    const db = await openHandleDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(HANDLE_STORE, 'readwrite');
      tx.objectStore(HANDLE_STORE).delete(HANDLE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    /* ignore */
  }
}

async function writeToFolder(filename: string, content: string): Promise<boolean> {
  if (!cachedDirHandle) return false;
  try {
    const perm = await cachedDirHandle.requestPermission({ mode: 'readwrite' });
    if (perm !== 'granted') return false;
    const fileHandle = await cachedDirHandle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
    return true;
  } catch {
    return false;
  }
}

/** Save MD to connected folder, or trigger browser download. */
export async function saveMdLocally(filename: string, content: string): Promise<void> {
  if (!handleLoaded) await initMdStorage();
  const written = await writeToFolder(filename, content);
  if (!written) {
    downloadTextFile(filename, content);
  }
}
