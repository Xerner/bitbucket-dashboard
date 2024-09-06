import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { PullRequestsStore } from '../../../../stores/pull-requests.store.service';

@Component({
  selector: 'app-pr-submitted-by-author-chart',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective,
  ],
  templateUrl: './pr-submitted-by-author-chart.component.html',
})
export class PrSubmittedByAuthorChartComponent {
  constructor(
    protected pullRequestsStore: PullRequestsStore,
  ) {}
}
