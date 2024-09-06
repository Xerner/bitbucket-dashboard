import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { PullRequestsStore } from '../../../../stores/pull-requests.store.service';

@Component({
  selector: 'app-pr-last-updated-chart',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective,
  ],
  templateUrl: './pr-last-updated-chart.component.html',
})
export class PrLastUpdatedChartComponent {
  constructor(
    protected pullRequestsStore: PullRequestsStore,
  ) {}
}
