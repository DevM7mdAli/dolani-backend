import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { ItController } from './it.controller';
import { ItService } from './it.service';

@Module({
  imports: [PrismaModule],
  controllers: [ItController],
  providers: [ItService],
  exports: [ItService],
})
export class ItModule {}
