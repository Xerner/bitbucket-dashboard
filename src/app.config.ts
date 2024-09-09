import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { RequestCounterInterceptor } from './interceptors/request-counter.interceptor';
import { initializeAppFactory } from './app.initializer';
import { InputsService } from './services/inputs.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    provideCharts(withDefaultRegisterables()),
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: RequestCounterInterceptor, multi: true },
    { provide: APP_INITIALIZER, useFactory: initializeAppFactory, deps: [HttpClient, InputsService], multi: true },
  ]
};
