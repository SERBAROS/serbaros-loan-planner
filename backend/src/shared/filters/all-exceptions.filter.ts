import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const message =
        typeof body === 'string'
          ? body
          : Array.isArray((body as { message?: unknown }).message)
            ? (body as { message: string[] }).message.join(' ')
            : ((body as { message?: string }).message ?? exception.message);
      response.status(status).json({ error: message });
      return;
    }

    // eslint-disable-next-line no-console
    console.error(exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Error interno del servidor.' });
  }
}
