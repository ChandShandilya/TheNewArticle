import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { FeedModule } from './feed/feed.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [PrismaModule, FeedModule],
  controllers: [HealthController],
})
export class AppModule {}
