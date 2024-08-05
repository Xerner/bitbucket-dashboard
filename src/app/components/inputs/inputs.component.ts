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
export class InputsComponent implements OnInit {
  form = new FormGroup({
    overdueThreshold: new FormControl<number | null>(this.appStore.queryParams['overdueThreshold']()),
    daysWindow: new FormControl<number | null>(this.appStore.queryParams['daysWindow']()),

    workspace: new FormControl<string | null>(this.appStore.queryParams['workspace'](), [Validators.required]),
    project: new FormControl<number | null>(this.appStore.queryParams['project'](), [Validators.required]),
    access_token: new FormControl<string | null>(this.appStore.queryParams['access_token'](), [Validators.required]),
  });

  constructor(
    protected appStore: AppStore,
    private pullRequestsStore: PullRequestsStore,
    private commitsStore: CommitsStore,
    private bitbucketAPI: BitbucketAPI,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe(this.parseQueryParams.bind(this))
    this.subscribeToValueChanges(this.form.controls.overdueThreshold);
    this.subscribeToValueChanges(this.form.controls.daysWindow);
    this.subscribeToValueChanges(this.form.controls.workspace);
    this.subscribeToValueChanges(this.form.controls.project);
    this.subscribeToValueChanges(this.form.controls.access_token);
  }

  subscribeToValueChanges(control: FormControl) {
    var name = this.getControlName(control);
    this.route.queryParamMap.subscribe(params => {
      var queryParam = params.get(name);
      this.appStore.updateStoredQueryParam(name, queryParam);
      this.updateControlValue(control, queryParam);
    })
    control.valueChanges.subscribe(value => {
      this.appStore.updateStoredQueryParam(name, value);
      this.appStore.updateQueryParam(name, value);
    });
  }

  updateControlValue(control: FormControl, value: any) {
    if (value != control.value) {
      control.setValue(value)
    }
  }

  getControlName(control: FormControl): string {
    var parent = control.parent
    if (parent == null) {
      throw new Error("This control has no parent! There's no way to know what name it has")
    }
    var name = Object.entries(parent.controls).find(entry => entry[1] == control)?.[0]
    if (name == undefined) {
      throw new Error("Could not find the name of the control")
    }
    return name;
  }

  onFetchClick() {
    if (!this.form.valid || this.appStore.itemsLoading()) {
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

  parseQueryParams(params: ParamMap) {
    var workspace = params.get('workspace');
    if (workspace != this.appStore.queryParams['workspace']()) {
      this.form.controls.workspace.setValue(workspace);
    }
    var overdueThreshold = params.get('overdueThreshold');
    var overdueThresholdInt: number | null;
    if (typeof overdueThreshold === 'string') {
      overdueThresholdInt = parseInt(overdueThreshold)
    } else {
      overdueThresholdInt = null
    }
    this.form.controls.overdueThreshold.setValue(overdueThresholdInt)

    var daysWindow = params.get('daysWindow');
    var daysWindowInt: number | null;
    if (typeof daysWindow === 'string') {
      daysWindowInt = parseInt(daysWindow)
    } else {
      daysWindowInt = null
    }
    this.form.controls.daysWindow.setValue(daysWindowInt)

  }

  errorToString(httpErrorResponse: HttpErrorResponse): string {
    return httpErrorResponse.error.error.message
  }
}
