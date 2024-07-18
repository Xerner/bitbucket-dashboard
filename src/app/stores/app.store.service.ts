import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppStore {
  isLoading = signal(false);
  token = signal<string | null>("");
  workspace = signal<string | null>("");
  overdueThreshold = signal<number | null>(null);
}
