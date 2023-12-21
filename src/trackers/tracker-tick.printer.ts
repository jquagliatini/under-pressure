import { TrackerTick } from "./tracker.interface";

export function stringifyTrackerTick(tick: TrackerTick): string {
  switch (tick.unit) {
    case "milliseconds":
      return tick.value === Infinity ? `${tick.value}` : `${tick.value}ms`;
    case "percentage":
      return new Intl.NumberFormat(undefined, { style: "percent" }).format(
        tick.value
      );
  }
}
