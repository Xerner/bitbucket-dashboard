import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { PullRequestsStore } from '../../../../stores/pull-requests.store.service';
import { AppStore } from '../../../../stores/app.store.service';
import { GlobalQueryParams } from '../../../../settings/global-query-params';
import { QueryParamsStore } from '../../../../../repos/common/angular/query-params';
import { DateTime } from 'luxon';
import { DatetimePipe } from '../../../../../repos/common/angular/pipes/datetime.pipe';

@Component({
  selector: 'app-last-updated-pull-request-counter',
  standalone: true,
  imports: [
    CommonModule,
    DatetimePipe,
  ],
  templateUrl: './last-updated-pull-request-counter.component.html',
})
export class LastUpdatedPullRequestCounterComponent {
  GlobalQueryParams = GlobalQueryParams
  startDate = computed(() => DateTime.fromISO(this.queryParamsStore.params.prStartDate()[0]))
  endDate = computed(() => DateTime.fromISO(this.queryParamsStore.params.prEndDate()[0]))
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
