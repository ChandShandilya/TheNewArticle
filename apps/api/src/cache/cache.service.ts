import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Thin Redis cache wrapper that **fails open**: if `REDIS_URL` is unset or the
 * server is unreachable, every operation degrades to a no-op so the app keeps
 * serving (just without caching). Hot feeds use short TTLs.
 */
@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private client: Redis | null = null;
  private warned = false;

  constructor() {
    const url = process.env.REDIS_URL;
    if (!url) {
      this.logger.log('REDIS_URL not set — caching disabled.');
      return;
    }
    this.client = new Redis(url, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      // Stop reconnecting after a few attempts so a down Redis never blocks us.
      retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 1000)),
    });
    this.client.on('error', (err) => {
      if (!this.warned) {
        this.logger.warn(`Redis unavailable, caching disabled: ${err.message}`);
        this.warned = true;
      }
    });
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client) return null;
    try {
      const raw = await this.client.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      // Fail open: a cache write failure must never break the request.
    }
  }

  onModuleDestroy(): void {
    this.client?.disconnect();
  }
}
