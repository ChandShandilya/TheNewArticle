import { Injectable, NotFoundException } from '@nestjs/common';
import type { Category, FeedResponse, Region, Story } from '@tna/types';
import { isCategory, isRegion } from '@tna/types';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toStory } from './feed.mappers';

const PAGE_SIZE = 20;

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
  constructor(private readonly prisma: PrismaService) {}

  async getFeed(query: FeedQuery): Promise<FeedResponse> {
    const page = Math.max(1, query.page ?? 1);
    const region: Region | undefined =
      query.region && isRegion(query.region) ? query.region : undefined;
    const category: Category | undefined =
      query.category && isCategory(query.category) && query.category !== 'top'
        ? query.category
        : undefined;

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

    return {
      items: rows.map(toStory),
      page,
      pageSize: PAGE_SIZE,
      total,
    };
  }

  /** Cross-category trending: newest stories with the most sources first. */
  async getTop(): Promise<Story[]> {
    const rows = await this.prisma.story.findMany({
      include: withArticles,
      orderBy: { publishedAt: 'desc' },
      take: 40,
    });
    return rows
      .map(toStory)
      .sort(
        (a, b) =>
          b.sourceCount - a.sourceCount ||
          +new Date(b.publishedAt) - +new Date(a.publishedAt),
      )
      .slice(0, 20);
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
