/**
 * Cache Service
 * Phase 3: Comprehensive caching layer with TTL validation and cache warming
 * 
 * Features:
 * - TTL-based cache expiration
 * - Cache invalidation strategies (time-based, event-based, manual)
 * - Cache statistics and debugging
 * - Batch cache operations
 * - Cache versioning support
 */

/**
 * Cache entry structure
 */
class CacheEntry {
  constructor(data, ttl = 300000, key = null) {
    this.data = data;
    this.ttl = ttl; // milliseconds
    this.timestamp = Date.now();
    this.key = key;
    this.accessCount = 0;
    this.lastAccessTime = Date.now();
  }

  /**
   * Check if this cache entry is still valid
   */
  isValid() {
    const age = Date.now() - this.timestamp;
    return age < this.ttl;
  }

  /**
   * Get remaining time before expiration (in milliseconds)
   */
  getTimeToLive() {
    const age = Date.now() - this.timestamp;
    return Math.max(0, this.ttl - age);
  }

  /**
   * Update access metadata
   */
  recordAccess() {
    this.accessCount++;
    this.lastAccessTime = Date.now();
  }
}

/**
 * Cache Manager - Handles all caching operations
 */
class CacheManager {
  constructor() {
    this.store = new Map();
    this.namespaces = new Map();
    this.invalidationListeners = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      invalidations: 0,
      writes: 0,
    };

    // Default TTL values (in milliseconds)
    this.defaultTTLs = {
      profile: 5 * 60 * 1000,      // 5 minutes
      stats: 3 * 60 * 1000,        // 3 minutes
      lessons: 5 * 60 * 1000,      // 5 minutes
      streak: 3 * 60 * 1000,       // 3 minutes
      progress: 3 * 60 * 1000,     // 3 minutes
      default: 10 * 60 * 1000,     // 10 minutes default
    };
  }

  /**
   * Get value from cache with TTL validation
   */
  get(key, namespace = 'default') {
    const cacheKey = this._buildKey(key, namespace);
    const entry = this.store.get(cacheKey);

    if (!entry) {
      this.stats.misses++;
      console.debug(`[Cache] MISS: ${cacheKey}`);
      return null;
    }

    if (!entry.isValid()) {
      this.store.delete(cacheKey);
      this.stats.invalidations++;
      console.debug(`[Cache] EXPIRED: ${cacheKey} (TTL: ${entry.ttl}ms ago)`);
      return null;
    }

    entry.recordAccess();
    this.stats.hits++;
    console.debug(`[Cache] HIT: ${cacheKey} (TTL: ${entry.getTimeToLive()}ms remaining)`);
    return entry.data;
  }

  /**
   * Set value in cache with TTL
   */
  set(key, value, namespace = 'default', ttl = null) {
    const cacheKey = this._buildKey(key, namespace);
    
    // Use specific TTL if provided, otherwise use default for namespace
    const finalTTL = ttl || this.defaultTTLs[namespace] || this.defaultTTLs.default;
    
    const entry = new CacheEntry(value, finalTTL, cacheKey);
    this.store.set(cacheKey, entry);
    this.stats.writes++;
    
    console.debug(`[Cache] SET: ${cacheKey} (TTL: ${finalTTL}ms)`);
    return this;
  }

  /**
   * Check if key exists and is valid
   */
  has(key, namespace = 'default') {
    const cacheKey = this._buildKey(key, namespace);
    const entry = this.store.get(cacheKey);
    
    if (!entry) return false;
    
    if (!entry.isValid()) {
      this.store.delete(cacheKey);
      return false;
    }
    
    return true;
  }

  /**
   * Delete specific cache entry
   */
  delete(key, namespace = 'default') {
    const cacheKey = this._buildKey(key, namespace);
    const deleted = this.store.delete(cacheKey);
    
    if (deleted) {
      this.stats.invalidations++;
      console.debug(`[Cache] DELETE: ${cacheKey}`);
      this._notifyInvalidation(cacheKey);
    }
    
    return deleted;
  }

  /**
   * Clear all cache in namespace or globally
   */
  clear(namespace = null) {
    if (namespace) {
      for (const [key, _] of this.store.entries()) {
        if (key.startsWith(`${namespace}:`)) {
          this.store.delete(key);
          this._notifyInvalidation(key);
        }
      }
      console.debug(`[Cache] CLEARED namespace: ${namespace}`);
    } else {
      this.store.clear();
      console.debug(`[Cache] CLEARED all cache`);
    }
  }

  /**
   * Get all cache entries for a namespace
   */
  getNamespaceEntries(namespace = 'default') {
    const entries = [];
    for (const [key, entry] of this.store.entries()) {
      if (key.startsWith(`${namespace}:`)) {
        entries.push({
          key: key.substring(namespace.length + 1),
          isValid: entry.isValid(),
          ttl: entry.ttl,
          timeToLive: entry.getTimeToLive(),
          accessCount: entry.accessCount,
        });
      }
    }
    return entries;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      totalEntries: this.store.size,
      avgEntrySize: this._estimateCacheSize(),
    };
  }

  /**
   * Register callback for cache invalidation
   */
  onInvalidate(key, callback, namespace = 'default') {
    const cacheKey = this._buildKey(key, namespace);
    if (!this.invalidationListeners.has(cacheKey)) {
      this.invalidationListeners.set(cacheKey, []);
    }
    this.invalidationListeners.get(cacheKey).push(callback);
  }

  /**
   * Manually invalidate cache (useful after mutations)
   */
  invalidate(key, namespace = 'default') {
    this.delete(key, namespace);
  }

  /**
   * Invalidate multiple keys matching pattern
   */
  invalidatePattern(pattern, namespace = 'default') {
    const regex = new RegExp(pattern);
    let count = 0;

    for (const key of this.store.keys()) {
      if (key.startsWith(`${namespace}:`) && regex.test(key)) {
        this.store.delete(key);
        this._notifyInvalidation(key);
        count++;
      }
    }

    console.debug(`[Cache] INVALIDATED ${count} entries matching pattern: ${pattern}`);
    return count;
  }

  /**
   * Set default TTL for namespace
   */
  setNamespaceTTL(namespace, ttl) {
    this.defaultTTLs[namespace] = ttl;
    console.debug(`[Cache] Set TTL for namespace '${namespace}': ${ttl}ms`);
  }

  /**
   * Get cache entry metadata (without data)
   */
  getMetadata(key, namespace = 'default') {
    const cacheKey = this._buildKey(key, namespace);
    const entry = this.store.get(cacheKey);

    if (!entry) return null;

    return {
      key: cacheKey,
      ttl: entry.ttl,
      age: Date.now() - entry.timestamp,
      timeToLive: entry.getTimeToLive(),
      isValid: entry.isValid(),
      accessCount: entry.accessCount,
      lastAccessTime: entry.lastAccessTime,
    };
  }

  /**
   * Prune expired entries
   */
  prune() {
    let pruned = 0;

    for (const [key, entry] of this.store.entries()) {
      if (!entry.isValid()) {
        this.store.delete(key);
        this._notifyInvalidation(key);
        pruned++;
      }
    }

    console.debug(`[Cache] PRUNED ${pruned} expired entries`);
    return pruned;
  }

  /**
   * Get cache size statistics
   */
  getSizeStats() {
    let totalSize = 0;
    let entryCount = 0;

    for (const entry of this.store.values()) {
      totalSize += JSON.stringify(entry.data).length;
      entryCount++;
    }

    return {
      entryCount,
      estimatedSizeBytes: totalSize,
      estimatedSizeKB: (totalSize / 1024).toFixed(2),
      averageEntrySize: entryCount > 0 ? (totalSize / entryCount).toFixed(2) : 0,
    };
  }

  /**
   * Export cache for debugging
   */
  export() {
    const exported = {};
    
    for (const [key, entry] of this.store.entries()) {
      exported[key] = {
        data: entry.data,
        ttl: entry.ttl,
        age: Date.now() - entry.timestamp,
        isValid: entry.isValid(),
        timeToLive: entry.getTimeToLive(),
        accessCount: entry.accessCount,
      };
    }

    return exported;
  }

  /**
   * Import cache (for testing/restoration)
   */
  import(data) {
    this.store.clear();

    for (const [key, value] of Object.entries(data)) {
      const entry = new CacheEntry(value.data, value.ttl, key);
      entry.timestamp = Date.now() - (value.age || 0);
      entry.accessCount = value.accessCount || 0;
      this.store.set(key, entry);
    }

    console.debug(`[Cache] IMPORTED ${Object.keys(data).length} entries`);
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Build cache key from namespace and key
   */
  _buildKey(key, namespace) {
    return `${namespace}:${key}`;
  }

  /**
   * Notify listeners of cache invalidation
   */
  _notifyInvalidation(cacheKey) {
    const listeners = this.invalidationListeners.get(cacheKey);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error(`[Cache] Error in invalidation listener for ${cacheKey}:`, error);
        }
      });
    }
  }

  /**
   * Estimate total cache size
   */
  _estimateCacheSize() {
    let totalSize = 0;
    for (const entry of this.store.values()) {
      totalSize += JSON.stringify(entry.data).length;
    }
    return totalSize;
  }
}

