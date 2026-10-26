import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withDebugTracing } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './auth/interceptors/auth.interceptor';
import { provideToastr } from 'ngx-toastr';
import { provideSignalFormsConfig } from '@angular/forms/signals';
import { NG_STATUS_CLASSES } from '@angular/forms/signals/compat';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      // withDebugTracing(),
      withComponentInputBinding()
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideToastr(),
    provideSignalFormsConfig({
      classes: NG_STATUS_CLASSES
    })
  ],
};
