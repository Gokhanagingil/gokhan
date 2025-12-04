import * as dotenv from 'dotenv';
dotenv.config();

import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { ZodIssue } from 'zod';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ParticipantModule } from './modules/facilitator/participant/participant.module';
import { EventModule } from './modules/facilitator/event/event.module';
import { FeedbackModule } from './modules/facilitator/feedback/feedback.module';
import { ScoreModule } from './modules/facilitator/score/score.module';
import { AuthModule } from './modules/auth/auth.module';
import { SessionModule } from './modules/session/session.module';
import { SeedModule } from './modules/facilitator/seed/seed.module';
import { FacilitatorGateway } from './modules/facilitator/facilitator.gateway';
import { HealthModule } from './health/health.module';
import { envSchema } from './config/environment.validation';

const logger = new Logger('AppModule');

function isSafeMode(): boolean {
  return process.env.SAFE_MODE === 'true';
}

function getModuleImports(): Array<unknown> {
  const safeMode = isSafeMode();

  const baseImports = [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config: Record<string, unknown>) => {
        const result = envSchema.safeParse(config);
        if (!result.success) {
          const zodIssues = result.error.issues;
          const errorMessages = zodIssues
            .map(
              (issue: ZodIssue) => `${issue.path.join('.')}: ${issue.message}`,
            )
            .join(', ');
          throw new Error(`Environment validation failed: ${errorMessages}`);
        }
        return result.data;
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
    HealthModule,
  ];

  if (safeMode) {
    logger.warn('SAFE MODE: Skipping database and feature modules');
    return baseImports;
  }

  const dbHost = process.env.DATABASE_HOST || 'localhost';
  const dbPort = parseInt(process.env.DATABASE_PORT || '5432');
  const dbUsername = process.env.DATABASE_USERNAME || 'postgres';
  const dbName = process.env.DATABASE_NAME || 'arctic_echo';

  logger.log('Database Configuration:');
  logger.log(`  - Host: ${dbHost}`);
  logger.log(`  - Port: ${dbPort}`);
  logger.log(`  - Username: ${dbUsername}`);
  logger.log(`  - Database: ${dbName}`);
  logger.log(`  - Password: [REDACTED]`);
  logger.log(`  - Synchronize: false (migrations required)`);

  return [
    ...baseImports,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: false,
        logging: configService.get<string>('NODE_ENV') === 'development',
        migrations: ['dist/migrations/*.js'],
        migrationsRun: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    SessionModule,
    SeedModule,
    ParticipantModule,
    EventModule,
    FeedbackModule,
    ScoreModule,
  ];
}

function getProviders(): Array<unknown> {
  const safeMode = process.env.SAFE_MODE === 'true';

  if (safeMode) {
    logger.warn('SAFE MODE: Skipping WebSocket gateway');
    return [AppService];
  }

  return [AppService, FacilitatorGateway];
}

@Module({
  imports: getModuleImports() as Parameters<typeof Module>[0]['imports'],
  controllers: [AppController],
  providers: getProviders() as Parameters<typeof Module>[0]['providers'],
})
export class AppModule {}
