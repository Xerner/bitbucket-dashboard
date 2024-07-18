import { Injectable, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AppStore {
  queryParams: Record<string, WritableSignal<any>> = {
    'overdueThreshold': signal<number | null>(null),
    'daysWindow': signal<number | null>(null),
    'workspace': signal<string | null>(""),
    'access_token': signal<string | null>(""),
  }
  isLoading = signal(false);

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  updateStoredQueryParam(name: string, value: any) {
    if (value != this.queryParams[name]()) {
      this.queryParams[name].set(value);
    }
  }

  updateQueryParam(name: string, value: any) {
    const queryParams: Params = { [name]: value.toString() };
    var currentValue = this.route.snapshot.queryParamMap.get(name);
    if (currentValue == value) {
      return;
    }
    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams,
        queryParamsHandling: 'merge', // remove to replace all query params by provided
      }
    );
  }
}
