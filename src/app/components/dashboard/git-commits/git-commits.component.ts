import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PullRequestsStore } from '../../../stores/pull-requests.store.service';
import { CommitsStore } from '../../../stores/commits.store.service';
import { AppStore } from '../../../stores/app.store.service';
import { InputsService } from '../../../services/inputs.service';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { GitHeatMapComponent } from './git-heat-map/git-heat-map.component';
import { MatButtonModule } from '@angular/material/button';
import { BitbucketService } from '../../../services/bitbucket.service';

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
  constructor(
    protected pullRequestsStore: PullRequestsStore,
    protected commitsStore: CommitsStore,
    protected appStore: AppStore,
    protected inputsService: InputsService,
    private bitbucketService: BitbucketService,
  ) { }

  onFetchClicked() {
    this.bitbucketService.getCommits();
  }
}
