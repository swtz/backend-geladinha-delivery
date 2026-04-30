import {
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const isHttpException = exception instanceof HttpException;
    const defaultMessage = 'Internal Server Error';
    const defaultError = 'Internal Server Error';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let messages: string[] = [defaultMessage];
    let errorName = defaultError;

    if (isHttpException) {
      status = exception.getStatus();
      const responseData = exception.getResponse();

      if (typeof responseData === 'string') {
        messages = [responseData];
      }

      if (typeof responseData === 'object' && responseData !== null) {
        const { message, error } = responseData as Record<string, any>;

        if (Array.isArray(message)) {
          messages = message as string[];
        } else if (typeof message === 'string') {
          messages = [message];
        }

        if (typeof error === 'string') {
          errorName = error;
        }
      }

      this.logger.warn(`${status} - ${errorName}: ${messages.join(' | ')}`);
    } else if (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception
    ) {
      const dbError = exception as Record<string, any>;

      switch (dbError.code) {
        case '23505':
          status = HttpStatus.CONFLICT;
          messages = ['Resource already exists'];
          errorName = 'Conflict';
          break;

        case '23503':
          status = HttpStatus.BAD_REQUEST;
          messages = ['Invalid reference'];
          errorName = 'Bad Request';
          break;

        default:
          this.logger.error('Database error', dbError?.stack || 'sem stack');
      }
    } else {
      this.logger.error(
        'Unexpected internal error',
        exception instanceof Error ? exception.stack : 'sem stack',
      );
    }

    return response.status(status).json({
      message: messages,
      error: errorName,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
