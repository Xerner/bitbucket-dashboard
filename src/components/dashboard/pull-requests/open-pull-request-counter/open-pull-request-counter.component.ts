import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { PullRequestsStore } from '../../../../stores/pull-requests.store.service';
import { AppStore, QueryParamKey } from '../../../../stores/app.store.service';

@Component({
  selector: 'app-open-pull-request-counter',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './open-pull-request-counter.component.html',
})
export class OpenPullRequestCounterComponent {
  QueryParamKey = QueryParamKey
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
