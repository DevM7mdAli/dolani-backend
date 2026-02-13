import { Injectable, OnModuleInit } from '@nestjs/common';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // 1. Create a standard PostgreSQL connection pool
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // 2. Create the Prisma Adapter using that pool
    const adapter = new PrismaPg(pool);

    // 3. Pass the adapter to the parent constructor
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
