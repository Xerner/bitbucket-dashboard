import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { PullRequestsStore } from '../../../../stores/pull-requests.store.service';
import { AppStore } from '../../../../stores/app.store.service';
import { GlobalQueryParams } from '../../../../settings/global-query-params';
import { QueryParamsStore } from '../../../../../repos/common/angular/query-params';

@Component({
  selector: 'app-last-updated-pull-request-counter',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './last-updated-pull-request-counter.component.html',
})
export class LastUpdatedPullRequestCounterComponent {
  GlobalQueryParams = GlobalQueryParams
  daysWindow = computed(() => parseInt(this.queryParamsStore.params[GlobalQueryParams.pullRequestDaysWindow]()[0]))
  pullRequestsWithinDateRangeCount = computed(() => {
    var pullRequests = this.pullRequestsStore.pullRequestsWithinDateRange()
    if (pullRequests == null) {
      return 0;
    }
    return pullRequests.length;
  })

  constructor(
    protected pullRequestsStore: PullRequestsStore,
    protected queryParamsStore: QueryParamsStore<GlobalQueryParams>,
    protected appStore: AppStore
  ) {}
}
