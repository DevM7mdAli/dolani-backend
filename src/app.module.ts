import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BeaconsModule } from './beacons/beacons.module';
import { FacultyModule } from './faculty/faculty.module';
import { ItModule } from './it/it.module';
import { LocationsModule } from './locations/locations.module';
import { NavigationModule } from './navigation/navigation.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OccupancyModule } from './occupancy/occupancy.module';
import { PrismaModule } from './prisma/prisma.module';
import { SecutiryModule } from './secutiry/secutiry.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    NavigationModule,
    BeaconsModule,
    FacultyModule,
    AdminModule,
    ItModule,
    SecutiryModule,
    LocationsModule,
    OccupancyModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
