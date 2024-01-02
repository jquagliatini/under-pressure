import * as util from "node:util";
import { scrypt as scryptAsync } from "node:crypto";
import {
  PressureTrackerService,
  EventLoopDelayTracker,
  EventLoopUtilizationTracker,
} from "@pressure/core";

import { mapValues } from "./utils";

const scrypt = util.promisify(scryptAsync);

main().catch(console.error);
async function main() {
  const tracker = new PressureTrackerService(
    [
      new EventLoopUtilizationTracker({ maxValue: 0.1 }),
      new EventLoopDelayTracker({ maxValue: 1_000, resolution: 20 }),
    ],
    { timeout: 100 }
  );

  const subscription = tracker.subscribe((record) => {
    console.log({ record });
  });

  for (let i = 0; i < 100; i++) {
    await scrypt("password", "salt", 64);
  }

  console.log(tracker.lastState());
  subscription.unsubscribe();
  tracker.stop();
  process.exit(0);
}
