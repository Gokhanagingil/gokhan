import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { validateEnvironment } from './config/environment.validation';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  logger.log('='.repeat(60));
  logger.log('ARCTIC ECHO - FACILITATOR API');
  logger.log('Starting application...');
  logger.log('='.repeat(60));

  logger.log('[1/5] Init Config - Validating environment variables...');
  const envConfig = validateEnvironment();

  if (envConfig.SAFE_MODE) {
    logger.warn('='.repeat(60));
    logger.warn('SAFE MODE ENABLED - DB and WS disabled');
    logger.warn('Only health endpoints will be available');
    logger.warn('='.repeat(60));
  }

  logger.log('[2/5] Init Modules - Creating NestJS application...');
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  logger.log('[3/5] Init Middleware - Configuring security and middleware...');

  app.use(helmet());
  logger.log('  - Helmet security headers enabled');

  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });
  logger.log(`  - CORS enabled for origin: ${corsOrigin}`);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  logger.log('  - Global ValidationPipe configured');

  app.useGlobalFilters(new GlobalExceptionFilter(configService));
  logger.log('  - Global Exception Filter registered');

  app.useGlobalInterceptors(new LoggingInterceptor());
  logger.log('  - Global Logging Interceptor registered');

  app.setGlobalPrefix('api');
  logger.log('  - Global API prefix set to /api');

  logger.log('[4/5] Init Documentation - Setting up Swagger...');
  const nodeEnv = configService.get<string>('NODE_ENV');

  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Arctic Echo Facilitator API')
      .setDescription('API for Arctic Echo Facilitator Dashboard')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('health', 'Health check endpoints')
      .addTag('auth', 'Authentication endpoints')
      .addTag('session', 'Session management endpoints')
      .addTag('participants', 'Participant management endpoints')
      .addTag('events', 'Event management endpoints')
      .addTag('feedback', 'Feedback management endpoints')
      .addTag('scores', 'Score management endpoints')
      .addTag('seed', 'Database seeding endpoints')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
    logger.log('  - Swagger documentation available at /docs');
  } else {
    logger.log('  - Swagger disabled in production');
  }

  logger.log('[5/5] Init HTTP Server - Starting server...');
  const port = configService.get<number>('PORT') ?? 3001;

  await app.listen(port);

  logger.log('='.repeat(60));
  logger.log(`Application started successfully!`);
  logger.log(`  - Environment: ${nodeEnv}`);
  logger.log(`  - Port: ${port}`);
  logger.log(`  - CORS Origin: ${corsOrigin}`);
  logger.log(`  - Safe Mode: ${envConfig.SAFE_MODE}`);
  logger.log(`  - Health Live: http://localhost:${port}/api/health/live`);
  logger.log(`  - Health Ready: http://localhost:${port}/api/health/ready`);
  if (nodeEnv !== 'production') {
    logger.log(`  - Swagger Docs: http://localhost:${port}/docs`);
  }
  logger.log('='.repeat(60));
}

bootstrap().catch((error: Error) => {
  logger.error('='.repeat(60));
  logger.error('FATAL: Application failed to start');
  logger.error(`Error: ${error.message}`);
  logger.error(error.stack);
  logger.error('='.repeat(60));
  process.exit(1);
});
