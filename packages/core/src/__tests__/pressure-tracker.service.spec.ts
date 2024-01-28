import { mock } from "jest-mock-extended";

import { PressureTrackerService } from "../pressure-tracker.service";
import { Tracker } from "../trackers/tracker.interface";

jest.useFakeTimers();

describe("PressureTrackerService", () => {
  let service: PressureTrackerService;
  const tracker = mock<Tracker>();
  tracker.tick.mockReturnValue({
    value: 0,
    unit: "percentage",
    isUnderPressure: false,
  });

  beforeEach(() => {
    service = new PressureTrackerService([tracker], {
      timeout: 100,
    });
  });

  it("should not tick if the configured time is not ellapsed", () => {
    jest.advanceTimersByTime(50);

    expect(tracker.tick).not.toHaveBeenCalled();
  });

  it("should tick trackers on every tick", () => {
    jest.advanceTimersByTime(250);

    expect(tracker.tick).toHaveBeenCalled();
  });
});
