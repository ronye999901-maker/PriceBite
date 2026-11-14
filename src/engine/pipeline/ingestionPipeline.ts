import { PlatformId, IngestionMetadata } from '../../types';
import { cacheGet, cacheSet, buildPlatformCacheKey } from '../cache/resilientCache';

/**
 * ==============================================================================
 * 🌐 PRICEBITE ENTERPRISE INGESTION PIPELINE & CIRCUIT BREAKER
 * ==============================================================================
 * Manages live network requests, request throttling, circuit breakers,
 * exponential backoffs, and deterministic fallback data streams.
 * ==============================================================================
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerStatus {
  platformId: PlatformId;
  state: CircuitState;
  failureCount: number;
  lastFailureTime: number | null;
  totalCalls: number;
  successfulCalls: number;
}

const CIRCUIT_FAILURE_THRESHOLD = 3;
const CIRCUIT_RESET_TIMEOUT_MS = 25000; // 25 seconds cooldown before half-open

// Platform Circuit Breaker Registry
const circuitBreakers: Record<PlatformId, CircuitBreakerStatus> = {
  pricebite: { platformId: 'pricebite', state: 'CLOSED', failureCount: 0, lastFailureTime: null, totalCalls: 0, successfulCalls: 0 },
  swiggy: { platformId: 'swiggy', state: 'CLOSED', failureCount: 0, lastFailureTime: null, totalCalls: 0, successfulCalls: 0 },
  zomato: { platformId: 'zomato', state: 'CLOSED', failureCount: 0, lastFailureTime: null, totalCalls: 0, successfulCalls: 0 },
  blinkit: { platformId: 'blinkit', state: 'CLOSED', failureCount: 0, lastFailureTime: null, totalCalls: 0, successfulCalls: 0 },
  zepto: { platformId: 'zepto', state: 'CLOSED', failureCount: 0, lastFailureTime: null, totalCalls: 0, successfulCalls: 0 },
  dominos: { platformId: 'dominos', state: 'CLOSED', failureCount: 0, lastFailureTime: null, totalCalls: 0, successfulCalls: 0 },
  kfc: { platformId: 'kfc', state: 'CLOSED', failureCount: 0, lastFailureTime: null, totalCalls: 0, successfulCalls: 0 },
  instamart: { platformId: 'instamart', state: 'CLOSED', failureCount: 0, lastFailureTime: null, totalCalls: 0, successfulCalls: 0 },
  zeptocafe: { platformId: 'zeptocafe', state: 'CLOSED', failureCount: 0, lastFailureTime: null, totalCalls: 0, successfulCalls: 0 },
};

// Global Peak Hour Surge Simulator
let isPeakSurgeActive = false;

export function togglePeakSurge(active?: boolean): boolean {
  isPeakSurgeActive = active !== undefined ? active : !isPeakSurgeActive;
  return isPeakSurgeActive;
}

export function getIsPeakSurgeActive(): boolean {
  return isPeakSurgeActive;
}

/**
 * Checks and updates the state of a platform's circuit breaker
 */
export function checkCircuitState(platformId: PlatformId): CircuitState {
  const cb = circuitBreakers[platformId];
  if (!cb) return 'CLOSED';

  const now = Date.now();
  if (cb.state === 'OPEN') {
    if (cb.lastFailureTime && now - cb.lastFailureTime > CIRCUIT_RESET_TIMEOUT_MS) {
      cb.state = 'HALF_OPEN';
      return 'HALF_OPEN';
    }
    return 'OPEN';
  }

  return cb.state;
}

/**
 * Records a successful network call on the platform circuit
 */
export function recordCircuitSuccess(platformId: PlatformId): void {
  const cb = circuitBreakers[platformId];
  if (!cb) return;

  cb.totalCalls++;
  cb.successfulCalls++;
  cb.failureCount = 0;
  cb.state = 'CLOSED';
}

/**
 * Records a network or adapter failure and trips circuit if threshold exceeded
 */
export function recordCircuitFailure(platformId: PlatformId): void {
  const cb = circuitBreakers[platformId];
  if (!cb) return;

  cb.totalCalls++;
  cb.failureCount++;
  cb.lastFailureTime = Date.now();

  if (cb.failureCount >= CIRCUIT_FAILURE_THRESHOLD) {
    cb.state = 'OPEN';
  }
}

/**
 * Returns a list of all platform circuit breaker statuses
 */
export function getAllCircuitBreakers(): CircuitBreakerStatus[] {
  return Object.values(circuitBreakers);
}

