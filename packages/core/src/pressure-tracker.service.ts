import {
  Tracker,
  TrackerName,
  TrackerTick,
} from "./trackers/tracker.interface";
import { Subscribable } from "./types";

export class PressureTrackerService<T extends Tracker = Tracker>
  implements Subscribable<PressureTrackerServiceState<T>>
{
  private static DEFAULT_TIMEOUT = 10;

  private readonly timeout: NodeJS.Timeout;
  private readonly values = new Map<T["name"], TrackerTick>();
  private readonly subscriptions = new Set<
    (record: PressureTrackerServiceState<T>) => void
  >();

  constructor(
    private readonly trackers: readonly T[],
    options: PressureTrackerServiceOptions = {}
  ) {
    this.timeout = setTimeout(
      () => this.tick(),
      Math.min(1_000, options.timeout ?? PressureTrackerService.DEFAULT_TIMEOUT)
    );
    this.timeout.unref();
  }

  lastState(): PressureTrackerServiceState<T> {
    let isUnderPressure = false;
    const trackers: Record<TrackerName, TrackerTick> = {};
    for (const [trackerName, tick] of this.values) {
      trackers[trackerName] = tick;

      isUnderPressure ||= tick.isUnderPressure;
    }

    return { isUnderPressure, trackers };
  }

  isUnderPressure(): boolean {
    return this.trackers.some((tracker) => tracker.isUnderPressure());
  }

  subscribe(callback: (state: PressureTrackerServiceState<T>) => void) {
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
    for (const tracker of this.trackers) {
      this.values.set(tracker.name, tracker.tick());
    }

    this.notify();
    this.timeout.refresh();
  }

  private notify() {
    const message = this.lastState();
    this.subscriptions.forEach((callback) => {
      callback(message);
    });
  }
}

type PressureTrackerServiceState<T extends Tracker> = {
  isUnderPressure: boolean;
  trackers: {
    [K in T as K["name"] extends TrackerName<infer N>
      ? N
      : string]?: TrackerTick;
  };
};

type UnderPressureTrackerTicks = {
  isUnderPressure: boolean;
  trackers: Record<TrackerName, TrackerTick>;
};

type PressureTrackerServiceOptions = {
  /** the timeout interval, in milliseconds. Max 1000 ms */
  timeout?: number;
};
