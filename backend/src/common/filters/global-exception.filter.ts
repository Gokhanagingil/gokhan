import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

interface ErrorResponse {
  timestamp: string;
  path: string;
  message: string;
  statusCode: number;
  error?: string;
  stack?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    let status: number;
    let message: string;
    let error: string | undefined;
    let stack: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message =
          (responseObj.message as string) ||
          (responseObj.error as string) ||
          'An error occurred';
        error = responseObj.error as string;
      } else {
        message = 'An error occurred';
      }

      if (!isProduction) {
        stack = exception.stack;
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = isProduction
        ? 'Internal server error'
        : exception.message || 'Internal server error';
      error = 'Internal Server Error';

      if (!isProduction) {
        stack = exception.stack;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'Internal Server Error';
    }

    const errorResponse: ErrorResponse = {
      timestamp: new Date().toISOString(),
      path: request.url,
      message: Array.isArray(message) ? message.join(', ') : message,
      statusCode: status,
    };

    if (error && !isProduction) {
      errorResponse.error = error;
    }

    if (stack && !isProduction) {
      errorResponse.stack = stack;
    }

    this.logger.error(
      JSON.stringify({
        timestamp: errorResponse.timestamp,
        path: errorResponse.path,
        statusCode: status,
        message: errorResponse.message,
        method: request.method,
        ip: request.ip,
        userAgent: request.get('user-agent'),
        userId: (request as Request & { user?: { id: string } }).user?.id,
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    );

    response.status(status).json(errorResponse);
  }
}
