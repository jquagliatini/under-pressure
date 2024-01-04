import { mock, mockClear } from "jest-mock-extended";
import { SuperAgentTest } from "supertest";

import { HttpStatus, Module } from "@nestjs/common";
import { Tracker } from "@pressure/core";

import { PressureTrackingModule } from "../src";
import { FixtureModule, getRequestableServer } from "./fixtures";

describe("@pressure/nest", () => {
  let request: SuperAgentTest;
  let close: () => Promise<void>;

  const tracker = mock<Tracker>();

  beforeEach(async () => {
    ({ request, close } = await getRequestableServer(AppModule));
    mockClear(tracker);
  });

  afterEach(() => close());

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
    await request.get("/intercepted").expect(HttpStatus.OK);
  });

  test("interceptor should throw when under pressure", async () => {
    tracker.isUnderPressure.mockReturnValue(true);
    await request.get("/intercepted").expect(HttpStatus.SERVICE_UNAVAILABLE);
  });
});
