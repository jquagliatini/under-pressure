import { mock, mockClear } from "jest-mock-extended";
import { SuperAgentTest } from "supertest";

import { HttpStatus, Module } from "@nestjs/common";
import { Tracker } from "@jqgl/under-pressure-core";

import { PressureTrackingModule } from "../src";
import { FixtureModule, getRequestableServer } from "./fixtures";

describe("@jqgl/under-pressure-nestjs", () => {
  let request: SuperAgentTest;
  let close: (() => Promise<void>) | undefined;

  const tracker = mock<Tracker>();

  beforeEach(async () => {
    ({ request, close } = await getRequestableServer(AppModule));
    mockClear(tracker);
  });

  afterEach(() => close?.());

  @Module({
    imports: [
      FixtureModule,
      PressureTrackingModule.forRoot({
        trackers: [tracker],
      }),
    ],
  })
  class AppModule {}

  test("interceptor should not throw when not under pressure", async () => {
    tracker.isUnderPressure.mockReturnValue(false);
    tracker.tick.mockReturnValue({
      isUnderPressure: false,
      unit: "percentage",
      value: 0,
    });
    await request.get("/intercepted").expect(HttpStatus.OK);
  });

  test("interceptor should throw when under pressure", async () => {
    tracker.isUnderPressure.mockReturnValue(true);
    tracker.tick.mockReturnValue({
      isUnderPressure: true,
      unit: "percentage",
      value: 1,
    });
    await request.get("/intercepted").expect(HttpStatus.SERVICE_UNAVAILABLE);
  });
});
