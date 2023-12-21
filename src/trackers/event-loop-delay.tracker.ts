import { Tracker, TrackerTick } from "./tracker.interface";
import { IntervalHistogram, monitorEventLoopDelay } from "node:perf_hooks";

export class EventLoopDelayTracker extends Tracker {
  readonly name = "event-loop-delay";

  private static readonly DEFAULT_RESOLUTION = 10;

  private readonly resolution: number;
  private readonly histogram: IntervalHistogram;

  constructor(options: { resolution?: number; maxValue?: number } = {}) {
    super();

    this.value = 0;
    this.setMaxValue(options?.maxValue, 1_000);

    this.resolution = Math.abs(
      options?.resolution ?? EventLoopDelayTracker.DEFAULT_RESOLUTION
    );

    this.histogram = monitorEventLoopDelay({ resolution: this.resolution });
    this.histogram.enable();
  }

  tick(): TrackerTick {
    const { mean } = this.histogram;
    this.value = Number.isNaN(mean)
      ? Infinity
      : Math.max(0, mean / 1e6 - this.resolution);
    this.histogram.reset();

    return {
      value: this.value,
      unit: "milliseconds",
    };
  }
}
