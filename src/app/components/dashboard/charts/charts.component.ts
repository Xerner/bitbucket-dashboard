import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { PullRequestsStore } from '../../../stores/pull-requests.store.service';

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective,
  ],
  templateUrl: 'charts.component.html',
})
export class ChartsComponent {
  constructor(
    protected pullRequestsStore: PullRequestsStore
  ) {}
}
