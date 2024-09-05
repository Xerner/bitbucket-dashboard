import { Injectable } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { PullRequest } from '../models/bitbucket/PullRequest';
import { DashboardService } from './dashboard.service';
import fuzzysort from 'fuzzysort';
import { getProperty } from '../library/get-property';

@Injectable({
  providedIn: 'root'
})
export class PullRequestsService {
  displayedColumns = [
    'destination.repository.name',
    'author.display_name',
    'title',
    'created_on',
    'updated_on'
  ];
  sorts: { [key: string]: (pr1: PullRequest, pr2: PullRequest, sortDirection: SortDirection) => number } = {
    "destination.repository.name": (pr1: PullRequest, pr2: PullRequest, sortDirection): number => this.dashboardService.genericSort(pr1.destination.repository.name, pr2.destination.repository.name, sortDirection),
    "title": (pr1: PullRequest, pr2: PullRequest, sortDirection): number => this.dashboardService.genericSort(pr1.title, pr2.title, sortDirection),
    "created_on": (pr1: PullRequest, pr2: PullRequest, sortDirection): number => this.dashboardService.genericSort(this.dashboardService.getAge(pr1.created_on), this.dashboardService.getAge(pr2.created_on), sortDirection),
    "updated_on": (pr1: PullRequest, pr2: PullRequest, sortDirection): number => this.dashboardService.genericSort(this.dashboardService.getAge(pr1.updated_on), this.dashboardService.getAge(pr2.updated_on), sortDirection),
  }

  constructor(
    private dashboardService: DashboardService,
  ) { }

  fuzzySort(filter: string, pullRequests: PullRequest[]) {
    return fuzzysort.go<PullRequest>(filter, pullRequests, {
      keys: this.displayedColumns,
      all: true
    })
  }

  isLastUpdatedOverThreshold(pullRequest: PullRequest) {
    return this.dashboardService.isAgeOverThreshold(this.dashboardService.getAge(pullRequest.updated_on));
  }

  getHighlight(keysResult: Fuzzysort.KeysResult<PullRequest>, displayedColumn: string): string {
    var result = keysResult[this.displayedColumns.indexOf(displayedColumn)]
    if (result.score > 0) {
      return result.highlight()
    }
    return getProperty(keysResult.obj, displayedColumn);
  }
}
