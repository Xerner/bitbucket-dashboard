import { CommonModule } from '@angular/common';
import { Component, ElementRef, SecurityContext, signal, ViewChild } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { DashboardService } from '../../../../services/dashboard.service';
import { PullRequestsService } from '../../../../services/pull-requests.service';
import { PullRequestsStore } from '../../../../stores/pull-requests.store.service';
import { MatSortModule, Sort } from '@angular/material/sort';
import { fromEvent, tap, debounceTime } from 'rxjs';
import { deepClone } from '../../../../library/deep-clone';
import { PullRequest } from '../../../../models/bitbucket/PullRequest';
import { DomSanitizer } from '@angular/platform-browser';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-pull-request-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatInputModule,
    MatProgressBarModule,
    MatSortModule,
  ],
  templateUrl: "pull-request-table.component.html",
})
export class PullRequestTableComponent {
  @ViewChild('filterInput', { static: true })
  filterInput!: ElementRef<HTMLInputElement>;
  isTyping = signal<boolean>(false);

  constructor(
    protected dashboardService: DashboardService,
    protected pullRequestsStore: PullRequestsStore,
    protected pullRequestService: PullRequestsService,
    private domSanitizer: DomSanitizer,
  ) { }

  ngOnInit(): void {
    fromEvent(this.filterInput.nativeElement, "keyup")
      .pipe(
        tap(() => this.isTyping.set(true)),
        debounceTime(1000)
      )
      .subscribe(this.applyFilter.bind(this))
  }

  sortPullRequests(sort: Sort) {
    var pullRequests = this.pullRequestsStore.pullRequests()
    if (pullRequests == null || pullRequests.length == 0) {
      return;
    }
    pullRequests.sort((pr1, pr2) => {
      return this.pullRequestService.sorts[sort.active](pr1, pr2, sort.direction)
    });
    this.pullRequestsStore.pullRequests.set(deepClone(pullRequests));
  }

  applyFilter(event: Event) {
    this.isTyping.set(false)
    const filterValue = (event.target as HTMLInputElement).value;
    this.pullRequestsStore.tableFilter.set(filterValue.trim().toLowerCase());
  }

  getHighlight(keysResult: Fuzzysort.KeysResult<PullRequest>, column: string): string {
    return this.domSanitizer.sanitize(SecurityContext.HTML, this.pullRequestService.getHighlight(keysResult, column)) ?? ""
  }
}
