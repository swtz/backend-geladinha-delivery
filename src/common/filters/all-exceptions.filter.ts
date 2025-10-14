import {
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const defaultMessage = 'Internal Server Error';
    const defaultError = 'Internal Server Error';

    const messages: string[] = [defaultMessage];
    const errorName = defaultError;

    return response.status(status).json({
      message: messages,
      error: errorName,
      statusCode: status,
    });
  }
}
