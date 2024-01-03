import { mock } from "jest-mock-extended";
import { EventLoopUtilization, performance } from "node:perf_hooks";
import { EventLoopUtilizationTracker } from "../event-loop-utilization.tracker";

describe("EventLoopUtilizationTracker", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should not be under pressure when event loop utilization is less than the maxValue", () => {
    jest
      .spyOn(performance, "eventLoopUtilization")
      .mockReturnValue(mock<EventLoopUtilization>({ utilization: 0.1 }));

    const tracker = new EventLoopUtilizationTracker({ maxValue: 0.5 });
    tracker.tick();

    expect(tracker.isUnderPressure()).toBe(false);
  });

  it("should be under pressure when event loop utilization is greater than the maxValue", () => {
    jest
      .spyOn(performance, "eventLoopUtilization")
      .mockReturnValue(mock<EventLoopUtilization>({ utilization: 0.6 }));

    const tracker = new EventLoopUtilizationTracker({ maxValue: 0.5 });
    tracker.tick();

    expect(tracker.isUnderPressure()).toBe(true);
  });
});
