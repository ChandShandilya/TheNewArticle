import { Injectable, NotFoundException } from '@nestjs/common';
import type { Category, FeedResponse, Region, Story } from '@tna/types';
import { isCategory, isRegion } from '@tna/types';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { toStory } from './feed.mappers';

const PAGE_SIZE = 20;
/** Hot feeds change at most once per ingestion run; a short TTL keeps them fresh. */
const FEED_TTL_SECONDS = 60;

const withArticles = {
  articles: {
    include: { source: true },
    orderBy: { publishedAt: 'desc' as const },
  },
};

interface FeedQuery {
  region?: string;
  category?: string;
  page?: number;
}

@Injectable()
export class FeedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async getFeed(query: FeedQuery): Promise<FeedResponse> {
    const page = Math.max(1, query.page ?? 1);
    const region: Region | undefined =
      query.region && isRegion(query.region) ? query.region : undefined;
    const category: Category | undefined =
      query.category && isCategory(query.category) && query.category !== 'top'
        ? query.category
        : undefined;

    const cacheKey = `feed:${region ?? 'all'}:${category ?? 'all'}:${page}`;
    const cached = await this.cache.get<FeedResponse>(cacheKey);
    if (cached) return cached;

    const where: Prisma.StoryWhereInput = {
      ...(region ? { region } : {}),
      ...(category ? { categories: { has: category } } : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.story.findMany({
        where,
        include: withArticles,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      this.prisma.story.count({ where }),
    ]);

    const response: FeedResponse = {
      items: rows.map(toStory),
      page,
      pageSize: PAGE_SIZE,
      total,
    };
    await this.cache.set(cacheKey, response, FEED_TTL_SECONDS);
    return response;
  }

  /** Cross-category trending: newest stories with the most sources first. */
  async getTop(region?: string): Promise<Story[]> {
    const r: Region | undefined = region && isRegion(region) ? region : undefined;

    const cacheKey = `top:${r ?? 'all'}`;
    const cached = await this.cache.get<Story[]>(cacheKey);
    if (cached) return cached;

    const rows = await this.prisma.story.findMany({
      where: r ? { region: r } : {},
      include: withArticles,
      orderBy: { publishedAt: 'desc' },
      take: 40,
    });
    const top = rows
      .map(toStory)
      .sort(
        (a, b) =>
          b.sourceCount - a.sourceCount || +new Date(b.publishedAt) - +new Date(a.publishedAt),
      )
      .slice(0, 20);
    await this.cache.set(cacheKey, top, FEED_TTL_SECONDS);
    return top;
  }

  async getStory(id: string): Promise<Story> {
    const row = await this.prisma.story.findUnique({
      where: { id },
      include: withArticles,
    });
    if (!row) throw new NotFoundException(`Story ${id} not found`);
    return toStory(row);
  }

  async search(q: string): Promise<Story[]> {
    const term = q.trim();
    if (!term) return [];
    const rows = await this.prisma.story.findMany({
      where: {
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          {
            articles: {
              some: { title: { contains: term, mode: 'insensitive' } },
            },
          },
        ],
      },
      include: withArticles,
      orderBy: { publishedAt: 'desc' },
      take: 30,
    });
    return rows.map(toStory);
  }
}
