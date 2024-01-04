import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  ServiceUnavailableException,
  mixin,
} from "@nestjs/common";

import { Observable } from "rxjs";
import { PressureTrackingService } from ".";

@Injectable()
class MixinPressureTrackingInterceptor implements NestInterceptor {
  constructor(private readonly pressure: PressureTrackingService) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<void> {
    if (this.pressure.isUnderPressure()) {
      throw new ServiceUnavailableException();
    }

    return next.handle();
  }
}

export function PressureTrackingInterceptor() {
  return mixin(MixinPressureTrackingInterceptor);
}
