// Service to limit QR code scans per user/profile
// Usage: canScan() -> {ok: boolean, errorType?: 'daily'|'fast'}
//        recordScan() -> void
//        getScanCounts() -> {daily: number, last5min: number}

const SCAN_KEY = 'atzengame_scan_timestamps';
const DAILY_LIMIT = 10;
const FAST_LIMIT = 2;
const DAY_MS = 24 * 60 * 60 * 1000;
const MIN5_MS = 5 * 60 * 1000;

function getTimestamps(): number[] {
  const raw = localStorage.getItem(SCAN_KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      return arr.filter((t) => typeof t === 'number');
    }
    return [];
  } catch {
    return [];
  }
}

function saveTimestamps(timestamps: number[]) {
  localStorage.setItem(SCAN_KEY, JSON.stringify(timestamps));
}

export function canScan(): { ok: boolean; errorType?: 'daily' | 'fast' } {
  const now = Date.now();
  const timestamps = getTimestamps();
  const last24h = timestamps.filter((t) => now - t < DAY_MS);
  const last5min = timestamps.filter((t) => now - t < MIN5_MS);
  if (last24h.length >= DAILY_LIMIT) {
    return { ok: false, errorType: 'daily' };
  }
  if (last5min.length >= FAST_LIMIT) {
    return { ok: false, errorType: 'fast' };
  }
  return { ok: true };
}

export function recordScan() {
  const now = Date.now();
  const timestamps = getTimestamps().filter((t) => now - t < DAY_MS);
  timestamps.push(now);
  saveTimestamps(timestamps);
}

export function getScanCounts() {
  const now = Date.now();
  const timestamps = getTimestamps();
  return {
    daily: timestamps.filter((t) => now - t < DAY_MS).length,
    last5min: timestamps.filter((t) => now - t < MIN5_MS).length,
  };
} 