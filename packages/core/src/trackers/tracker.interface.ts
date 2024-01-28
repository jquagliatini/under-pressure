export type TrackerUnit = "milliseconds" | "percentage";

export type TrackerTick = {
  isUnderPressure: boolean;
  value: number;
  unit: TrackerUnit;
};

export type TrackerName<Name extends string = string> = Name & { __brand: "TrackerName" };
export function mTrackerName<Name extends string>(name: Name): TrackerName<Name> {
  return name as TrackerName<Name>;
}

export abstract class Tracker {
  readonly name = mTrackerName<string>(`tracker`);

  protected value: number = 0;
  private maxValue: number = Infinity;

  abstract tick(): TrackerTick;

  isUnderPressure(): boolean {
    return this.value >= this.maxValue;
  }

  protected setMaxValue(props: { min: number; max: number; default: number; value?: number }) {
    this.maxValue = Number.isFinite(props.value)
      ? Math.min(Math.max(props.value ?? props.default, props.min), props.max)
      : props.default;
  }
}
