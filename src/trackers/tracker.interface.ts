export type TrackerUnit = "milliseconds" | "percentage";

export type TrackerTick = {
  value: number;
  unit: TrackerUnit;
};

export type TrackerName = string & { __brand: "TrackerName" };
export function mTrackerName(name: string): TrackerName {
  return name as TrackerName;
}

export abstract class Tracker {
  readonly name: TrackerName = mTrackerName(`tracker`);

  protected value: number = 0;
  private maxValue: number = Infinity;

  abstract tick(): TrackerTick;

  isUnderPressure(): boolean {
    return this.value >= this.maxValue;
  }

  protected setMaxValue(maxValue: number | undefined, defaultValue: number) {
    this.maxValue = Number.isFinite(maxValue)
      ? maxValue ?? defaultValue
      : defaultValue;
  }
}
