import { computed, Injectable, signal } from '@angular/core';
import { Project } from '../models/bitbucket/Project';

@Injectable({
  providedIn: 'root'
})
export class AppStore {
  requestCounterWarningThreshold = 500;
  errors = signal<[string, string][]>([]);
  projects = signal<Project[]>([])
  itemsLoading = signal<number>(0);
  isLoading = computed<boolean>(() => this.itemsLoading() != 0);
  requestCounter = signal<number>(0);

  addError(source: string, error: string) {
    var errors = this.errors();
    if (errors == null) {
      this.errors.set([[source, error]])
      return;
    }
    this.errors.set([...errors, [source, error]])
  }

  removeError(source: string) {
    var errors = this.errors();
    if (errors == null) {
      return;
    }
    this.errors.set(errors.filter(errors => errors[0] != source))
  }
}
