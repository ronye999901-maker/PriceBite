/**
 * ==============================================================================
 * ⚡ PRICEBITE MULTI-TIER RESILIENT CACHE ENGINE (L1 Memory + L2 Persistent)
 * ==============================================================================
 * Provides sub-millisecond price retrieval, TTL expiration, LRU eviction,
 * and comprehensive telemetry metrics for final-year architecture defense.
 * ==============================================================================
 */

export interface CacheEntry<T> {
  key: string;
  data: T;
  createdAt: number;
  expiresAt: number;
  ttlSeconds: number;
  hitsCount: number;
  lastAccessedAt: number;
  platform?: string;
  query?: string;
}

export interface CacheTelemetry {
  totalRequests: number;
  l1Hits: number;
  l2Hits: number;
  misses: number;
  evictions: number;
  hitRatioPercent: number;
  averageLatencyMs: number;
  totalEntriesCount: number;
  l1Count: number;
  l2Count: number;
}

export interface CacheEntrySummary {
  key: string;
  platform: string;
  query: string;
  ttlRemainingSeconds: number;
  hitsCount: number;
  tier: 'L1 (RAM)' | 'L2 (Storage)';
  createdAtIso: string;
}

const L2_STORAGE_PREFIX = 'pricebite_l2_cache_';
const DEFAULT_TTL_SECONDS = 900; // 15 Minutes
const MAX_L1_ENTRIES = 120;

// L1 In-Memory Storage
const l1MemoryCache = new Map<string, CacheEntry<any>>();

// Telemetry counters
let telemetryStats = {
  totalRequests: 0,
  l1Hits: 0,
  l2Hits: 0,
  misses: 0,
  evictions: 0,
  latenciesAccumulated: 0,
};

/**
 * Generates a standard cache key for platform price records
 */
export function buildPlatformCacheKey(platformId: string, pinCode: string, query: string): string {
  const cleanQ = query.trim().toLowerCase().replace(/\s+/g, '_');
  const cleanPin = (pinCode || 'metro').trim();
  return `${platformId}:${cleanPin}:${cleanQ}`;
}

/**
 * Retrieves an item from the multi-tier cache (L1 Memory -> L2 Storage)
 */
export function cacheGet<T>(key: string): {
  data: T | null;
  source: 'L1' | 'L2' | null;
  latencyMs: number;
} {
  const t0 = performance.now();
  telemetryStats.totalRequests++;

  const now = Date.now();

  // 1. Check Tier 1 (L1 Memory)
  if (l1MemoryCache.has(key)) {
    const entry = l1MemoryCache.get(key)!;
    if (now < entry.expiresAt) {
      entry.hitsCount++;
      entry.lastAccessedAt = now;
      telemetryStats.l1Hits++;

      const latencyMs = Math.round((performance.now() - t0) * 1000) / 1000;
      telemetryStats.latenciesAccumulated += latencyMs;
      return { data: entry.data, source: 'L1', latencyMs };
    } else {
      // Expired L1 item
      l1MemoryCache.delete(key);
      telemetryStats.evictions++;
    }
  }

  // 2. Check Tier 2 (L2 Browser LocalStorage)
  try {
    const serialized = localStorage.getItem(`${L2_STORAGE_PREFIX}${key}`);
    if (serialized) {
      const parsed: CacheEntry<T> = JSON.parse(serialized);
      if (now < parsed.expiresAt) {
        parsed.hitsCount++;
        parsed.lastAccessedAt = now;
        telemetryStats.l2Hits++;

        // Promote to L1 for faster next access
        l1MemoryCache.set(key, parsed);

        const latencyMs = Math.round((performance.now() - t0) * 1000) / 1000;
        telemetryStats.latenciesAccumulated += latencyMs;
        return { data: parsed.data, source: 'L2', latencyMs };
      } else {
        // Expired L2 item
        localStorage.removeItem(`${L2_STORAGE_PREFIX}${key}`);
        telemetryStats.evictions++;
      }
    }
  } catch (err) {
    console.warn('L2 Cache read error:', err);
  }

  // 3. Cache Miss
  telemetryStats.misses++;
  const latencyMs = Math.round((performance.now() - t0) * 1000) / 1000;
  telemetryStats.latenciesAccumulated += latencyMs;
  return { data: null, source: null, latencyMs };
}

/**
 * Stores an item in both L1 (Memory) and L2 (Storage) with TTL
 */
