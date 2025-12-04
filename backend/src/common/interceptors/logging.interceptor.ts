import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

interface RequestWithUser extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

interface LogEntry {
  timestamp: string;
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  userId?: string;
  userEmail?: string;
  ip?: string;
  userAgent?: string;
  contentLength?: string;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<RequestWithUser>();
    const response = ctx.getResponse<Response>();

    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || 'unknown';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;
          const contentLength = response.get('content-length') || '0';

          const logEntry: LogEntry = {
            timestamp: new Date().toISOString(),
            method,
            url,
            statusCode,
            duration,
            ip,
            userAgent,
            contentLength,
          };

          if (request.user) {
            logEntry.userId = request.user.id;
            logEntry.userEmail = request.user.email;
          }

          const logLevel = this.getLogLevel(statusCode);
          const logMessage = JSON.stringify(logEntry);

          if (logLevel === 'error') {
            this.logger.error(logMessage);
          } else if (logLevel === 'warn') {
            this.logger.warn(logMessage);
          } else {
            this.logger.log(logMessage);
          }
        },
        error: (error: Error) => {
          const duration = Date.now() - startTime;

          const logEntry: LogEntry & { error: string } = {
            timestamp: new Date().toISOString(),
            method,
            url,
            statusCode: 500,
            duration,
            ip,
            userAgent,
            error: error.message,
          };

          if (request.user) {
            logEntry.userId = request.user.id;
            logEntry.userEmail = request.user.email;
          }

          this.logger.error(JSON.stringify(logEntry));
        },
      }),
    );
  }

  private getLogLevel(statusCode: number): 'log' | 'warn' | 'error' {
    if (statusCode >= 500) {
      return 'error';
    }
    if (statusCode >= 400) {
      return 'warn';
    }
    return 'log';
  }
}
