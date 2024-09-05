import { CommonModule } from '@angular/common';
import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AppStore, QueryParamKey } from '../../stores/app.store.service';
import { BitbucketAPI } from '../../services/bitbucket-api.service';
import { share } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InputsService } from '../../services/inputs.service';
import { BitbucketService } from '../../services/bitbucket.service';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-api-inputs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    MatSelectModule,
    MatProgressBarModule,
  ],
  templateUrl: "api-inputs.component.html",
})
export class ApiInputsComponent {
  @ViewChild('filterInput', { static: true })
  filterInput!: ElementRef<HTMLInputElement>;
  isLoadingProjects = signal<boolean>(false);

  constructor(
    protected appStore: AppStore,
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

  onFetchPullRequestsClicked() {
    this.bitbucketService.getPullRequests();
  }

  onFetchCommitsClicked() {
    this.bitbucketService.getCommits();
  }
}
