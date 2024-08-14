import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, SecurityContext, signal, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTable, MatTableModule } from '@angular/material/table';
import { deepClone } from '../../../library/deep-clone';
import { PullRequest } from '../../../models/PullRequest';
import { DashboardService } from '../../../services/dashboard.service';
import { AppStore } from '../../../stores/app.store.service';
import { PullRequestsStore } from '../../../stores/pull-requests.store.service';
import { debounceTime, fromEvent, tap } from 'rxjs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PullRequestsService } from '../../../services/pull-requests.service';
import { DomSanitizer } from '@angular/platform-browser';
import { InputsService } from '../../../services/inputs.service';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-pull-request-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    BaseChartDirective,
    MatProgressBarModule,
  ],
  templateUrl: 'pull-request-table.component.html',
})
export class PullRequestTableComponent {
  @ViewChild(MatTable)
  table!: MatTable<PullRequest>;
  @ViewChild('filterInput', { static: true })
  filterInput!: ElementRef<HTMLInputElement>;
  isTyping = signal<boolean>(false);

  pullRequestsCount = computed(() => {
    var pullRequests = this.pullRequestsStore.pullRequests()
    if (pullRequests == null) {
      return 0;
    }
    return pullRequests.length;
  })
  constructor(
    protected dashboardService: DashboardService,
    protected pullRequestsStore: PullRequestsStore,
    protected pullRequestService: PullRequestsService,
    private domSanitizer: DomSanitizer,
    protected inputsService: InputsService,
    protected appStore: AppStore
  ) {}

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