/**
 * Singleton cache instance
 */
const cacheManager = new CacheManager();

/**
 * Convenience functions
 */
export const cacheService = {
  /**
   * Get cached value or fetch and cache
   */
  async getOrFetch(key, fetcher, namespace = 'default', ttl = null) {
    // Try to get from cache
    const cached = cacheManager.get(key, namespace);
    if (cached !== null) {
      return { data: cached, source: 'cache' };
    }

    // Fetch and cache
    try {
      const data = await fetcher();
      cacheManager.set(key, data, namespace, ttl);
      return { data, source: 'api' };
    } catch (error) {
      console.error(`[Cache] Error fetching ${key}:`, error);
      throw error;
    }
  },

  // Delegate methods
  get: (key, namespace) => cacheManager.get(key, namespace),
  set: (key, value, namespace, ttl) => cacheManager.set(key, value, namespace, ttl),
  has: (key, namespace) => cacheManager.has(key, namespace),
  delete: (key, namespace) => cacheManager.delete(key, namespace),
  clear: (namespace) => cacheManager.clear(namespace),
  getNamespaceEntries: (namespace) => cacheManager.getNamespaceEntries(namespace),
  getStats: () => cacheManager.getStats(),
  onInvalidate: (key, callback, namespace) => cacheManager.onInvalidate(key, callback, namespace),
  invalidate: (key, namespace) => cacheManager.invalidate(key, namespace),
  invalidatePattern: (pattern, namespace) => cacheManager.invalidatePattern(pattern, namespace),
  setNamespaceTTL: (namespace, ttl) => cacheManager.setNamespaceTTL(namespace, ttl),
  getMetadata: (key, namespace) => cacheManager.getMetadata(key, namespace),
  prune: () => cacheManager.prune(),
  getSizeStats: () => cacheManager.getSizeStats(),
  export: () => cacheManager.export(),
  import: (data) => cacheManager.import(data),
};

export default cacheService;
