import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import * as admin from 'firebase-admin';
import * as path from 'path';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(path.resolve(process.cwd(), 'firebase-service-account.json')),
      });
      this.logger.log('Firebase Admin initialized');
    }
  }

  async registerToken(token: string): Promise<void> {
    await this.prisma.deviceToken.upsert({
      where: { token },
      update: { updatedAt: new Date() },
      create: { token },
    });
    this.logger.log(`Device token registered: ${token.slice(0, 20)}...`);
  }

  async sendToAll(title: string, body: string, data?: Record<string, string>): Promise<void> {
    const tokens = await this.prisma.deviceToken.findMany({ select: { token: true } });

    if (tokens.length === 0) {
      this.logger.warn('No device tokens registered — skipping push');
      return;
    }

    const tokenList = tokens.map((t) => t.token);
    const mergedData = data ?? {};
    const isStopSignal = mergedData['type'] === 'emergency_stop';

    const message: admin.messaging.MulticastMessage = {
      tokens: tokenList,
      // Data-only for stop signal — triggers background handler silently (no tray notification)
      // Regular notification for emergency start so it appears even when app is killed
      ...(isStopSignal ? {} : { notification: { title, body } }),
      data: mergedData,
      android: {
        priority: 'high',
        ...(isStopSignal ? {} : { notification: { sound: 'default', channelId: 'emergency' } }),
      },
      apns: {
        payload: { aps: isStopSignal ? {} : { sound: 'default', badge: 1 } },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    this.logger.log(`Push sent: ${response.successCount} success, ${response.failureCount} failed`);

    // Clean up invalid tokens
    const invalidTokens: string[] = [];
    response.responses.forEach((res, idx) => {
      if (
        !res.success &&
        (res.error?.code === 'messaging/invalid-registration-token' ||
          res.error?.code === 'messaging/registration-token-not-registered')
      ) {
        invalidTokens.push(tokenList[idx]);
      }
    });

    if (invalidTokens.length > 0) {
      await this.prisma.deviceToken.deleteMany({ where: { token: { in: invalidTokens } } });
      this.logger.log(`Removed ${invalidTokens.length} invalid tokens`);
    }
  }
}
