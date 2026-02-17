import { PartialType } from '@nestjs/swagger';

import { CreateBeaconDto } from './create-beacon.dto';

export class UpdateBeaconDto extends PartialType(CreateBeaconDto) {}
