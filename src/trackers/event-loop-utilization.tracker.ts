import { performance } from "node:perf_hooks";
import { Tracker, TrackerTick } from "./tracker.interface";

export class EventLoopUtilizationTracker extends Tracker {
  readonly name = "event-loop-utilization";

  private readonly elu = performance.eventLoopUtilization();

  constructor(options: { maxValue?: number } = {}) {
    super();

    this.value = 0;
    this.setMaxValue(options?.maxValue, 0.9);
  }

  tick(): TrackerTick {
    this.value = performance.eventLoopUtilization(this.elu).utilization;

    return {
      value: this.value,
      unit: "percentage",
    };
  }
}
