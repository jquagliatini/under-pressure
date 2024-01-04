import { Tracker, TrackerTick, mTrackerName } from "./tracker.interface";
import { IntervalHistogram, monitorEventLoopDelay } from "node:perf_hooks";

export class EventLoopDelayTracker extends Tracker {
  readonly name = mTrackerName("event-loop-delay");

  private static readonly DEFAULT_RESOLUTION = 10;

  private readonly resolution: number;
  private readonly histogram: IntervalHistogram;

  constructor(options: { resolution?: number; maxValue?: number } = {}) {
    super();

    this.value = 0;
    this.setMaxValue({
      min: 1,
      default: 1_000,
      max: 3_600_000,
      value: options?.maxValue,
    });

    this.resolution = Math.abs(
      options?.resolution ?? EventLoopDelayTracker.DEFAULT_RESOLUTION
    );

    this.histogram = monitorEventLoopDelay({ resolution: this.resolution });
    this.histogram.enable();
  }

  tick(): TrackerTick {
    this.value = this.histogramValue;
    this.resetHistogram();

    return {
      value: this.value,
      unit: "milliseconds",
    };
  }

  private get histogramValue(): number {
    const { mean } = this.histogram;
    return Number.isNaN(mean)
      ? Infinity
      : Math.max(0, mean / 1e6 - this.resolution);
  }

  private resetHistogram() {
    if ((this.histogram as any).count > this.resolution * 2) {
      this.histogram.reset();
    }
  }
}
