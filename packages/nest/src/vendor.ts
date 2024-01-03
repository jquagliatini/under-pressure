import { PressureTrackerService as CorePressureTrackingService } from "@pressure/core";

type PressureTrackingServiceTracker = ConstructorParameters<
  typeof CorePressureTrackingService
>[0][number];
type PressureTrackingServiceConfig = NonNullable<
  ConstructorParameters<typeof CorePressureTrackingService>[1]
>;

interface PressureTrackingServiceInterface
  extends Pick<CorePressureTrackingService, "subscribe" | "isUnderPressure"> {}

type SubscriptionNext = Parameters<CorePressureTrackingService["subscribe"]>[0];

export {
  CorePressureTrackingService,
  PressureTrackingServiceInterface,
  PressureTrackingServiceConfig,
  PressureTrackingServiceTracker,
  SubscriptionNext,
};
