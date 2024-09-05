import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { AppStore } from "../stores/app.store.service";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    var appStore = inject(AppStore)
    // https://stackoverflow.com/a/53379715/12265840
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        appStore.addError(req.url, error)
        appStore.itemsLoading.set(0)
        return throwError(() => error);
      }));
  }
}
