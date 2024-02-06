import { FixtureModule, getRequestableServer } from "./fixtures";
import { HttpStatus, Module } from "@nestjs/common";
import { mock, mockReset } from "jest-mock-extended";

import { PressureTrackingModule } from "../src";
import { SuperAgentTest } from "supertest";
import { Tracker } from "@jqgl/under-pressure-core";

describe("@jqgl/under-pressure-nestjs", () => {
  let close: (() => Promise<void>) | undefined;
  let request: SuperAgentTest;

  const tracker = mock<Tracker>();

  @Module({
    imports: [
      FixtureModule,
      PressureTrackingModule.forRoot({
        trackers: [tracker],
      }),
    ],
  })
  class AppModule {}

  beforeEach(async () => {
    mockReset(tracker);
    ({ request, close } = await getRequestableServer(AppModule));
  });

  afterEach(() => close?.());

  test("health should be available when not under pressure", async () => {
    tracker.isUnderPressure.mockReturnValue(false);
    tracker.tick.mockReturnValue({
      isUnderPressure: false,
      unit: "percentage",
      value: 0,
    });
    await request.get("/health").expect(HttpStatus.OK);
  });

  test("health should be unavailable when under pressure", async () => {
    tracker.isUnderPressure.mockReturnValue(true);
    tracker.tick.mockReturnValue({
      isUnderPressure: true,
      unit: "percentage",
      value: 1,
    });
    await request.get("/health").expect(HttpStatus.SERVICE_UNAVAILABLE);
  });
});
