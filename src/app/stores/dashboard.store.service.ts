import { computed, Injectable, signal } from '@angular/core';
import { ChartData, ChartOptions, ChartTypeRegistry } from 'chart.js';
import { DashboardService } from '../services/dashboard.service';
import { PullRequest } from '../models/PullRequest';
import { MatTableDataSource } from '@angular/material/table';

@Injectable({
  providedIn: 'root'
})
export class DashboardStore {
  readonly MIN_LABEL_COUNT = 7;

  displayedColumns = [
    'repository',
    'title',
    'age',
    'lastUpdated'
  ];
  pullRequests = signal<PullRequest[] | null>(null);
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
  pullRequestsAges = computed<ChartData<keyof ChartTypeRegistry, number[], string>>(this.getPullRequestsAgesChartData.bind(this));
  pullRequestsLastUpdated = computed<ChartData<keyof ChartTypeRegistry, number[], string>>(this.getPullRequestsLastUpdatedChartData.bind(this));

  constructor(
    private dashboardService: DashboardService
  ) { }

  getPullRequestsAgesChartData(): ChartData<keyof ChartTypeRegistry, number[], string> {
    var data = this.pullRequests();
    var chartDataset = this.dashboardService.getChartDataTemplate<number>("Count");
    if (data == null) {
      return chartDataset;
    }
    var ageDataCounts: [number, number][] = []
    data.forEach(pullRequest => {
      var age = this.dashboardService.getAge(pullRequest.created_on)
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
    var labels = this.dashboardService.getLabels(largestAge + 1, this.MIN_LABEL_COUNT);
    var chartData = new Array<number>(labels.length).fill(0).map((_, i) => {
      var ageCount = ageDataCounts.find(ageCount => ageCount[0] == i)
      if (ageCount == undefined) {
        return 0;
      }
      return ageCount[1];
    })
    chartDataset.datasets[0].data = chartData;
    chartDataset.labels = labels.map(i => i.toString());
    return chartDataset;
  }

  getPullRequestsLastUpdatedChartData(): ChartData<keyof ChartTypeRegistry, number[], string> {
    var data = this.pullRequests();
    var chartDataset = this.dashboardService.getChartDataTemplate<number>("Count");
    if (data == null) {
      return chartDataset;
    }
    var ageDataCounts: [number, number][] = []
    data.forEach(pullRequest => {
      var age = this.dashboardService.getAge(pullRequest.updated_on)
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
    var labels = this.dashboardService.getLabels(largestAge + 1, this.MIN_LABEL_COUNT);
    var chartData = new Array<number>(labels.length).fill(0).map((_, i) => {
      var ageCount = ageDataCounts.find(ageCount => ageCount[0] == i)
      if (ageCount == undefined) {
        return 0;
      }
      return ageCount[1];
    })
    chartDataset.datasets[0].data = chartData;
    chartDataset.datasets[0].backgroundColor = labels.map(age => this.dashboardService.getOverdueBackgroundColor(age));
    chartDataset.labels = labels.map(i => i.toString());
    return chartDataset;
  }
}
