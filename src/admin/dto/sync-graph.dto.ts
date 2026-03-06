import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { LocationType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class SyncNodeDto {
  @ApiProperty({ description: 'Client-side UUID for mapping' })
  @IsUUID()
  client_id!: string;

  @ApiProperty({ example: 'Room 101' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'A11-101' })
  @IsString()
  @IsOptional()
  room_number?: string;

  @ApiProperty({ enum: LocationType })
  @IsEnum(LocationType)
  type!: LocationType;

  @ApiProperty({ description: 'Normalized X coordinate (0–1)', example: 0.5 })
  @IsNumber()
  @Min(0)
  @Max(1)
  coordinate_x!: number;

  @ApiProperty({ description: 'Normalized Y coordinate (0–1)', example: 0.5 })
  @IsNumber()
  @Min(0)
  @Max(1)
  coordinate_y!: number;
}

export class SyncEdgeDto {
  @ApiProperty({ description: 'Client-side UUID for mapping' })
  @IsUUID()
  client_id!: string;

  @ApiProperty({ description: 'Client UUID of the source node' })
  @IsUUID()
  source_client_id!: string;

  @ApiProperty({ description: 'Client UUID of the target node' })
  @IsUUID()
  target_client_id!: string;

  @ApiProperty({ description: 'Normalized Euclidean distance', example: 0.12 })
  @IsNumber()
  @IsPositive()
  distance!: number;

  @ApiProperty({ default: true })
  @IsBoolean()
  is_accessible!: boolean;
}

export class SyncBeaconDto {
  @ApiProperty({ description: 'Client-side UUID for mapping' })
  @IsUUID()
  client_id!: string;

  @ApiProperty({ example: 'f7826da6-4fa2-4e98-8024-bc5b71e0893e' })
  @IsString()
  @IsNotEmpty()
  uuid!: string;

  @ApiProperty({ example: 'Beacon Hall-1' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Client UUID of the linked node' })
  @IsUUID()
  @IsOptional()
  linked_node_client_id?: string;

  @ApiProperty({ description: 'Normalized X coordinate (0–1)', example: 0.5 })
  @IsNumber()
  @Min(0)
  @Max(1)
  coordinate_x!: number;

  @ApiProperty({ description: 'Normalized Y coordinate (0–1)', example: 0.5 })
  @IsNumber()
  @Min(0)
  @Max(1)
  coordinate_y!: number;
}

export class SyncGraphDto {
  @ApiProperty({ example: 1, description: 'Floor ID to sync graph for' })
  @IsInt()
  @IsPositive()
  floor_id!: number;

  @ApiProperty({ type: [SyncNodeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncNodeDto)
  nodes!: SyncNodeDto[];

  @ApiProperty({ type: [SyncEdgeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncEdgeDto)
  edges!: SyncEdgeDto[];

  @ApiProperty({ type: [SyncBeaconDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncBeaconDto)
  beacons!: SyncBeaconDto[];
}
