import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost) {
    // get the http adapter
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    // get the status and message from the exception
    const status = exception?.status || HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception?.message || 'Internal server error';
    const error = exception?.error || 'Internal server error';

    // get the stack trace from the exception
    const stack = exception?.stack || 'No stack trace available';

    // reply to the client
    httpAdapter.reply(response, {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      error,
      stack,
    });
  }
}
