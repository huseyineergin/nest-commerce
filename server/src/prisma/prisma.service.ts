import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get("DATABASE_URI"),
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log("Connected.");
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log("Disconnected.");
  }
}
