import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { InputsComponent } from "../inputs/inputs.component";
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AppStore } from '../../stores/app.store.service';
import { HttpErrorResponse } from '@angular/common/http';
import { GitCommitsComponent } from '../dashboard/git-commits/git-commits.component';
import { MatTabsModule } from '@angular/material/tabs';
import { InputsService } from '../../services/inputs.service';
import { Features } from '../../settings/features/Features';
import { OpenPullRequestCounterComponent } from '../dashboard/pull-requests/open-pull-request-counter/open-pull-request-counter.component';
import { PrAgeChartComponent } from '../dashboard/pull-requests/pr-age-chart/pr-age-chart.component';
import { PrLastUpdatedChartComponent } from '../dashboard/pull-requests/pr-last-updated-chart/pr-last-updated-chart.component';
import { PrParticipationChartComponent } from '../dashboard/pull-requests/pr-participation-chart/pr-participation-chart.component';
import { PrSubmittedByAuthorChartComponent } from '../dashboard/pull-requests/pr-submitted-by-author-chart/pr-submitted-by-author-chart.component';
import { PullRequestTableComponent } from '../dashboard/pull-requests/pull-request-table/pull-request-table.component';
import { LastUpdatedPullRequestCounterComponent } from '../dashboard/pull-requests/last-updated-pull-request-counter/last-updated-pull-request-counter.component';
import { Views } from '../../settings/features/Views';
import { FeatureService } from '../../../repos/common/angular/feature-flags/feature.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    InputsComponent,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    GitCommitsComponent,
    MatTabsModule,
    MatTooltipModule,
    OpenPullRequestCounterComponent,
    LastUpdatedPullRequestCounterComponent,
    PullRequestTableComponent,
    PrLastUpdatedChartComponent,
    PrAgeChartComponent,
    PrSubmittedByAuthorChartComponent,
    PrParticipationChartComponent,
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  Features = Features;
  Views = Views;

  constructor(
    matIconRegistry: MatIconRegistry,
    domSanitizer: DomSanitizer,
    protected appStore: AppStore,
    protected inputsService: InputsService,
    protected featureService: FeatureService<Features, Views>,
  ) {
    matIconRegistry.addSvgIcon("bitbucket", domSanitizer.bypassSecurityTrustResourceUrl("assets/Bitbucket-Logo-blue.svg"))
  }

  errorToString(httpErrorResponse: HttpErrorResponse): string {
    this.inputsService.form.controls.features.value
    return httpErrorResponse.error.error.message
  }
}
