import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { FeedModule } from './feed/feed.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [PrismaModule, CacheModule, FeedModule],
  controllers: [HealthController],
})
export class AppModule {}
