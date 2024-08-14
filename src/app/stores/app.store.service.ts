import { HttpErrorResponse } from '@angular/common/http';
import { computed, Injectable, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

export type QueryParamKeyType = QueryParamKey | string;
export enum QueryParamKey {
  overdueThreshold = 'overdueThreshold',
  daysWindow = 'daysWindow',
  workspace = 'workspace',
  project = 'project',
  access_token = 'access_token',
  author_aliases = 'author_aliases',
}

@Injectable({
  providedIn: 'root'
})
export class AppStore {
  requestCounterWarningThreshold = 500;
  httpErrors = signal<[string, HttpErrorResponse][] | null>(null);

  addError(source: string, error: HttpErrorResponse) {
    var errors = this.httpErrors();
    if (errors == null) {
      this.httpErrors.set([[source, error]])
      return;
    }
    this.httpErrors.set([...errors, [source, error]])
  }

  removeError(source: string) {
    var errors = this.httpErrors();
    if (errors == null) {
      return;
    }
    this.httpErrors.set(errors.filter(errors => errors[0] != source))
  }

  queryParams: { [key: QueryParamKeyType]: WritableSignal<any> } = {
    overdueThreshold: signal<number | null>(null),
    daysWindow: signal<number | null>(null),
    workspace: signal<string | null>(""),
    project: signal<string | null>(""),
    access_token: signal<string | null>(""),
    author_aliases: signal<string | null>(""),
  }
  itemsLoading = signal<number>(0);
  isLoading = computed<boolean>(() => this.itemsLoading() != 0);
  requestCounter = signal<number>(0);

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  updateStoredQueryParam(name: QueryParamKeyType, value: any) {
    if (value != this.queryParams[name]()) {
      this.queryParams[name].set(value);
    }
  }

  updateQueryParam(name: string, value: any) {
    if (value == null) {
      return;
    }
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
