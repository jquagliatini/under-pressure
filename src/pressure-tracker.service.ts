import { Tracker, TrackerTick } from "./trackers/tracker.interface";

export class PressureTrackerService {
  private static DEFAULT_TIMEOUT = 10;

  private readonly timeout: NodeJS.Timeout;
  private readonly values = new Map<string, TrackerTick>();
  private readonly subscriptions = new Set<
    (record: Record<string, TrackerTick>) => void
  >();

  constructor(
    private readonly trackers: readonly Tracker[],
    options: Partial<{ timeout: number }> = {}
  ) {
    this.timeout = setTimeout(
      () => this.tick(),
      options.timeout ?? PressureTrackerService.DEFAULT_TIMEOUT
    );
    this.timeout.unref();
  }

  lastState(): Record<string, TrackerTick> {
    const out: Record<string, TrackerTick> = {};
    for (const [trackerName, tick] of this.values) {
      out[trackerName] = tick;
    }
    return out;
  }

  isUnderPressure(): boolean {
    return this.trackers.some((tracker) => tracker.isUnderPressure());
  }

  subscribe(callback: (state: Record<string, TrackerTick>) => void) {
    this.subscriptions.add(callback);
  }

  stop() {
    clearTimeout(this.timeout);
  }

  private tick() {
    let pressureRecord: Record<string, TrackerTick> = {};
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

  private onPressure(record: Record<string, TrackerTick>) {
    this.subscriptions.forEach((callback) => callback(record));
  }
}