/**
 * Resets a circuit breaker manually for demo/testing
 */
export function resetCircuitBreaker(platformId: PlatformId): void {
  const cb = circuitBreakers[platformId];
  if (cb) {
    cb.state = 'CLOSED';
    cb.failureCount = 0;
    cb.lastFailureTime = null;
  }
}

/**
 * Trip circuit breaker manually for viva failure-resilience demonstration
 */
export function tripCircuitBreaker(platformId: PlatformId): void {
  const cb = circuitBreakers[platformId];
  if (cb) {
    cb.state = 'OPEN';
    cb.failureCount = CIRCUIT_FAILURE_THRESHOLD;
    cb.lastFailureTime = Date.now();
  }
}

/**
 * Calculates dynamic temporal adjustments (peak-hour surge pricing & delivery time)
 */
export function calculateDynamicAdjustments(): {
  surgePlatformFee: number;
  deliveryMultiplier: number;
} {
  const date = new Date();
  const currentHour = date.getHours();

  // Real-world Indian food delivery peak windows (Lunch 1pm-3pm, Dinner 8pm-10:30pm)
  const isNaturalPeak = (currentHour >= 13 && currentHour <= 15) || (currentHour >= 20 && currentHour <= 22);

  if (isPeakSurgeActive || isNaturalPeak) {
    return {
      surgePlatformFee: 4, // Extra surge platform charge during rush hours
      deliveryMultiplier: 1.25, // 25% delivery delay during peak rush
    };
  }

  return {
    surgePlatformFee: 0,
    deliveryMultiplier: 1.0,
  };
}

/**
 * ==============================================================================
 * MAIN RESILIENT INGESTION PIPELINE EXECUTOR
 * ==============================================================================
 * Ingestion Order:
 * 1. Multi-Tier Cache Check (L1 RAM / L2 LocalStorage) -> Return immediately on hit
 * 2. Circuit Breaker Check -> If OPEN, fast-fallback to synthetic data
 * 3. Network Fetch Attempt -> If success, write to cache & return
 * 4. Exception Handler -> Record failure, trip circuit if repeated, fallback gracefully
 */
export async function executeResilientIngestion<T>(
  platformId: PlatformId,
  pinCode: string,
  query: string,
  liveFetchFn: () => Promise<T>,
  syntheticFallbackFn: () => T
): Promise<{
  data: T;
  meta: IngestionMetadata;
}> {
  const cacheKey = buildPlatformCacheKey(platformId, pinCode, query);

  // 1. Check Multi-Tier Cache (L1 Memory / L2 Storage)
  const cached = cacheGet<T>(cacheKey);
  if (cached.data !== null && cached.source !== null) {
    return {
      data: cached.data,
      meta: {
        source: cached.source === 'L1' ? 'L1_CACHE' : 'L2_CACHE',
        latencyMs: cached.latencyMs,
        fetchedAt: Date.now(),
        circuitState: circuitBreakers[platformId]?.state || 'CLOSED',
      },
    };
  }

  // 2. Check Circuit Breaker
  const circuitState = checkCircuitState(platformId);
  if (circuitState === 'OPEN') {
    // Fast-fallback without executing network call
    const fallbackData = syntheticFallbackFn();
    return {
      data: fallbackData,
      meta: {
        source: 'SYNTHETIC_FALLBACK',
        latencyMs: 1.2,
        fetchedAt: Date.now(),
        circuitState: 'OPEN',
      },
    };
  }

  // 3. Execute Live Ingestion with Latency Timing
  const t0 = performance.now();
  try {
    const liveData = await liveFetchFn();
    const latencyMs = Math.round((performance.now() - t0) * 10) / 10;

    recordCircuitSuccess(platformId);

    // Save to Cache with 15-minute TTL
    cacheSet(cacheKey, liveData, 900, { platform: platformId, query });

    return {
      data: liveData,
      meta: {
        source: 'LIVE_NETWORK',
        latencyMs,
        fetchedAt: Date.now(),
        circuitState: 'CLOSED',
      },
    };
  } catch {
    // 4. Handle Network / Upstream Failure
    recordCircuitFailure(platformId);
    const latencyMs = Math.round((performance.now() - t0) * 10) / 10;

    const fallbackData = syntheticFallbackFn();
    return {
      data: fallbackData,
      meta: {
        source: 'SYNTHETIC_FALLBACK',
        latencyMs,
        fetchedAt: Date.now(),
        circuitState: circuitBreakers[platformId]?.state || 'CLOSED',
      },
    };
  }
}
