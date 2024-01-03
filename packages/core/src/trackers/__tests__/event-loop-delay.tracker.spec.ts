import { EventLoopDelayTracker } from "../event-loop-delay.tracker";
import { mock } from "jest-mock-extended";
import { IntervalHistogram, monitorEventLoopDelay } from "node:perf_hooks";

jest.mock("node:perf_hooks");

describe("EventLoopDelayTracker", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should not be under pressure when interval histogram mean is less than the maxValue", () => {
    jest
      .mocked(monitorEventLoopDelay)
      .mockReturnValue(mock<IntervalHistogram>({ mean: 10 * 1e6 + 10 }));

    const tracker = new EventLoopDelayTracker({ maxValue: 30 });
    tracker.tick();

    expect(tracker.isUnderPressure()).toBe(false);
  });

  it("should be under pressure when interval histogram mean is greater than the maxValue", () => {
    jest
      .mocked(monitorEventLoopDelay)
      .mockReturnValue(mock<IntervalHistogram>({ mean: 20 * 1e6 + 10 }));

    const tracker = new EventLoopDelayTracker({ maxValue: 10 });
    tracker.tick();

    expect(tracker.isUnderPressure()).toBe(true);
  });
});
