export type TrackerUnit = "milliseconds" | "percentage";

export type TrackerTick = {
  value: number;
  unit: TrackerUnit;
};

export abstract class Tracker {
  readonly name: string = "tracker";

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
