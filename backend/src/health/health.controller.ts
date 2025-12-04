import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

interface HealthCheckResponse {
  status: string;
  timestamp: string;
  checks?: Record<string, unknown>;
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private configService: ConfigService) {}

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe - checks if HTTP server is up' })
  @ApiResponse({ status: 200, description: 'Server is alive' })
  live(): HealthCheckResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Readiness probe - checks configuration',
  })
  @ApiResponse({ status: 200, description: 'All systems ready' })
  @ApiResponse({ status: 503, description: 'One or more systems not ready' })
  ready(): HealthCheckResponse {
    const safeMode = this.configService.get<boolean>('SAFE_MODE');
    const environmentCheck = this.checkEnvironment();

    const response: HealthCheckResponse = {
      status: environmentCheck.status === 'up' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      checks: {
        environment: environmentCheck,
        safeMode: safeMode ?? false,
      },
    };

    return response;
  }

  private checkEnvironment(): {
    status: 'up' | 'down';
    details: Record<string, unknown>;
  } {
    const requiredVars = ['JWT_SECRET', 'DATABASE_HOST', 'DATABASE_NAME'];
    const missingVars: string[] = [];

    for (const varName of requiredVars) {
      if (!this.configService.get(varName)) {
        missingVars.push(varName);
      }
    }

    if (missingVars.length > 0) {
      return {
        status: 'down',
        details: {
          message: 'Missing required environment variables',
          missing: missingVars,
        },
      };
    }

    return {
      status: 'up',
      details: {
        nodeEnv: this.configService.get('NODE_ENV'),
        safeMode: this.configService.get('SAFE_MODE'),
      },
    };
  }
}
