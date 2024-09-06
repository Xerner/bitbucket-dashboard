import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { PullRequestsStore } from '../../../../stores/pull-requests.store.service';

@Component({
  selector: 'app-pr-age-chart',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective,
  ],
  templateUrl: './pr-age-chart.component.html',
})
export class PrAgeChartComponent {
  constructor(
    protected pullRequestsStore: PullRequestsStore,
  ) {}
}
