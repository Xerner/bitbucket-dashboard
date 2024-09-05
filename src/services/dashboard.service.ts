import { Injectable } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { ChartData, ChartTypeRegistry } from 'chart.js';
import { DateTime } from 'luxon';
import { AppStore } from '../stores/app.store.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
    private appStore: AppStore,
  ) { }

  getChartDataTemplate<T>(datasetLabel: string): ChartData<keyof ChartTypeRegistry, T[], string> {
    return {
      labels: [],
      datasets: [{
        label: datasetLabel,
        data: [],
        borderWidth: 1,
      }]
    }
  }

  diffDatesInDays(date1: DateTime, date2: DateTime): number {
    return Math.floor(date1.diff(date2, 'days').days);
  }

  getAge(dateString: string) {
    var now = DateTime.now();
    return this.diffDatesInDays(now, DateTime.fromISO(dateString));
  }

  genericSort<T>(item1: T, item2: T, sortDirection: SortDirection) {
    if (item1 == item2) {
      return 0;
    }
    if (item1 > item2) {
      return sortDirection == 'asc' ? 1 : -1;
    }
    return sortDirection == 'asc' ? -1 : 1;
  }

  getOverdueBackgroundColor(age: number) {
    if (this.isAgeOverThreshold(age)) {
      return 'rgba(255, 99, 132, 0.6)';
    }
    return 'rgba(75, 192, 192, 0.6)';
  }

  isAgeOverThreshold(age: number) {
    var overdueThreshold = this.appStore.queryParams['overdueThreshold']();
    if (overdueThreshold == null) {
      return false;
    }
    return age >= overdueThreshold;
  }

  getLabels(count: number, minCount: number = 0) {
    return new Array<number>(Math.max(count, minCount)).fill(0).map((_, i) => i)
  }
}
