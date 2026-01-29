/**
 * Cache Warming Service
 * Phase 3: Preload critical data on app startup
 * 
 * Features:
 * - Parallel cache warming
 * - Priority-based loading
 * - Graceful fallback on errors
 * - Progress tracking
 * - Configurable warming strategy
 */

import apiService from './apiService';
import cacheService from './cacheService';
import { auth } from './firebase';

/**
 * Priority levels for cache warming
 */
export const WARMING_PRIORITY = {
  CRITICAL: 1,    // User data, authentication
  HIGH: 2,        // Lessons, progress
  MEDIUM: 3,      // Streaks, profile details
  LOW: 4,         // Additional metadata
};

/**
 * Cache warming tasks definition
 */
const WARMING_TASKS = {
  // Critical - Always load
  getUserProgress: {
    priority: WARMING_PRIORITY.CRITICAL,
    fetcher: async () => {
      const result = await apiService.getProgress();
      if (result.success) {
        cacheService.set('progress', result.data, 'progress');
        return result.data;
      }
      throw new Error(result.error);
    },
    timeout: 5000,
  },

  // High priority - Core lesson data
  getLessons: {
    priority: WARMING_PRIORITY.HIGH,
    fetcher: async () => {
      const result = await apiService.getAllLessons();
      if (result.success) {
        cacheService.set('all_lessons', result.data, 'lessons');
        return result.data;
      }
      throw new Error(result.error);
    },
    timeout: 8000,
  },

  // Medium priority - Streak information
  getUserStreak: {
    priority: WARMING_PRIORITY.MEDIUM,
    fetcher: async () => {
      const result = await apiService.getStreak();
      if (result.success) {
        cacheService.set('streak', result.data, 'streak');
        return result.data;
      }
      throw new Error(result.error);
    },
    timeout: 5000,
  },
};

/**
 * Cache Warmer - Handles preloading strategy
 */
class CacheWarmer {
  constructor() {
    this.isWarming = false;
    this.warmedTasks = new Set();
    this.failedTasks = new Set();
    this.progressCallbacks = [];
    this.completionCallbacks = [];
  }

  /**
   * Start cache warming process
   */
  async warmCache(priorityThreshold = WARMING_PRIORITY.HIGH) {
    if (this.isWarming) {
      console.warn('[CacheWarmer] Warming already in progress');
      return false;
    }

    // Check authentication
    if (!auth.currentUser) {
      console.debug('[CacheWarmer] User not authenticated, skipping cache warming');
      return false;
    }

    this.isWarming = true;
    this.warmedTasks.clear();
    this.failedTasks.clear();

    console.debug('[CacheWarmer] Starting cache warming...');

    try {
      // Filter tasks by priority
      const tasksToRun = Object.entries(WARMING_TASKS)
        .filter(([_, task]) => task.priority <= priorityThreshold)
        .sort((a, b) => a[1].priority - b[1].priority);

      // Group by priority
      const priorityGroups = new Map();
      for (const [name, task] of tasksToRun) {
        if (!priorityGroups.has(task.priority)) {
          priorityGroups.set(task.priority, []);
        }
        priorityGroups.get(task.priority).push([name, task]);
      }

      // Execute by priority (critical first, then high, etc.)
      const sortedPriorities = Array.from(priorityGroups.keys()).sort();
      let totalTasks = 0;

      for (const priority of sortedPriorities) {
        const priorityTasks = priorityGroups.get(priority);
        totalTasks += priorityTasks.length;

        // Execute tasks at same priority in parallel
        const results = await Promise.allSettled(
          priorityTasks.map(([name, task]) =>
            this._executeTask(name, task)
          )
        );

        // Track results
        results.forEach((result, index) => {
          const taskName = priorityTasks[index][0];
          if (result.status === 'fulfilled') {
            this.warmedTasks.add(taskName);
          } else {
            this.failedTasks.add(taskName);
          }
        });

        // Notify progress
        this._notifyProgress({
          completed: this.warmedTasks.size,
          failed: this.failedTasks.size,
          total: totalTasks,
          currentPriority: priority,
        });
      }

      this.isWarming = false;

      const stats = {
        success: this.failedTasks.size === 0,
        warmed: this.warmedTasks.size,
        failed: this.failedTasks.size,
        total: totalTasks,
        failedTasks: Array.from(this.failedTasks),
        duration: Date.now(),
      };

      console.debug('[CacheWarmer] Cache warming completed:', stats);

      // Notify completion
      this._notifyCompletion(stats);

      return stats;
    } catch (error) {
      this.isWarming = false;
      console.error('[CacheWarmer] Cache warming failed:', error);
      throw error;
    }
  }

  /**
   * Execute single warming task with timeout
   */
  async _executeTask(name, task) {
    return Promise.race([
      (async () => {
        try {
          console.debug(`[CacheWarmer] Running: ${name}`);
          const result = await task.fetcher();
          console.debug(`[CacheWarmer] Completed: ${name}`);
          return result;
        } catch (error) {
          console.warn(`[CacheWarmer] Failed: ${name} -`, error.message);
          throw error;
        }
      })(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`Task ${name} timed out after ${task.timeout}ms`)),
          task.timeout
        )
      ),
    ]);
  }

  /**
   * Register progress callback
   */
  onProgress(callback) {
    this.progressCallbacks.push(callback);
  }

  /**
   * Register completion callback
   */
  onCompletion(callback) {
    this.completionCallbacks.push(callback);
  }

  /**
   * Notify progress listeners
   */
  _notifyProgress(progress) {
    this.progressCallbacks.forEach(callback => {
      try {
        callback(progress);
      } catch (error) {
        console.error('[CacheWarmer] Error in progress callback:', error);
      }
    });
  }

  /**
   * Notify completion listeners
   */
  _notifyCompletion(stats) {
    this.completionCallbacks.forEach(callback => {
      try {
        callback(stats);
      } catch (error) {
        console.error('[CacheWarmer] Error in completion callback:', error);
      }
    });
  }

  /**
   * Get warming status
   */
  getStatus() {
    return {
      isWarming: this.isWarming,
      warmed: Array.from(this.warmedTasks),
      failed: Array.from(this.failedTasks),
    };
  }

  /**
   * Reset warming state
   */
  reset() {
    this.isWarming = false;
    this.warmedTasks.clear();
    this.failedTasks.clear();
  }

  /**
   * Register custom warming task
   */
  registerTask(name, fetcher, priority = WARMING_PRIORITY.LOW, timeout = 10000) {
    WARMING_TASKS[name] = { priority, fetcher, timeout };
    console.debug(`[CacheWarmer] Registered task: ${name} (priority: ${priority})`);
  }
}

/**
 * Singleton warmer instance
 */
const cacheWarmer = new CacheWarmer();

/**
 * Convenience function for warming on app startup
 */
export const warmCacheOnStartup = async (options = {}) => {
  const {
    priorityThreshold = WARMING_PRIORITY.HIGH,
    showProgress = false,
    onProgress = null,
    onCompletion = null,
  } = options;

  if (onProgress) {
    cacheWarmer.onProgress(onProgress);
  }

  if (onCompletion) {
    cacheWarmer.onCompletion(onCompletion);
  }

  if (showProgress) {
    console.log('[CacheWarmer] Warming cache on startup...');
  }

  try {
    const result = await cacheWarmer.warmCache(priorityThreshold);
    return result;
  } catch (error) {
    console.error('[CacheWarmer] Startup cache warming failed:', error);
    // Don't throw - let app continue without warmup
    return null;
  }
};

export default cacheWarmer;
