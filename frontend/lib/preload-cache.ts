/**
 * Preload Cache for Visualizations
 *
 * Proactively preloads visualizations for knowledge graph nodes
 * to achieve zero load time when selecting nodes.
 */

import { GraphNode, VizType } from './types';
import { selectLesson, pollVizJob, VizJobResponse } from './api';

export interface CachedVisualization {
  nodeId: string;
  vizType: VizType;
  svgContent?: string;
  videoUrl?: string;
  contentType: 'svg' | 'video';
  loadedAt: number;
  status: 'loading' | 'ready' | 'error';
  error?: string;
}

class PreloadCache {
  private cache: Map<string, CachedVisualization> = new Map();
  private preloadQueue: Set<string> = new Set();
  private maxConcurrentPreloads = 3;
  private activePreloads = 0;

  /**
   * Get cached visualization for a node
   */
  get(nodeId: string): CachedVisualization | null {
    return this.cache.get(nodeId) || null;
  }

  /**
   * Check if visualization is ready (loaded and not expired)
   */
  isReady(nodeId: string): boolean {
    const cached = this.cache.get(nodeId);
    if (!cached) return false;

    return cached.status === 'ready';
  }

  /**
   * Preload visualizations for multiple nodes
   * @param nodes - Nodes to preload
   * @param sessionId - Session ID for API calls
   * @param priority - Nodes to prioritize (e.g., adjacent to center)
   */
  async preloadNodes(
    nodes: GraphNode[],
    sessionId: string,
    priority: string[] = []
  ): Promise<void> {
    console.log('[PreloadCache] Starting preload for', nodes.length, 'nodes');

    // Prioritize specified nodes first, then the rest
    const priorityNodes = nodes.filter(n => priority.includes(n.id));
    const regularNodes = nodes.filter(n => !priority.includes(n.id));
    const sortedNodes = [...priorityNodes, ...regularNodes];

    for (const node of sortedNodes) {
      // Skip if already cached or in queue
      if (this.cache.has(node.id) || this.preloadQueue.has(node.id)) {
        continue;
      }

      // Add to queue
      this.preloadQueue.add(node.id);

      // Start preload (respects concurrency limit)
      this.startPreload(node, sessionId);
    }
  }

  /**
   * Start preloading a single node (with concurrency control)
   */
  private async startPreload(node: GraphNode, sessionId: string): Promise<void> {
    // Wait for available slot
    while (this.activePreloads >= this.maxConcurrentPreloads) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.activePreloads++;

    try {
      console.log('[PreloadCache] Preloading:', node.id, node.label);

      // Mark as loading
      this.cache.set(node.id, {
        nodeId: node.id,
        vizType: node.vizType || 'image',
        contentType: 'svg',
        loadedAt: Date.now(),
        status: 'loading',
      });

      // Request visualization
      const vizType = node.vizType || 'image';
      const response = await selectLesson(sessionId, node.id, node.label, vizType);

      // Poll for result (without progress callbacks to reduce noise)
      const vizResult = await pollVizJob(response.vizJobId);

      if (vizResult.status === 'done' && vizResult.viz) {
        // Cache the result
        const cached: CachedVisualization = {
          nodeId: node.id,
          vizType: vizType,
          contentType: vizResult.viz.type === 'video' ? 'video' : 'svg',
          svgContent: vizResult.viz.svgContent,
          videoUrl: vizResult.viz.videoUrl,
          loadedAt: Date.now(),
          status: 'ready',
        };

        this.cache.set(node.id, cached);
        console.log('[PreloadCache] ✓ Cached:', node.id, cached.contentType);
      } else {
        // Cache error state
        this.cache.set(node.id, {
          nodeId: node.id,
          vizType: vizType,
          contentType: 'svg',
          loadedAt: Date.now(),
          status: 'error',
          error: vizResult.message || 'Failed to preload',
        });
        console.warn('[PreloadCache] ✗ Failed:', node.id, vizResult.message);
      }
    } catch (err: any) {
      console.error('[PreloadCache] Error preloading', node.id, err);
      this.cache.set(node.id, {
        nodeId: node.id,
        vizType: node.vizType || 'image',
        contentType: 'svg',
        loadedAt: Date.now(),
        status: 'error',
        error: err.message || 'Unknown error',
      });
    } finally {
      this.activePreloads--;
      this.preloadQueue.delete(node.id);
    }
  }

  /**
   * Clear cached visualization for a node
   */
  clear(nodeId: string): void {
    this.cache.delete(nodeId);
  }

  /**
   * Clear all cached visualizations
   */
  clearAll(): void {
    this.cache.clear();
    this.preloadQueue.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const ready = Array.from(this.cache.values()).filter(c => c.status === 'ready').length;
    const loading = Array.from(this.cache.values()).filter(c => c.status === 'loading').length;
    const errors = Array.from(this.cache.values()).filter(c => c.status === 'error').length;

    return {
      total: this.cache.size,
      ready,
      loading,
      errors,
      queued: this.preloadQueue.size,
      active: this.activePreloads,
    };
  }
}

// Singleton instance
export const preloadCache = new PreloadCache();
