import { PressureTrackerService } from "../pressure-tracker.service";
import { Tracker } from "../trackers/tracker.interface";
import { mock } from "jest-mock-extended";

jest.useFakeTimers();

describe("PressureTrackerService", () => {
  let service: PressureTrackerService;
  const tracker = mock<Tracker>();

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
