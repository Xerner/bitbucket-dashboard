import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { PullRequestsStore } from '../../../stores/pull-requests.store.service';
import { CommitsStore } from '../../../stores/commits.store.service';
import { AppStore } from '../../../stores/app.store.service';
import { InputsService } from '../../../services/inputs.service';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { GitHeatMapComponent } from './git-heat-map/git-heat-map.component';
import { MatButtonModule } from '@angular/material/button';
import { AnonymityService } from '../../../services/AnonymityService.service';
import { QueryParamsStore } from '../../../../repos/common/angular/services/query-params';
import { GlobalQueryParams } from '../../../settings/global-query-params';
import { DatetimePipe } from '../../../../repos/common/angular/pipes/datetime.pipe';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-git-commits',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    ReactiveFormsModule,
    GitHeatMapComponent,
    MatButtonModule,
    DatetimePipe,
  ],
  templateUrl: 'git-commits.component.html',
})
export class GitCommitsComponent {
  startDate = computed(() => DateTime.fromISO(this.queryParamsStore.params.commitsStartDate()[0]))
  endDate = computed(() => DateTime.fromISO(this.queryParamsStore.params.commitsEndDate()[0]))
  GlobalQueryParams = GlobalQueryParams
  
  constructor(
    protected pullRequestsStore: PullRequestsStore,
    protected commitsStore: CommitsStore,
    protected appStore: AppStore,
    protected queryParamsStore: QueryParamsStore<GlobalQueryParams>,
    protected inputsService: InputsService,
    protected anonymityService: AnonymityService
  ) {
    this.queryParamsStore.keys
  }
}
