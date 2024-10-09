import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { PullRequestsStore } from '../../../../stores/pull-requests.store.service';
import { AppStore, QueryParamKey } from '../../../../stores/app.store.service';

@Component({
  selector: 'app-last-updated-pull-request-counter',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './last-updated-pull-request-counter.component.html',
})
export class LastUpdatedPullRequestCounterComponent {
  QueryParamKey = QueryParamKey
  pullRequestsWithinDateRangeCount = computed(() => {
    var pullRequests = this.pullRequestsStore.pullRequestsWithinDateRange()
    if (pullRequests == null) {
      return 0;
    }
    return pullRequests.length;
  })

  constructor(
    protected pullRequestsStore: PullRequestsStore,
    protected appStore: AppStore
  ) {}
}
