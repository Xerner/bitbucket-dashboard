import { CommonModule } from "@angular/common";
import { Component, computed } from "@angular/core";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatIconModule } from "@angular/material/icon";
import { DashboardService } from "../../../services/dashboard.service";
import { InputsService } from "../../../services/inputs.service";
import { PullRequestsService } from "../../../services/pull-requests.service";
import { AppStore } from "../../../stores/app.store.service";
import { PullRequestsStore } from "../../../stores/pull-requests.store.service";
import { PrAgeChartComponent } from "./pr-age-chart/pr-age-chart.component";
import { PrLastUpdatedChartComponent } from "./pr-last-updated-chart/pr-last-updated-chart.component";
import { PrParticipationChartComponent } from "./pr-participation-chart/pr-participation-chart.component";
import { PrSubmittedByAuthorChartComponent } from "./pr-submitted-by-author-chart/pr-submitted-by-author-chart.component";
import { PullRequestTableComponent } from "./pull-request-table/pull-request-table.component";

@Component({
  selector: 'app-pull-requests',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatIconModule,
    PullRequestTableComponent,
    PrLastUpdatedChartComponent,
    PrAgeChartComponent,
    PrSubmittedByAuthorChartComponent,
    PrParticipationChartComponent
],
  templateUrl: 'pull-requests.component.html',
})
export class PullRequestsComponent {

  allPullRequestsCount = computed(() => {
    var pullRequests = this.pullRequestsStore.pullRequests()
    if (pullRequests == null) {
      return 0;
    }
    return pullRequests.length;
  })
  openPullRequestsCount = computed(() => {
    var pullRequests = this.pullRequestsStore.openPullRequests()
    if (pullRequests == null) {
      return 0;
    }
    return pullRequests.length;
  })

  constructor(
    protected dashboardService: DashboardService,
    protected pullRequestsStore: PullRequestsStore,
    protected pullRequestService: PullRequestsService,
    protected inputsService: InputsService,
    protected appStore: AppStore,
  ) {}
}
