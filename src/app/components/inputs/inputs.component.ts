import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { AppStore, QueryParamKey } from '../../stores/app.store.service';
import { BitbucketAPI } from '../../services/bitbucket-api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { PullRequestsStore as PullRequestsStore } from '../../stores/pull-requests.store.service';
import { PullRequest } from '../../models/PullRequest';
import { combineLatest, concat, concatMap, forkJoin, map, merge, mergeAll, share } from 'rxjs';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Commit } from '../../models/Commit';
import { CommitsStore } from '../../stores/commits.store.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InputsService } from '../../services/inputs.service';

@Component({
  selector: 'app-inputs',
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
  templateUrl: "inputs.component.html",
})
export class InputsComponent {
  constructor(
    protected appStore: AppStore,
    private pullRequestsStore: PullRequestsStore,
    private commitsStore: CommitsStore,
    protected inputsService: InputsService,
    private bitbucketAPI: BitbucketAPI,
  ) { }

  onFetchClick() {
    if (!this.inputsService.form.valid || this.appStore.itemsLoading()) {
      return;
    }
    var allPullRequests: PullRequest[] = [];
    var allCommits: Commit[] = [];
    var repositoriesSharedObservable = this.bitbucketAPI.getRepositories(this.appStore.queryParams[QueryParamKey.project]()).pipe(share())
    this.appStore.itemsLoading.set(this.appStore.itemsLoading() + 2);
    // fetch pull requests
    repositoriesSharedObservable.pipe(
      concatMap(repositories => repositories.map(repository => this.bitbucketAPI.getPullRequests(repository.uuid))),
      mergeAll(),
      map((pullRequests) => pullRequests.flat())
    ).subscribe({
      next: (pullRequests) => {
        allPullRequests = allPullRequests.concat(pullRequests)
      },
      error: (error) => {
        this.appStore.addError('fetching pull requests', error)
      },
      complete: () => {
        this.appStore.removeError('fetching pull requests')
        this.appStore.itemsLoading.set(this.appStore.itemsLoading() - 1);
        this.pullRequestsStore.pullRequests.set(allPullRequests);
      }
    })
    // fetch commits
    repositoriesSharedObservable.pipe(
      concatMap(repositories => repositories.map(repository => this.bitbucketAPI.getCommits(repository.uuid))),
      mergeAll(),
      map((commits) => commits.flat())
    ).subscribe({
      next: (commits) => {
        allCommits = allCommits.concat(commits)
      },
      error: (error) => {
        this.appStore.addError('fetching commits', error)
      },
      complete: () => {
        this.appStore.removeError('fetching commits')
        this.appStore.itemsLoading.set(this.appStore.itemsLoading() - 1);
        this.commitsStore.commits.set(allCommits);
      }
    })
  }



  errorToString(httpErrorResponse: HttpErrorResponse): string {
    return httpErrorResponse.error.error.message
  }
}
