import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { AppStore, QueryParamKey } from '../../stores/app.store.service';
import { BitbucketAPI } from '../../services/bitbucket-api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { PullRequestsStore as PullRequestsStore } from '../../stores/pull-requests.store.service';
import { PullRequest } from '../../models/PullRequest';
import { concatMap, map, mergeAll, share } from 'rxjs';
import { Commit } from '../../models/Commit';
import { CommitsStore } from '../../stores/commits.store.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InputsService } from '../../services/inputs.service';
import { BitbucketService } from '../../services/bitbucket.service';

@Component({
  selector: 'app-api-inputs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: "api-inputs.component.html",
})
export class ApiInputsComponent {
  constructor(
    protected appStore: AppStore,
    private pullRequestsStore: PullRequestsStore,
    private commitsStore: CommitsStore,
    protected inputsService: InputsService,
    private bitbucketApi: BitbucketAPI,
    private bitbucketService: BitbucketService,
  ) { }

  onFetchAllClicked() {
    if (!this.inputsService.form.valid || this.appStore.itemsLoading()) {
      return;
    }
    var repositoriesSharedObservable = this.bitbucketApi.getRepositories(this.appStore.queryParams[QueryParamKey.project]()).pipe(share())
    this.bitbucketService.getPullRequestsFromRepositories(repositoriesSharedObservable);
    this.bitbucketService.getCommitsFromRepositories(repositoriesSharedObservable);
  }

  errorToString(httpErrorResponse: HttpErrorResponse): string {
    return httpErrorResponse.error.error.message
  }
}
