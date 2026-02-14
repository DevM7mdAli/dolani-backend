import { Module } from '@nestjs/common';

import { BeaconsController } from './beacons.controller';
import { BeaconsService } from './beacons.service';

@Module({
  controllers: [BeaconsController],
  providers: [BeaconsService],
  exports: [BeaconsService],
})
export class BeaconsModule {}
