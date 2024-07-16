import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { DashboardStore } from '../../stores/dashboard.store.service';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table'
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { deepClone } from '../../library/deep-clone';
import { AppStore } from '../../stores/app.store.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective,
    MatTableModule,
    MatSortModule
  ],
  templateUrl: "./dashboard.component.html",
})
export class DashboardComponent {
  @ViewChild(MatTable, { static: true }) table!: MatTable<any>;
  constructor(
    protected dashboardStore: DashboardStore,
    protected appStore: AppStore
  ) {}

  ngOnInit () {
    this.table.dataSource
  }

  sortPullRequests(sort: Sort) {
    var pullRequests = this.dashboardStore.pullRequests()
    if (pullRequests == null || pullRequests.length == 0) {
      return;
    }
    pullRequests.sort((pr1, pr2) => {
      return this.dashboardStore.pullRequestSorts[sort.active](pr1, pr2, sort.direction)
    });
    this.dashboardStore.pullRequests.set(deepClone(pullRequests));

  }


}
