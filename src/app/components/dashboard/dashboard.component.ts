import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PullRequestsComponent } from './pull-requests/pull-requests.component';
import { GitCommitsComponent } from './git-commits/git-commits.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    PullRequestsComponent,
    GitCommitsComponent,
  ],
  templateUrl: "dashboard.component.html",
})
export class DashboardComponent {}
