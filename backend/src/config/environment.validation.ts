import { z, ZodIssue } from 'zod';
import { Logger } from '@nestjs/common';

const logger = new Logger('EnvironmentValidation');

export const envSchema = z.object({
  JWT_SECRET: z
    .string({ message: 'JWT_SECRET is required' })
    .min(32, 'JWT_SECRET must be at least 32 characters for security'),

  DATABASE_HOST: z.string().default('localhost'),
  DATABASE_PORT: z.coerce.number().default(5432),
  DATABASE_USERNAME: z.string().default('postgres'),
  DATABASE_PASSWORD: z.string().default('password'),
  DATABASE_NAME: z.string().default('arctic_echo'),

  PORT: z.coerce.number().default(3001),

  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  SAFE_MODE: z
    .string()
    .optional()
    .transform((val) => val === 'true')
    .default(false),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnvironment(): EnvConfig {
  logger.log('Validating environment variables...');

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const zodIssues = result.error.issues;
    const errorMessages = zodIssues
      .map((issue: ZodIssue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    logger.error(`Environment validation failed:\n${errorMessages}`);
    logger.error('Application cannot start with invalid configuration.');
    process.exit(1);
  }

  logger.log('Environment validation successful');

  const config = result.data;

  logger.log(`Configuration loaded:`);
  logger.log(`  - NODE_ENV: ${config.NODE_ENV}`);
  logger.log(`  - PORT: ${config.PORT}`);
  logger.log(`  - DATABASE_HOST: ${config.DATABASE_HOST}`);
  logger.log(`  - DATABASE_PORT: ${config.DATABASE_PORT}`);
  logger.log(`  - DATABASE_NAME: ${config.DATABASE_NAME}`);
  logger.log(`  - DATABASE_USERNAME: ${config.DATABASE_USERNAME}`);
  logger.log(`  - DATABASE_PASSWORD: [REDACTED]`);
  logger.log(`  - CORS_ORIGIN: ${config.CORS_ORIGIN}`);
  logger.log(`  - SAFE_MODE: ${config.SAFE_MODE}`);

  return config;
}

export function getValidatedConfig(): EnvConfig {
  return validateEnvironment();
}
