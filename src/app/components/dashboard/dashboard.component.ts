import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ChartsComponent } from './charts/charts.component';
import { PullRequestTableComponent } from './pull-request-table/pull-request-table.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    PullRequestTableComponent,
    ChartsComponent
  ],
  templateUrl: "dashboard.component.html",
})
export class DashboardComponent {}
