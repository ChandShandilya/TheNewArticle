import { Controller, Get, Param, Query } from '@nestjs/common';
import type { FeedResponse, Story } from '@tna/types';
import { FeedService } from './feed.service';

@Controller()
export class FeedController {
  constructor(private readonly feed: FeedService) {}

  @Get('feed')
  getFeed(
    @Query('region') region?: string,
    @Query('category') category?: string,
    @Query('page') page?: string,
  ): Promise<FeedResponse> {
    return this.feed.getFeed({
      region,
      category,
      page: page ? Number(page) : 1,
    });
  }

  @Get('feed/top')
  getTop(@Query('region') region?: string): Promise<Story[]> {
    return this.feed.getTop(region);
  }

  @Get('story/:id')
  getStory(@Param('id') id: string): Promise<Story> {
    return this.feed.getStory(id);
  }

  @Get('search')
  search(@Query('q') q = ''): Promise<Story[]> {
    return this.feed.search(q);
  }
}
