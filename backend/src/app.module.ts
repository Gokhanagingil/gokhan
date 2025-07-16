import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USERNAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'password',
      database: process.env.DATABASE_NAME || 'arctic_echo',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    SessionModule,
    SeedModule,
    ParticipantModule,
    EventModule,
    FeedbackModule,
    ScoreModule,
  ],
  controllers: [AppController],
  providers: [AppService, FacilitatorGateway],
})
export class AppModule {}
