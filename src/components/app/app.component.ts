import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ApiInputsComponent } from "../api-inputs/api-inputs.component";
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AppStore } from '../../stores/app.store.service';
import { HttpErrorResponse } from '@angular/common/http';
import { GitCommitsComponent } from '../dashboard/git-commits/git-commits.component';
import { PullRequestsComponent } from '../dashboard/pull-requests/pull-requests.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ApiInputsComponent,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    PullRequestsComponent,
    GitCommitsComponent,
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  isSidenavOpen = signal<boolean>(false);

  constructor(
    matIconRegistry: MatIconRegistry,
    domSanitizer: DomSanitizer,
    protected appStore: AppStore,
  ) {
    matIconRegistry.addSvgIcon("bitbucket", domSanitizer.bypassSecurityTrustResourceUrl("assets/Bitbucket-Logo-blue.svg"))
  }

  openSidenavClicked() {
    this.isSidenavOpen.set(!this.isSidenavOpen())
  }

  errorToString(httpErrorResponse: HttpErrorResponse): string {
    return httpErrorResponse.error.error.message
  }
}
