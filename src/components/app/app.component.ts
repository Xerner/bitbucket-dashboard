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
import { Feature } from '../../models/Feature';
import { PullRequestCounterComponent } from '../dashboard/pull-requests/pull-request-counter/pull-request-counter.component';
import { PrAgeChartComponent } from '../dashboard/pull-requests/pr-age-chart/pr-age-chart.component';
import { PrLastUpdatedChartComponent } from '../dashboard/pull-requests/pr-last-updated-chart/pr-last-updated-chart.component';
import { PrParticipationChartComponent } from '../dashboard/pull-requests/pr-participation-chart/pr-participation-chart.component';
import { PrSubmittedByAuthorChartComponent } from '../dashboard/pull-requests/pr-submitted-by-author-chart/pr-submitted-by-author-chart.component';
import { PullRequestTableComponent } from '../dashboard/pull-requests/pull-request-table/pull-request-table.component';
import { FeatureGroup } from '../../models/FeatureGroup';
import { Views } from '../../models/Views';

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
    PullRequestCounterComponent,
    PullRequestTableComponent,
    PrLastUpdatedChartComponent,
    PrAgeChartComponent,
    PrSubmittedByAuthorChartComponent,
    PrParticipationChartComponent,
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  Features = Feature;
  FeatureGroups = FeatureGroup;

  constructor(
    matIconRegistry: MatIconRegistry,
    domSanitizer: DomSanitizer,
    protected appStore: AppStore,
    protected inputsService: InputsService,
  ) {
    matIconRegistry.addSvgIcon("bitbucket", domSanitizer.bypassSecurityTrustResourceUrl("assets/Bitbucket-Logo-blue.svg"))
  }

  errorToString(httpErrorResponse: HttpErrorResponse): string {
    return httpErrorResponse.error.error.message
  }

  hasFeature(feature: Feature) {
    var features = this.inputsService.form.controls.features.value;
    if (features == null) {
      return false;
    }
    return features.includes(feature);
  }

  hasFeatureInFeatureGroup(featureGroup: FeatureGroup) {
    var features = this.inputsService.form.controls.features.value;
    if (features == null) {
      return false;
    }
    return features.some(feature => Views[featureGroup].includes(feature));
  }
}
