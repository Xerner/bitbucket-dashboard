import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { PullRequestsStore } from '../../../../stores/pull-requests.store.service';
import { AppStore, QueryParamKey } from '../../../../stores/app.store.service';

@Component({
  selector: 'app-pull-request-counter',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './pull-request-counter.component.html',
})
export class PullRequestCounterComponent {
  QueryParamKey = QueryParamKey
  allPullRequestsCount = computed(() => {
    var pullRequests = this.pullRequestsStore.pullRequests()
    if (pullRequests == null) {
      return 0;
    }
    return pullRequests.length;
  })
  openPullRequestsCount = computed(() => {
    var pullRequests = this.pullRequestsStore.openPullRequests()
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
