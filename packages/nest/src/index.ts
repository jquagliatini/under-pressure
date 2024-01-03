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
const PRESSURE_TRACKING_TRACKERS_TOKEN = Symbol();

@Injectable()
export class PressureTrackingService
  implements
    PressureTrackingServiceInterface,
    OnModuleInit,
    OnApplicationShutdown
{
  #service!: CorePressureTrackingService;

  constructor(
    @Inject(PRESSURE_TRACKING_TRACKERS_TOKEN)
    private readonly _trackers: readonly PressureTrackingServiceTracker[],
    @Optional()
    @Inject(PRESSURE_TRACKING_CONFIG_TOKEN)
    private readonly _config: PressureTrackingServiceConfig | undefined
  ) {}

  onModuleInit() {
    this.#service = new CorePressureTrackingService(
      this._trackers,
      this._config
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
  | PressureTrackingServiceConfig
  | Omit<ValueProvider<PressureTrackingServiceConfig>, "provide">
  | Omit<FactoryProvider<PressureTrackingServiceConfig>, "provide">;

@Module({})
export class PressureTrackingModule {
  static forRoot(config: {
    trackers: readonly PressureTrackingServiceTracker[];
    config?: PressureTrackingModuleConfig;
  }): DynamicModule {
    return {
      global: true,
      module: PressureTrackingModule,
      exports: [PressureTrackingService],
      providers: [
        parseConfig(config),
        {
          provide: PRESSURE_TRACKING_TRACKERS_TOKEN,
          useValue: config.trackers,
        },
        PressureTrackingService,
      ],
    };
  }
}

function parseConfig({
  config,
}: {
  config?: PressureTrackingModuleConfig;
}): Provider<PressureTrackingServiceConfig> {
  if (
    config &&
    ("useValue" in config || "useFactory" in config || "useExisting" in config)
  ) {
    return { ...config, provide: PRESSURE_TRACKING_CONFIG_TOKEN };
  }

  return { useValue: config ?? {}, provide: PRESSURE_TRACKING_CONFIG_TOKEN };
}
