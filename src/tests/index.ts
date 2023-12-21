import * as cp from "node:child_process";
import { PressureTrackerService } from "../pressure-tracker.service";
import { EventLoopUtilizationTracker } from "../trackers/event-loop-utilization.tracker";
import { EventLoopDelayTracker } from "../trackers/event-loop-delay.tracker";
import { stringifyTrackerTick } from "../trackers/tracker-tick.printer";
import { mapValues } from "./utils";

main().catch(console.error);
async function main() {
  const tracker = new PressureTrackerService([
    new EventLoopUtilizationTracker({ maxValue: 0.1 }),
    new EventLoopDelayTracker({ maxValue: 100, resolution: 20 }),
  ]);

  tracker.subscribe((record) => {
    console.log({
      record: mapValues(record, stringifyTrackerTick),
    });
  });

  const p = cp.spawn(`sleep`, ["4"]);
  p.on("close", () => {
    console.log(tracker.lastState());
    tracker.stop();
    process.exit(0);
  });
}
