import {
  Tracker,
  TrackerName,
  TrackerTick,
} from "./trackers/tracker.interface";
import { Subscribable } from "./types";

export class PressureTrackerService
  implements Subscribable<UnderPressureTrackerTicks>
{
  private static DEFAULT_TIMEOUT = 10;

  private readonly timeout: NodeJS.Timeout;
  private readonly values = new Map<TrackerName, TrackerTick>();
  private readonly subscriptions = new Set<
    (record: UnderPressureTrackerTicks) => void
  >();

  constructor(
    private readonly trackers: readonly Tracker[],
    options: PressureTrackerServiceOptions = {}
  ) {
    this.timeout = setTimeout(
      () => this.tick(),
      Math.max(1_000, options.timeout ?? PressureTrackerService.DEFAULT_TIMEOUT),
    );
    this.timeout.unref();
  }

  lastState(): UnderPressureTrackerTicks {
    const out: UnderPressureTrackerTicks = {};
    for (const [trackerName, tick] of this.values) {
      out[trackerName] = tick;
    }
    return out;
  }

  isUnderPressure(): boolean {
    return this.trackers.some((tracker) => tracker.isUnderPressure());
  }

  subscribe(callback: (state: UnderPressureTrackerTicks) => void) {
    this.subscriptions.add(callback);

    return {
      unsubscribe: () => {
        this.subscriptions.delete(callback);
      },
    };
  }

  stop() {
    clearTimeout(this.timeout);
  }

  private tick() {
    let pressureRecord: UnderPressureTrackerTicks = {};
    let shouldNotifySubscribers = false;

    for (const tracker of this.trackers) {
      const tick = tracker.tick();
      this.values.set(tracker.name, tick);

      if (tracker.isUnderPressure()) {
        shouldNotifySubscribers = true;
        pressureRecord[tracker.name] = tick;
      }
    }

    if (shouldNotifySubscribers) {
      this.onPressure(pressureRecord);
    }

    this.timeout.refresh();
  }

  private onPressure(record: UnderPressureTrackerTicks) {
    this.subscriptions.forEach((callback) => {
      callback(record);
    });
  }
}

type UnderPressureTrackerTicks = Record<TrackerName, TrackerTick>;
type PressureTrackerServiceOptions = {
  /** the timeout interval, in milliseconds. Max 1000 ms */
  timeout?: number;
}
