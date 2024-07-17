import { CommonModule } from '@angular/common';
import { Component, computed, ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { DashboardStore } from '../../stores/dashboard.store.service';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table'
import { MatSortModule, Sort } from '@angular/material/sort';
import { deepClone } from '../../library/deep-clone';
import { AppStore } from '../../stores/app.store.service';
import { DashboardService } from '../../services/dashboard.service';
import { PullRequest } from '../../models/PullRequest';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: "dashboard.component.html",
})
export class DashboardComponent {
  @ViewChild(MatTable) table!: MatTable<PullRequest>;

  pullRequestsCount = computed(() => {
    var pullRequests = this.dashboardStore.pullRequests()
    if (pullRequests == null) {
      return 0;
    }
    return pullRequests.length;
  })
  constructor(
    protected dashboardService: DashboardService,
    protected dashboardStore: DashboardStore,
    protected appStore: AppStore
  ) {}

  sortPullRequests(sort: Sort) {
    var pullRequests = this.dashboardStore.pullRequests()
    if (pullRequests == null || pullRequests.length == 0) {
      return;
    }
    pullRequests.sort((pr1, pr2) => {
      return this.dashboardService.pullRequestSorts[sort.active](pr1, pr2, sort.direction)
    });
    this.dashboardStore.pullRequests.set(deepClone(pullRequests));
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    (this.table.dataSource as MatTableDataSource<PullRequest>).filter = filterValue.trim().toLowerCase();
  }
}
