import { computed, Injectable, signal } from '@angular/core';
import { ChartData, ChartOptions, ChartTypeRegistry } from 'chart.js';
import { DashboardService } from '../services/dashboard.service';
import { PullRequest } from '../models/bitbucket/PullRequest';
import { PullRequestsService } from '../services/pull-requests.service';
import { PULL_REQUEST_STATES } from '../services/bitbucket-api.service';
import { PersonnelStore } from './personnel.store.service';
import { Person } from '../models/Person';
import { AnonymityService } from '../services/AnonymityService.service';

@Injectable({
  providedIn: 'root'
})
export class PullRequestsStore {
  readonly MIN_LABEL_COUNT = 7;

  pullRequests = signal<PullRequest[] | null>(null);
  openPullRequests = computed(() => {
    var pullRequests = this.pullRequests();
    if (pullRequests == null) {
      return [];
    }
    return pullRequests?.filter(pullRequest => pullRequest.state == PULL_REQUEST_STATES.OPEN)
  })
  tableFilter = signal<string>("");
  filteredPullRequests = computed<Fuzzysort.KeysResults<PullRequest> | null>(() => {
    var pullRequests = this.openPullRequests();
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
    private pullRequestService: PullRequestsService,
    private personnelStore: PersonnelStore,
    private anonymityService: AnonymityService,
  ) { }

  getOptions(chartTitle: string, xAxisTitle: string, yAxisTitle: string): ChartOptions<keyof ChartTypeRegistry> {
    return {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: yAxisTitle
          },
          ticks: {
            stepSize: 1,
            precision: 0
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
    var data = this.openPullRequests();
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
    var data = this.openPullRequests();
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

  getSubmittedByAuthorChartData() {
    var data = this.pullRequests();
    var personnel = this.personnelStore.personnel();
    var chartDataset = this.dashboardService.getChartDataTemplate<number>("Count");
    if (data == null || data.length == 0) {
      return chartDataset;
    }
    var authorCounts: [Person, number][] = []
    data.forEach(pullRequest => {
      var person = this.personnelStore.getPersonByName(pullRequest.author.display_name);
      var count = authorCounts.find(ageCount_ => ageCount_[0] == person)
      if (count == undefined) {
        count = [person, 0]
        authorCounts.push(count);
      }
      count[1]++;
      return count;
    })
    personnel.forEach(person => this.addEmptyCountIfNotExists(person, authorCounts))
    authorCounts.sort((count1, count2) => count1[1] < count2[1] ? -1 : 1);
    chartDataset.datasets[0].data = authorCounts.map(authorCount => authorCount[1]);
    chartDataset.labels = authorCounts.map(authorCount => this.anonymityService.isAnonymous(authorCount[0]) ? "" : authorCount[0].name);
    return chartDataset;
  }

  getParticipatedByAuthorChartData() {
    var data = this.pullRequests();
    var personnel = this.personnelStore.personnel();
    var chartDataset = this.dashboardService.getChartDataTemplate<number>("Count");
    if (data == null || data.length == 0) {
      return chartDataset;
    }
    var participationCounts: [Person, number][] = []
    data.forEach(pullRequest => {
      var person = this.personnelStore.getPersonByName(pullRequest.author.display_name);
      pullRequest.participants.forEach(participant => {
        var participantPerson = this.personnelStore.getPersonByName(participant.user.display_name);
        if (person == participantPerson) {
          return;
        }
        var count = participationCounts.find(count_ => count_[0] == participantPerson)
        if (count == undefined) {
          count = [participantPerson, 0]
          participationCounts.push(count);
        }
        if (participant.participated_on != null) {
          count[1]++;
        }
      })
    })
    personnel.forEach(person => this.addEmptyCountIfNotExists(person, participationCounts))
    participationCounts.sort((count1, count2) => count1[1] < count2[1] ? -1 : 1);
    var expectedParticipation = Math.floor(data.length / participationCounts.length) * 2;
    expectedParticipation = expectedParticipation == 0 ? 1 : expectedParticipation;
    var expectedParticipationChartData = participationCounts.map(_ => expectedParticipation);
    chartDataset.datasets.push({
      type: 'line',
      label: 'Expected Participation = (# of PRs / participants) * 2',
      data: expectedParticipationChartData,
      fill: false,
      pointStyle: false,
      borderColor: 'rgba(196, 64, 64, 0.8)'
    });
    chartDataset.datasets[0].data = participationCounts.map(count => count[1]);
    chartDataset.datasets[0].backgroundColor = 'rgba(196, 64, 196, 0.6)';
    chartDataset.labels = participationCounts.map(participationCount => this.anonymityService.isAnonymous(participationCount[0]) ? "" : participationCount[0].name);
    return chartDataset;
  }

  addEmptyCountIfNotExists(person: Person, counts: [Person, number][]) {
    var hasPerson = counts.some(count => count[0] == person)
    if (hasPerson) {
      return;
    }
    var count: [Person, number] = [person, 0]
    counts.push(count);
  }
}
