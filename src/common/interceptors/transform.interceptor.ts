import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseInterface } from '../interfaces/response.interface';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ResponseInterface<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseInterface<T>> {
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        message: 'Success',
        statusCode: response.statusCode,
      })),
    );
  }
}
