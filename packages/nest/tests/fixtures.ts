import {
  Controller,
  Get,
  Module,
  ServiceUnavailableException,
  Type,
  UseInterceptors,
} from "@nestjs/common";
import { PressureTrackingInterceptor, PressureTrackingModule, PressureTrackingService } from "..";
import { SuperAgentTest, agent } from "supertest";

import { Test } from "@nestjs/testing";

@Controller()
class FixtureAppController {
  constructor(private readonly pressure: PressureTrackingService) {}

  @Get("health")
  health() {
    if (this.pressure.isUnderPressure()) {
      throw new ServiceUnavailableException();
    }

    return { ok: true };
  }

  @Get("intercepted")
  @UseInterceptors(PressureTrackingInterceptor())
  intercepted() {
    return { ok: true };
  }
}

@Module({ controllers: [FixtureAppController] })
export class FixtureModule {}

export async function getRequestableServer(module: Type) {
  const container = await Test.createTestingModule({
    imports: [module],
  }).compile();

  const app = container.createNestApplication();
  await app.init();

  const request = agent(app.getHttpServer()) as unknown as SuperAgentTest;

  const close = () => app.close();

  return { request, close };
}