export function cacheSet<T>(
  key: string,
  data: T,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
  meta?: { platform?: string; query?: string }
): void {
  const now = Date.now();
  const expiresAt = now + ttlSeconds * 1000;

  // LRU Eviction check on L1
  if (l1MemoryCache.size >= MAX_L1_ENTRIES) {
    let oldestKey: string | null = null;
    let oldestAccess = Infinity;
    for (const [k, v] of l1MemoryCache.entries()) {
      if (v.lastAccessedAt < oldestAccess) {
        oldestAccess = v.lastAccessedAt;
        oldestKey = k;
      }
    }
    if (oldestKey) {
      l1MemoryCache.delete(oldestKey);
      telemetryStats.evictions++;
    }
  }

  const entry: CacheEntry<T> = {
    key,
    data,
    createdAt: now,
    expiresAt,
    ttlSeconds,
    hitsCount: 1,
    lastAccessedAt: now,
    platform: meta?.platform || key.split(':')[0] || 'platform',
    query: meta?.query || key.split(':')[2] || 'item',
  };

  // Write to L1
  l1MemoryCache.set(key, entry);

  // Write to L2
  try {
    localStorage.setItem(`${L2_STORAGE_PREFIX}${key}`, JSON.stringify(entry));
  } catch (err) {
    console.warn('L2 Cache storage quota exceeded or failed:', err);
  }
}

/**
 * Purges all L1 and L2 cache entries
 */
export function cacheClear(): void {
  l1MemoryCache.clear();
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(L2_STORAGE_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.warn('L2 cache purge error:', e);
  }
  telemetryStats.evictions += l1MemoryCache.size;
}

/**
 * Returns real-time telemetry metrics for architecture inspection
 */
export function getCacheTelemetry(): CacheTelemetry {
  const hits = telemetryStats.l1Hits + telemetryStats.l2Hits;
  const total = telemetryStats.totalRequests;
  const hitRatio = total > 0 ? (hits / total) * 100 : 0;
  const avgLatency = total > 0 ? telemetryStats.latenciesAccumulated / total : 0;

  let l2Count = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(L2_STORAGE_PREFIX)) l2Count++;
    }
  } catch {
    l2Count = 0;
  }

  return {
    totalRequests: telemetryStats.totalRequests,
    l1Hits: telemetryStats.l1Hits,
    l2Hits: telemetryStats.l2Hits,
    misses: telemetryStats.misses,
    evictions: telemetryStats.evictions,
    hitRatioPercent: Math.round(hitRatio * 10) / 10,
    averageLatencyMs: Math.round(avgLatency * 100) / 100,
    totalEntriesCount: l1MemoryCache.size + l2Count,
    l1Count: l1MemoryCache.size,
    l2Count,
  };
}

/**
 * Returns a list of all active cache entries with remaining TTL for live inspection
 */
export function getCacheEntriesList(): CacheEntrySummary[] {
  const summaries: CacheEntrySummary[] = [];
  const now = Date.now();

  // From L1
  for (const [key, entry] of l1MemoryCache.entries()) {
    const ttlRemaining = Math.max(0, Math.round((entry.expiresAt - now) / 1000));
    summaries.push({
      key,
      platform: entry.platform || key.split(':')[0],
      query: entry.query || key.split(':')[2],
      ttlRemainingSeconds: ttlRemaining,
      hitsCount: entry.hitsCount,
      tier: 'L1 (RAM)',
      createdAtIso: new Date(entry.createdAt).toLocaleTimeString(),
    });
  }

  // From L2 (if not already listed in L1)
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(L2_STORAGE_PREFIX)) {
        const rawKey = k.replace(L2_STORAGE_PREFIX, '');
        if (!l1MemoryCache.has(rawKey)) {
          const val = localStorage.getItem(k);
          if (val) {
            const parsed = JSON.parse(val);
            const ttlRemaining = Math.max(0, Math.round((parsed.expiresAt - now) / 1000));
            summaries.push({
              key: rawKey,
              platform: parsed.platform || rawKey.split(':')[0],
              query: parsed.query || rawKey.split(':')[2],
              ttlRemainingSeconds: ttlRemaining,
              hitsCount: parsed.hitsCount,
              tier: 'L2 (Storage)',
              createdAtIso: new Date(parsed.createdAt).toLocaleTimeString(),
            });
          }
        }
      }
    }
  } catch (e) {
    console.warn('Error reading L2 summaries:', e);
  }

  return summaries.slice(0, 50);
}
