import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { PullRequestsStore } from '../../../../stores/pull-requests.store.service';

@Component({
  selector: 'app-pr-participation-chart',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective,
  ],
  templateUrl: './pr-participation-chart.component.html',
})
export class PrParticipationChartComponent {
  constructor(
    protected pullRequestsStore: PullRequestsStore,
  ) {}
}
