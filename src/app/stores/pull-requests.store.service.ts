import { computed, Injectable, signal } from '@angular/core';
import { ChartData, ChartOptions, ChartTypeRegistry } from 'chart.js';
import { DashboardService } from '../services/dashboard.service';
import { PullRequest } from '../models/PullRequest';
import { PullRequestsService } from '../services/pull-requests.service';

@Injectable({
  providedIn: 'root'
})
export class PullRequestsStore {
  readonly MIN_LABEL_COUNT = 7;

  pullRequests = signal<PullRequest[] | null>(null);
  tableFilter = signal<string>("");
  filteredPullRequests = computed<Fuzzysort.KeysResults<PullRequest> | null>(() => {
    var pullRequests = this.pullRequests();
    if (pullRequests == null) {
      return null;
    }
    var filter = this.tableFilter();
    var filteredPullRequests = this.pullRequestService.fuzzySort(filter, pullRequests);
    return filteredPullRequests;
  });
  pullRequestsAges = computed<ChartData<keyof ChartTypeRegistry, number[], string>>(this.getAgesChartData.bind(this));
  pullRequestsLastUpdated = computed<ChartData<keyof ChartTypeRegistry, number[], string>>(this.getLastUpdatedChartData.bind(this));

  constructor(
    private dashboardService: DashboardService,
    private pullRequestService: PullRequestsService
  ) { }

  getOptions(chartTitle: string, xAxisTitle: string, yAxisTitle: string): ChartOptions<keyof ChartTypeRegistry> {
    return {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: yAxisTitle
          }
        },
        x: {
          beginAtZero: true,
          title: {
            display: true,
            text: xAxisTitle
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: chartTitle
        }
      }
    }
  }

  getAgesChartData(): ChartData<keyof ChartTypeRegistry, number[], string> {
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

  getLastUpdatedChartData(): ChartData<keyof ChartTypeRegistry, number[], string> {
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
