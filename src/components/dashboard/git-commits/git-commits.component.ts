import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PullRequestsStore } from '../../../stores/pull-requests.store.service';
import { CommitsStore } from '../../../stores/commits.store.service';
import { AppStore, QueryParamKey } from '../../../stores/app.store.service';
import { InputsService } from '../../../services/inputs.service';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { GitHeatMapComponent } from './git-heat-map/git-heat-map.component';
import { MatButtonModule } from '@angular/material/button';
import { AnonymityService } from '../../../services/AnonymityService.service';

@Component({
  selector: 'app-git-commits',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    ReactiveFormsModule,
    GitHeatMapComponent,
    MatButtonModule,
  ],
  templateUrl: 'git-commits.component.html',
})
export class GitCommitsComponent {
  QueryParamKey = QueryParamKey

  constructor(
    protected pullRequestsStore: PullRequestsStore,
    protected commitsStore: CommitsStore,
    protected appStore: AppStore,
    protected inputsService: InputsService,
    protected anonymityService: AnonymityService
  ) { }
}
