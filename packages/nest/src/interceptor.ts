import { Observable } from "rxjs";

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  ServiceUnavailableException,
  Type,
  mixin,
} from "@nestjs/common";

import { PressureTrackingService } from ".";

class MixinPressureTrackingInterceptor implements NestInterceptor {
  constructor(private readonly pressure: PressureTrackingService) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<void> {
    if (this.pressure.isUnderPressure()) {
      throw new ServiceUnavailableException();
    }

    return next.handle();
  }
}

export function PressureTrackingInterceptor(): Type<NestInterceptor> {
  return mixin(MixinPressureTrackingInterceptor);
}
