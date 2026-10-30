import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

const SLOW_REQUEST_MS = 1000;

/** Logge méthode, route, statut et durée ; les requêtes lentes passent en warning. */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const { method, originalUrl } = http.getRequest<Request>();
    const start = performance.now();

    const log = (status: number) => {
      const ms = Math.round(performance.now() - start);
      const line = `${method} ${originalUrl} ${status} - ${ms}ms`;
      if (ms >= SLOW_REQUEST_MS) this.logger.warn(`${line} (lente)`);
      else this.logger.log(line);
    };

    return next.handle().pipe(
      tap({
        next: () => log(http.getResponse<Response>().statusCode),
        error: (err: { status?: number }) => log(err?.status ?? 500),
      }),
    );
  }
}
