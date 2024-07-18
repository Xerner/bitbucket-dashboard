import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AppStore } from '../../stores/app.store.service';
import { BitbucketAPI } from '../../services/bitbucket-api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { PullRequestsStore as PullRequestsStore } from '../../stores/pull-requests.store.service';
import { PullRequest } from '../../models/PullRequest';
import { combineLatest } from 'rxjs';
import { BitbucketRepository } from '../../models/BitbucketRepository';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';

@Component({
  selector: 'app-inputs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule
  ],
  templateUrl: "inputs.component.html",
})
export class InputsComponent implements OnInit {
  form = new FormGroup({
    workspace: new FormControl<string | null>(this.appStore.queryParams['workspace'](), [Validators.required]),
    access_token: new FormControl<string | null>(this.appStore.queryParams['access_token'](), [Validators.required]),
    overdueThreshold: new FormControl<number | null>(this.appStore.queryParams['overdueThreshold']()),
    daysWindow: new FormControl<number | null>(this.appStore.queryParams['daysWindow']())
  });

  error = signal<HttpErrorResponse | null>(null);

  constructor(
    protected appStore: AppStore,
    private pullRequestsStore: PullRequestsStore,
    private bitbucketAPI: BitbucketAPI,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe(this.parseQueryParams.bind(this))
    this.subscribeToValueChanges(this.form.controls.workspace);
    this.subscribeToValueChanges(this.form.controls.access_token);
    this.subscribeToValueChanges(this.form.controls.overdueThreshold);
    this.subscribeToValueChanges(this.form.controls.daysWindow);
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
    if (!this.form.valid || this.appStore.isLoading()) {
      return;
    }
    this.appStore.isLoading.set(true);
    var allRepositories: BitbucketRepository[] = [];
    var allPullRequests: PullRequest[] = [];
    this.bitbucketAPI.getRepositories().subscribe({
      next: (repositories) => {
        allRepositories = allRepositories.concat(repositories);
      },
      error: (error) => {
        this.error.set(error)
      },
      complete: () => {
        var pullRequestObservables = allRepositories.map(repository => this.bitbucketAPI.getPullRequests(repository.uuid));
        combineLatest(pullRequestObservables).subscribe({
          next: (pullRequests) => {
            allPullRequests = allPullRequests.concat(pullRequests.flat());
          },
          error: (error) => {
            this.error.set(error)
          },
          complete: () => {
            this.error.set(null)
            this.appStore.isLoading.set(false);
            this.pullRequestsStore.pullRequests.set(allPullRequests);
          }
        })
      }
    });
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
  }

  errorToString(): string {
    var error = this.error();
    if (error == null) {
      return "No error";
    }
    return JSON.stringify(error.error, null, 2)
  }
}
