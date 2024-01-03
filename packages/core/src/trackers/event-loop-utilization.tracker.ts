import { performance } from "node:perf_hooks";
import { Tracker, TrackerTick, mTrackerName } from "./tracker.interface";

export class EventLoopUtilizationTracker extends Tracker {
  readonly name = mTrackerName("event-loop-utilization");

  private readonly elu = performance.eventLoopUtilization();

  constructor(options: { maxValue?: number } = {}) {
    super();

    this.value = 0;
    this.setMaxValue({
      min: 0,
      max: 1,
      default: 0.9,
      value: options?.maxValue,
    });
  }

  tick(): TrackerTick {
    this.value = performance.eventLoopUtilization(this.elu).utilization;

    return {
      value: this.value,
      unit: "percentage",
    };
  }
}
