import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { PullRequestsStore } from '../../../stores/pull-requests.store.service';
import { GitHeatMapComponent } from "./git-heat-map/git-heat-map.component";
import { CommitsStore } from '../../../stores/commits.store.service';
import { AppStore } from '../../../stores/app.store.service';

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective,
    GitHeatMapComponent
],
  templateUrl: 'charts.component.html',
})
export class ChartsComponent {
  constructor(
    protected pullRequestsStore: PullRequestsStore,
    protected commitsStore: CommitsStore,
    protected appStore: AppStore,
  ) {}
}
