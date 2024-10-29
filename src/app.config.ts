import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { provideRequestCounterInterceptor } from '../repos/common/angular/interceptors';
import { initializeAppFactory } from './app.initializer';
import { InputsService } from './services/inputs.service';
import { provideQueryParams } from '../repos/common/angular/query-params';
import { GlobalQueryParams } from './settings/global-query-params';
import { provideFeatureFlags } from '../repos/common/angular/feature-flags/provider';
import { Features } from './settings/features/Features';
import { Views } from './settings/features/Views';
import { FeatureFlags } from './settings/features/FeatureFlags';
import { FeatureViews } from './settings/features/FeatureViews';
import { AppStore } from './stores/app.store.service';
import { provideLuxonDateAdapter } from '@angular/material-luxon-adapter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    provideCharts(withDefaultRegisterables()),
    provideLuxonDateAdapter(),
    provideQueryParams(GlobalQueryParams),
    provideFeatureFlags<Features, Views>(FeatureFlags, FeatureViews),
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    provideRequestCounterInterceptor(AppStore),
    { provide: APP_INITIALIZER, useFactory: initializeAppFactory, deps: [HttpClient, InputsService], multi: true },
  ]
};
