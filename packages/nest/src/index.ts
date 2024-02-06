import {
  DynamicModule,
  FactoryProvider,
  Inject,
  Injectable,
  Module,
  OnApplicationShutdown,
  OnModuleInit,
  Optional,
  Provider,
  ValueProvider,
} from "@nestjs/common";
import {
  CorePressureTrackingService,
  PressureTrackingServiceInterface,
  PressureTrackingServiceTracker,
  PressureTrackingServiceConfig,
  SubscriptionNext,
} from "./vendor";

const PRESSURE_TRACKING_CONFIG_TOKEN = Symbol();

@Injectable()
export class PressureTrackingService
  implements
    PressureTrackingServiceInterface,
    OnModuleInit,
    OnApplicationShutdown
{
  #service!: CorePressureTrackingService;

  readonly #trackers: readonly PressureTrackingServiceTracker[];
  readonly #config: PressureTrackingServiceConfig;

  constructor(
    @Optional()
    @Inject(PRESSURE_TRACKING_CONFIG_TOKEN)
    config:
      | {
          config?: PressureTrackingServiceConfig;
          trackers: readonly PressureTrackingServiceTracker[];
        }
      | undefined
  ) {
    this.#trackers = config?.trackers ?? [];
    this.#config = config?.config ?? {};
  }

  onModuleInit() {
    this.#service = new CorePressureTrackingService(
      this.#trackers,
      this.#config
    );
  }

  onApplicationShutdown() {
    this.#service.stop();
  }

  isUnderPressure(): boolean {
    return this.#service.isUnderPressure();
  }

  subscribe(next: SubscriptionNext) {
    return this.#service.subscribe(next);
  }
}

type PressureTrackingModuleConfig =
  | {
      config?: PressureTrackingServiceConfig;
      trackers: PressureTrackingServiceTracker[];
    }
  | Omit<
      ValueProvider<{
        config?: PressureTrackingServiceConfig;
        trackers: PressureTrackingServiceTracker[];
      }>,
      "provide"
    >
  | Omit<
      FactoryProvider<{
        config?: PressureTrackingServiceConfig;
        trackers: PressureTrackingServiceTracker[];
      }>,
      "provide"
    >;

@Module({})
export class PressureTrackingModule {
  static forRoot(config?: PressureTrackingModuleConfig): DynamicModule {
    return {
      global: true,
      module: PressureTrackingModule,
      exports: [PressureTrackingService],
      providers: [provideConfig(config), PressureTrackingService],
    };
  }
}

function provideConfig(config?: PressureTrackingModuleConfig): Provider<{
  config?: PressureTrackingServiceConfig;
  trackers: readonly PressureTrackingServiceTracker[];
}> {
  if (config && ("useValue" in config || "useFactory" in config)) {
    return { ...config, provide: PRESSURE_TRACKING_CONFIG_TOKEN };
  }

  return {
    useValue: config ?? { trackers: [] },
    provide: PRESSURE_TRACKING_CONFIG_TOKEN,
  };
}
