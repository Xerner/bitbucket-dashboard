import { computed, Injectable, signal } from '@angular/core';
import { LabelAndData } from '../models/LabelAndData';
import { ChartData, ChartOptions, ChartTypeRegistry } from 'chart.js';
import { DateTime } from 'luxon';
import { Sort, SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AppStore } from './app.store.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardStore {
  displayedColumns = ['title', 'age'];
  pullRequests = signal<any[] | null>(null);

  //#region Chart stuff
  pullRequestOptions = signal<ChartOptions<keyof ChartTypeRegistry>>({
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number Of Pull Requests"
        }
      },
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Days Since Created"
        }
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Days Since Pull Requests Were Opened'
      }
    }
  })
  pullRequestsAges = computed<ChartData<keyof ChartTypeRegistry, number[], string>>(this.getPullRequestsAgesForChart.bind(this));
  //#endregion

  pullRequestSorts: { [key: string]: (pr1: any, pr2: any, sortDirection: SortDirection) => number } = {
    "title": (pr1: any, pr2: any, sortDirection): number => this.genericSort(pr1['title'], pr2['title'], sortDirection),
    "age": (pr1: any, pr2: any, sortDirection): number => this.genericSort(this.getAge(pr1['created_on']), this.getAge(pr2['created_on']), sortDirection)
  }

  constructor(private appStore: AppStore) { }

  getPullRequestsAgesForChart(): ChartData<keyof ChartTypeRegistry, number[], string> {
    var data = this.pullRequests();
    var chartDataset = this.getChartDataTemplate<number>("Days");
    if (data == null) {
      return chartDataset;
    }
    var ageDataCounts: [number, number][] = []
    data.forEach(pullRequest => {
      var age = this.getAge(pullRequest["created_on"])
      var ageCount = ageDataCounts.find(ageCount_ => ageCount_[0] == age)
      if (ageCount == undefined) {
        ageCount = [age, 0]
        ageDataCounts.push(ageCount);
      }
      ageCount[1]++;
      return ageCount;
    })
    ageDataCounts.sort((ageCount1, ageCount2) => ageCount1[0] < ageCount2[0] ? -1 : 1);
    var largestAge = Math.max(...ageDataCounts.map(data => data[0]));
    var labels = new Array<number>(largestAge + 1).fill(0).map((_, i) => i)
    var chartData = new Array<number>(labels.length).fill(0).map((_, i) => {
      var ageCount = ageDataCounts.find(ageCount => ageCount[0] == i)
      if (ageCount == undefined) {
        return 0;
      }
      return ageCount[1];
    })
    chartDataset.datasets[0].data = chartData;
    chartDataset.datasets[0].backgroundColor = labels.map(age => this.getOverdueBackgroundColor(age));
    chartDataset.labels = labels.map(i => i.toString());
    return chartDataset;
  }

  private getChartDataTemplate<T>(datasetLabel: string): ChartData<keyof ChartTypeRegistry, T[], string> {
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

  genericSort(item1: any, item2: any, sortDirection: SortDirection) {
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
      return 'rgba(255, 99, 132, 0.2)';
    }
    return 'rgba(75, 192, 192, 0.2)';
  }

  isPullRequestAgeOverThreshold(pullRequest: any) {
    return this.isAgeOverThreshold(this.getAge(pullRequest["created_on"]));
  }

  isAgeOverThreshold(age: number) {
    var overdueThreshold = this.appStore.overdueThreshold();
    if (overdueThreshold == null) {
      return false;
    }
    return age >= overdueThreshold;
  }
}
