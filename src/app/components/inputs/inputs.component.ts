import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AppStore } from '../../stores/app.store.service';
import { BitbucketAPI } from '../../services/bitbucket-api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DashboardStore as DashboardStore } from '../../stores/dashboard.store.service';
import { PullRequest } from '../../models/PullRequest';

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
    workspace: new FormControl<string | null>(this.appStore.workspace(), [Validators.required]),
    repository: new FormControl<string | null>(this.appStore.repository(), [Validators.required]),
    token: new FormControl<string | null>(this.appStore.token(), [Validators.required]),
    overdueThreshold: new FormControl<number | null>(this.appStore.overdueThreshold(), [Validators.required])
  });

  error = signal<HttpErrorResponse | null>(null);

  constructor(
    protected appStore: AppStore,
    private dashboardStore: DashboardStore,
    private bitbucketAPI: BitbucketAPI
  ) {}

  ngOnInit() {
    this.form.controls.workspace.valueChanges.subscribe((value) => this.appStore.workspace.set(value));
    this.form.controls.repository.valueChanges.subscribe((value) => this.appStore.repository.set(value));
    this.form.controls.token.valueChanges.subscribe((value) => this.appStore.token.set(value));
    this.form.controls.overdueThreshold.valueChanges.subscribe((value) => this.appStore.overdueThreshold.set(value));
  }

  onFetchClick() {
    if (!this.form.valid || this.appStore.isLoading()) {
      return;
    }
    this.appStore.isLoading.set(true);
    var allPullRequests: PullRequest[] = []
    this.bitbucketAPI.getPullRequests().subscribe({
      next: (pullRequests) => {
        allPullRequests = allPullRequests.concat(pullRequests);
      },
      error: (error) => {
        this.error.set(error)
      },
      complete: () => {
        this.error.set(null)
        this.appStore.isLoading.set(false);
        this.dashboardStore.pullRequests.set(allPullRequests);
      }
    });
  }

  errorToString(): string {
    var error = this.error();
    if (error == null) {
      return "No error";
    }
    return JSON.stringify(error.error, null, 2)
  }
}
