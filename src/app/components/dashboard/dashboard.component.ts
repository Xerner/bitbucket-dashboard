import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PullRequestTableComponent } from './pull-request-table/pull-request-table.component';
import { GitCommitsComponent } from './git-commits/git-commits.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    PullRequestTableComponent,
    GitCommitsComponent,
  ],
  templateUrl: "dashboard.component.html",
})
export class DashboardComponent {}
