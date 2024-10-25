import { HttpErrorResponse } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { Project } from '../models/bitbucket/Project';

@Injectable({
  providedIn: 'root'
})
export class AppStore {
  requestCounterWarningThreshold = 500;
  httpErrors = signal<[string, HttpErrorResponse][]>([]);
  projects = signal<Project[]>([])
  itemsLoading = signal<number>(0);
  isLoading = computed<boolean>(() => this.itemsLoading() != 0);
  requestCounter = signal<number>(0);

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
}
