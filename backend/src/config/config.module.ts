import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ZodIssue } from 'zod';
import { envSchema, EnvConfig } from './environment.validation';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validate: (config: Record<string, unknown>): EnvConfig => {
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
  ],
  exports: [NestConfigModule],
})
export class AppConfigModule {}
