import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AppStore } from "../stores/app.store.service";

@Injectable()
export class RequestCounterInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    var appStore = inject(AppStore)
    appStore.requestCounter.set(appStore.requestCounter() + 1)
    return next.handle(req);
  }
}
