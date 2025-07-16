import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ParticipantModule } from './modules/facilitator/participant/participant.module';
import { EventModule } from './modules/facilitator/event/event.module';
import { FeedbackModule } from './modules/facilitator/feedback/feedback.module';
import { ScoreModule } from './modules/facilitator/score/score.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
    ParticipantModule,
    EventModule,
    FeedbackModule,
    ScoreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
