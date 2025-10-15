import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  statusCode: number;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map(data => {
        const statusCode = response.statusCode;
        const message = this.getSuccessMessage(request.method, statusCode);

        return {
          success: statusCode >= 200 && statusCode < 300,
          message,
          data: data || null,
          timestamp: new Date().toISOString(),
          statusCode,
        };
      }),
    );
  }

  private getSuccessMessage(method: string, statusCode: number): string {
    const messages = {
      GET: 'Data retrieved successfully',
      POST: 'Data created successfully',
      PUT: 'Data updated successfully',
      PATCH: 'Data updated successfully',
      DELETE: 'Data deleted successfully',
    };

    return messages[method] || 'Request processed successfully';
  }
}
